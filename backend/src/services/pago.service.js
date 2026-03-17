// ============================================================
//  TurnoSalud — Servicio de Pagos MercadoPago (SaaS multi-tenant)
//
//  Cada profesional tiene SUS PROPIAS credenciales de MP guardadas
//  en Profesional.pagoCredenciales (JSON cifrado en campo TEXT).
//
//  Variables de entorno requeridas:
//    APP_URL              → URL pública del frontend (ej: https://turnosalud.com)
//    API_URL              → URL pública del backend  (ej: https://api.turnosalud.com)
//    MP_WEBHOOK_SECRET    → Clave secreta configurada en el panel de MP para validación HMAC
//    MP_PLATFORM_ACCESS_TOKEN (opcional) → Token de la cuenta plataforma para webhooks
//
//  Formato external_reference: "TRN-XXXXX|{profesionalId}"
//    Permite identificar el profesional dentro del handler de webhooks.
// ============================================================

const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Stripe = require('stripe');
const { Pago, Turno, Profesional } = require('../models');
const { getConnection } = require('./oauthConnection.service');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Construye un cliente MP con el accessToken del profesional.
 */
const _clienteMP = (accessToken) =>
  new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });

/**
 * Extrae el accessToken de MP de las credenciales guardadas en el profesional.
 * Soporta formato: { mercadopago: { accessToken: "..." } }
 */
const _getAccessToken = (profesional) => {
  if (!profesional.pagoCredenciales) return null;
  try {
    const creds = JSON.parse(profesional.pagoCredenciales);
    return creds?.mercadopago?.accessToken || null;
  } catch {
    return null;
  }
};

const _getStripeAccessTokenLegacy = (profesional) => {
  if (!profesional.pagoCredenciales) return null;
  try {
    const creds = JSON.parse(profesional.pagoCredenciales);
    return creds?.stripe?.accessToken || creds?.stripe?.secretKey || null;
  } catch {
    return null;
  }
};

const _getProviderAccessToken = async (profesional, provider) => {
  const conn = await getConnection(profesional.id, provider);
  if (conn?.accessToken && conn.status !== 'desconectado') {
    return conn.accessToken;
  }

  if (provider === 'mercadopago') return _getAccessToken(profesional);
  if (provider === 'stripe') return _getStripeAccessTokenLegacy(profesional);
  return null;
};

/**
 * Mapea el estado de pago de MP al estado interno del sistema.
 */
const _estadoMP = (mpStatus) => ({
  approved:   'aprobado',
  pending:    'pendiente',
  in_process: 'pendiente',
  authorized: 'pendiente',
  rejected:   'rechazado',
  cancelled:  'rechazado',
  refunded:   'reembolsado',
  charged_back: 'reembolsado',
}[mpStatus] || 'pendiente');

const _estadoStripe = (status) => ({
  succeeded: 'aprobado',
  processing: 'pendiente',
  requires_payment_method: 'rechazado',
  requires_action: 'pendiente',
  canceled: 'rechazado',
  refunded: 'reembolsado',
}[status] || 'pendiente');

// ─── Procesamiento interno de pago ──────────────────────────────────────────

/**
 * Dado un objeto `payment` ya obtenido de la API de MP y el profesional,
 * crea o actualiza el registro Pago y actualiza el Turno.
 * Es idempotente: no crea duplicados si ya existe el transaccionId.
 *
 * @returns {{ pago: Pago, turno: Turno }}
 */
const _aplicarPago = async (payment, profesional) => {
  // Idempotencia: si ya procesamos este paymentId, retornar el registro existente
  const pagoExistente = await Pago.findOne({
    where: { transaccionId: String(payment.id) },
  });
  if (pagoExistente) {
    const turnoExistente = await Turno.findByPk(pagoExistente.turnoId);
    return { pago: pagoExistente, turno: turnoExistente };
  }

  // El external_reference tiene el formato "TRN-XXXXX|profesionalId"
  const turnoReferencia = payment.external_reference?.split('|')[0];
  if (!turnoReferencia) throw new Error('EXTERNAL_REFERENCE_INVALIDA');

  const turno = await Turno.findOne({
    where: { referencia: turnoReferencia, profesionalId: profesional.id },
  });
  if (!turno) throw new Error('TURNO_NO_ENCONTRADO');

  const estadoPago = _estadoMP(payment.status);

  const pago = await Pago.create({
    turnoId:       turno.id,
    profesionalId: profesional.id,
    pacienteId:    turno.pacienteId,
    monto:         payment.transaction_amount || Number(profesional.montoPorTurno),
    moneda:        profesional.moneda || 'ARS',
    pasarela:      'mercadopago',
    estado:        estadoPago,
    transaccionId: String(payment.id),
  });

  if (estadoPago === 'aprobado') {
    await turno.update({ estado: 'confirmado' });
  }

  return { pago, turno };
};

