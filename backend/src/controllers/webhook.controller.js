// ============================================================
//  TurnoSalud — Webhook Controller (MercadoPago)
//
//  POST /api/webhooks/mercadopago
//
//  MercadoPago envía notificaciones cuando un pago cambia de estado.
//  Validación HMAC opcional si MP_WEBHOOK_SECRET está definido.
//  Respondemos 200 inmediatamente y procesamos de forma asíncrona.
// ============================================================
const crypto    = require('crypto');
const Stripe = require('stripe');
const pagoService = require('../services/pago.service');
const { getIntegracionesConfig } = require('../services/integraciones.service');

/**
 * Valida la firma HMAC enviada por MercadoPago en el header x-signature.
 * Si MP_WEBHOOK_SECRET no está configurado, se omite la validación (solo dev).
 *
 * Formato de x-signature: "ts=TIMESTAMP,v1=HASH"
 * Mensaje a hashear:       "id:{dataId};request-id:{xRequestId};ts:{timestamp};"
 *
 * @returns {boolean} true si la firma es válida (o si no hay secret configurado)
 */
const _firmaValida = (req) => {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'] || '';
  const dataId     = req.body?.data?.id || '';

  if (!xSignature) return false;

  // Parsear "ts=TIMESTAMP,v1=HASH"
  const partes   = xSignature.split(',');
  const tsEntry  = partes.find((p) => p.startsWith('ts='));
  const v1Entry  = partes.find((p) => p.startsWith('v1='));

  if (!tsEntry || !v1Entry) return false;

  const ts     = tsEntry.split('=')[1];
  const v1Hash = v1Entry.split('=')[1];

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hmac     = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  return hmac === v1Hash;
};

/**
 * POST /api/webhooks/mercadopago
 * Recibe y procesa notificaciones de pago de MercadoPago.
 */
const recibirWebhookMP = async (req, res) => {
  const { type, data, action } = req.body;

  // Validar firma antes de procesar
  if (!_firmaValida(req)) {
    console.warn('[Webhook MP] ⚠️  Firma inválida — notificación ignorada');
    return res.status(401).json({ received: false, error: 'FIRMA_INVALIDA' });
  }

  // Responder 200 una vez validada la autenticidad para evitar reintentos innecesarios
  res.status(200).json({ received: true });

  if (type !== 'payment' || !data?.id) {
    // Ignorar notificaciones que no sean de pago (merchant_order, plan, etc.)
    return;
  }

  // Procesar de forma asíncrona (ya respondimos 200)
  setImmediate(async () => {
    try {
      await pagoService.procesarWebhookMP(data.id);
      console.log(`[Webhook MP] ✅ Payment ${data.id} procesado — acción: ${action}`);
    } catch (error) {
      console.error(`[Webhook MP] ❌ Error procesando payment ${data.id}:`, error.message);
    }
  });
};

/**
 * POST /api/webhooks/stripe
 * Recibe y procesa eventos Stripe con validación de firma.
 */
const recibirWebhookStripe = async (req, res) => {
  if (process.env.NODE_ENV === 'production' && !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ received: false, error: 'STRIPE_WEBHOOK_SECRET_NO_CONFIGURADO' });
  }

  try {
    const integraciones = await getIntegracionesConfig();
    const stripeSecretKey = integraciones?.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !webhookSecret || !stripeSecretKey) {
      return res.status(400).json({ received: false, error: 'STRIPE_SIGNATURE_INVALIDA' });
    }

    const stripe = new Stripe(stripeSecretKey);
    const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);

    setImmediate(async () => {
      try {
        await pagoService.procesarWebhookStripeEvent(event);
        console.log(`[Webhook Stripe] ✅ Evento procesado: ${event.type}`);
      } catch (error) {
        console.error(`[Webhook Stripe] ❌ Error procesando evento ${event.type}:`, error.message);
      }
    });

    return res.status(200).json({ received: true });
  } catch (error) {
    console.warn('[Webhook Stripe] ⚠️ Firma inválida o payload incorrecto:', error.message);
    return res.status(400).json({ received: false, error: 'STRIPE_EVENTO_INVALIDO' });
  }
};

module.exports = { recibirWebhookMP, recibirWebhookStripe };