const _aplicarPagoStripe = async ({
  transaccionId,
  profesional,
  turnoReferencia,
  amount,
  currency,
  status,
}) => {
  if (!transaccionId) throw new Error('TRANSACCION_STRIPE_INVALIDA');

  const pagoExistente = await Pago.findOne({
    where: { pasarela: 'stripe', transaccionId: String(transaccionId) },
  });
  if (pagoExistente) {
    const turnoExistente = await Turno.findByPk(pagoExistente.turnoId);
    return { pago: pagoExistente, turno: turnoExistente };
  }

  const turno = await Turno.findOne({
    where: { referencia: turnoReferencia, profesionalId: profesional.id },
  });
  if (!turno) throw new Error('TURNO_NO_ENCONTRADO');

  const estadoPago = _estadoStripe(status);
  const pago = await Pago.create({
    turnoId: turno.id,
    profesionalId: profesional.id,
    pacienteId: turno.pacienteId,
    monto: Number(amount || profesional.montoPorTurno || 0),
    moneda: (currency || profesional.moneda || 'ARS').toUpperCase(),
    pasarela: 'stripe',
    estado: estadoPago,
    transaccionId: String(transaccionId),
  });

  if (estadoPago === 'aprobado') {
    await turno.update({ estado: 'confirmado' });
  }

  return { pago, turno };
};

// ─── API pública del servicio ────────────────────────────────────────────────

/**
 * Crea una preferencia de pago en MercadoPago para un turno.
 *
 * @param {object} turno       - Instancia Turno de Sequelize
 * @param {object} paciente    - Instancia Paciente de Sequelize
 * @param {object} profesional - Instancia Profesional de Sequelize (con pagoCredenciales)
 * @returns {{ preferenceId: string, initPoint: string }}
 */
const crearPreferenciaMP = async (turno, paciente, profesional) => {
  const accessToken = await _getProviderAccessToken(profesional, 'mercadopago');
  if (!accessToken) throw new Error('SIN_CREDENCIALES_MP');

  const apiUrl = process.env.API_URL  || 'http://localhost:3001';
  const appUrl = process.env.APP_URL  || process.env.APP_DOMAIN || 'http://localhost:5173';

  const client     = _clienteMP(accessToken);
  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      items: [
        {
          id:          turno.referencia,
          title:       `Turno con ${profesional.nombre} ${profesional.apellido}`,
          description: profesional.especialidad || 'Consulta médica',
          quantity:    1,
          unit_price:  Number(profesional.montoPorTurno),
          currency_id: profesional.moneda || 'ARS',
        },
      ],
      payer: {
        name:    paciente.nombre,
        surname: paciente.apellido,
        email:   paciente.email,
      },
      back_urls: {
        success: `${appUrl}/${profesional.slug}/reservar/confirmado`,
        failure: `${appUrl}/${profesional.slug}/reservar/formulario`,
        pending: `${appUrl}/${profesional.slug}/reservar/pendiente`,
      },
      auto_return:          'approved',
      // Codificar profesionalId para poder resolver el profesional en el webhook
      external_reference:   `${turno.referencia}|${profesional.id}`,
      notification_url:     `${apiUrl}/api/webhooks/mercadopago`,
      statement_descriptor: 'TURNOSALUD',
    },
  });

  return { preferenceId: response.id, initPoint: response.init_point };
};

/**
 * Verifica un pago por su paymentId usando las credenciales del profesional dado.
 * Se llama desde el back_url de MP (cuando el paciente vuelve tras pagar).
 *
 * @param {string} paymentId   - ID del pago en MercadoPago (viene del query param de back_url)
 * @param {object} profesional - Instancia Profesional de Sequelize
 * @returns {{ pago: Pago, turno: Turno }}
 */
const verificarPagoMP = async (paymentId, profesional) => {
  const accessToken = await _getProviderAccessToken(profesional, 'mercadopago');
  if (!accessToken) throw new Error('SIN_CREDENCIALES_MP');

  const client        = _clienteMP(accessToken);
  const paymentClient = new Payment(client);
  const payment       = await paymentClient.get({ id: paymentId });

  return _aplicarPago(payment, profesional);
};

const crearCheckoutStripe = async (turno, paciente, profesional) => {
  const accessToken = await _getProviderAccessToken(profesional, 'stripe');
  if (!accessToken) throw new Error('SIN_CREDENCIALES_STRIPE');

  const appUrl = process.env.APP_URL || process.env.APP_DOMAIN || 'http://localhost:5173';
  const stripe = new Stripe(accessToken);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: paciente.email,
    success_url: `${appUrl}/${profesional.slug}/reservar/confirmado?stripe_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${profesional.slug}/reservar/formulario`,
    metadata: {
      turnoReferencia: turno.referencia,
      profesionalId: String(profesional.id),
    },
    payment_intent_data: {
      metadata: {
        turnoReferencia: turno.referencia,
        profesionalId: String(profesional.id),
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: String(profesional.moneda || 'ARS').toLowerCase(),
          unit_amount: Math.round(Number(profesional.montoPorTurno || 0) * 100),
          product_data: {
            name: `Turno con ${profesional.nombre} ${profesional.apellido}`,
            description: profesional.especialidad || 'Consulta médica',
          },
        },
      },
    ],
  });

  return { sessionId: session.id, checkoutUrl: session.url };
};

const verificarPagoStripe = async (sessionId, profesional) => {
  const accessToken = await _getProviderAccessToken(profesional, 'stripe');
  if (!accessToken) throw new Error('SIN_CREDENCIALES_STRIPE');

  const stripe = new Stripe(accessToken);
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent'],
  });

  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;
  const paymentIntentStatus = typeof session.payment_intent === 'object'
    ? session.payment_intent?.status
    : (session.payment_status === 'paid' ? 'succeeded' : 'processing');

  if (!session?.metadata?.turnoReferencia) {
    throw new Error('EXTERNAL_REFERENCE_INVALIDA');
  }

  return _aplicarPagoStripe({
    transaccionId: paymentIntentId || session.id,
    profesional,
    turnoReferencia: session.metadata.turnoReferencia,
    amount: Number((session.amount_total || 0) / 100),
    currency: session.currency,
    status: paymentIntentStatus,
  });
};

/**
 * Procesa una notificación de webhook de MercadoPago.
 * Resuelve el profesional desde el external_reference del pago.
 *
 * Estrategia de resolución de credenciales:
 *   1. Requiere MP_PLATFORM_ACCESS_TOKEN en env para leer el pago notificado.
 *   2. Usa external_reference para resolver el profesional y aplicar el pago internamente.
 *
 * @param {string|number} paymentId - ID del pago notificado por MP
 */
const procesarWebhookMP = async (paymentId) => {
  // Idempotencia rápida antes de llamar a MP
  const pagoExistente = await Pago.findOne({
    where: { transaccionId: String(paymentId) },
  });
  if (pagoExistente) {
    return { ok: true, mensaje: 'Pago ya procesado anteriormente' };
  }

  let payment = null;

  const platformToken = process.env.MP_PLATFORM_ACCESS_TOKEN;
  if (!platformToken) {
    throw new Error('MP_PLATFORM_ACCESS_TOKEN_REQUERIDO');
  }

  const client = _clienteMP(platformToken);
  const paymentClient = new Payment(client);
  payment = await paymentClient.get({ id: paymentId });

  if (!payment) throw new Error('PAGO_NO_ENCONTRADO_EN_MP');

  // Resolver el profesional desde external_reference: "TRN-XXXXX|profesionalId"
  const parts = payment.external_reference?.split('|');
  if (!parts || parts.length < 2) throw new Error('EXTERNAL_REFERENCE_INVALIDA');

  const profesionalId = parseInt(parts[1], 10);
  if (isNaN(profesionalId)) throw new Error('PROFESIONAL_ID_INVALIDO');

  const profesional = await Profesional.findByPk(profesionalId);
  if (!profesional) throw new Error('PROFESIONAL_NO_ENCONTRADO');

  return _aplicarPago(payment, profesional);
};

const procesarWebhookStripeEvent = async (event) => {
  const type = event?.type;
  if (!type) return { ok: true, mensaje: 'Evento Stripe sin tipo' };

  if (type === 'checkout.session.completed') {
    const session = event.data?.object;
    if (!session || session.payment_status !== 'paid') {
      return { ok: true, mensaje: 'Checkout no pagado, ignorado' };
    }

    const profesionalId = Number(session.metadata?.profesionalId);
    const turnoReferencia = session.metadata?.turnoReferencia;
    if (!profesionalId || !turnoReferencia) {
      throw new Error('METADATA_STRIPE_INCOMPLETA');
    }

    const profesional = await Profesional.findByPk(profesionalId);
    if (!profesional) throw new Error('PROFESIONAL_NO_ENCONTRADO');

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

    return _aplicarPagoStripe({
      transaccionId: paymentIntentId || session.id,
      profesional,
      turnoReferencia,
      amount: Number((session.amount_total || 0) / 100),
      currency: session.currency,
      status: 'succeeded',
    });
  }

  if (type === 'payment_intent.succeeded') {
    const intent = event.data?.object;
    const profesionalId = Number(intent?.metadata?.profesionalId);
    const turnoReferencia = intent?.metadata?.turnoReferencia;
    if (!profesionalId || !turnoReferencia) {
      return { ok: true, mensaje: 'PaymentIntent sin metadata de negocio' };
    }

    const profesional = await Profesional.findByPk(profesionalId);
    if (!profesional) throw new Error('PROFESIONAL_NO_ENCONTRADO');

    return _aplicarPagoStripe({
      transaccionId: intent.id,
      profesional,
      turnoReferencia,
      amount: Number((intent.amount_received || intent.amount || 0) / 100),
      currency: intent.currency,
      status: intent.status,
    });
  }

  return { ok: true, mensaje: `Evento Stripe ignorado: ${type}` };
};

module.exports = {
  crearPreferenciaMP,
  verificarPagoMP,
  crearCheckoutStripe,
  verificarPagoStripe,
  procesarWebhookMP,
  procesarWebhookStripeEvent,
};
