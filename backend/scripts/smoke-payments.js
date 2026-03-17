require('dotenv').config();

const http = require('http');
const Stripe = require('stripe');
const app = require('../src/app');
const { sequelize, Profesional, Paciente, Turno, Pago } = require('../src/models');
const pagoService = require('../src/services/pago.service');

const fail = (message) => {
  throw new Error(message);
};

const expect = (condition, message) => {
  if (!condition) fail(message);
};

const request = ({ path, method = 'POST', payload, headers = {} }) =>
  new Promise((resolve, reject) => {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
    const server = app.listen(0, () => {
      const port = server.address().port;
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            ...headers,
          },
        },
        (res) => {
          let responseBody = '';
          res.on('data', (chunk) => {
            responseBody += chunk;
          });
          res.on('end', () => {
            server.close(() => resolve({ status: res.statusCode, body: responseBody }));
          });
        }
      );

      req.on('error', (error) => {
        server.close(() => reject(error));
      });

      req.write(body);
      req.end();
    });
  });

const testStripeWebhookSigned = async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousStripeSecret = process.env.STRIPE_SECRET_KEY;
  const previousStripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  process.env.NODE_ENV = 'development';
  process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_local_smoke';
  process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_local_smoke';

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const payload = JSON.stringify({
    id: 'evt_smoke_customer_created',
    object: 'event',
    type: 'customer.created',
    data: { object: { id: 'cus_smoke_1' } },
  });

  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET,
  });

  const response = await request({
    path: '/api/webhooks/stripe',
    payload,
    headers: { 'stripe-signature': signature },
  });

  expect(response.status === 200, `Stripe webhook esperado 200 y devolvio ${response.status}`);

  process.env.NODE_ENV = previousNodeEnv;
  process.env.STRIPE_SECRET_KEY = previousStripeSecret;
  process.env.STRIPE_WEBHOOK_SECRET = previousStripeWebhookSecret;
};

const testMpWebhookRejectsInvalidSignatureInProd = async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousMpSecret = process.env.MP_WEBHOOK_SECRET;

  process.env.NODE_ENV = 'production';
  process.env.MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || 'mp_smoke_secret';

  const response = await request({
    path: '/api/webhooks/mercadopago',
    payload: { type: 'payment', data: { id: '123' } },
  });

  expect(response.status === 401, `Webhook MP esperado 401 y devolvio ${response.status}`);

  process.env.NODE_ENV = previousNodeEnv;
  process.env.MP_WEBHOOK_SECRET = previousMpSecret;
};

const testStripeInternalE2E = async () => {
  const ts = Date.now();
  const slug = `smoke-stripe-${ts}`;
  const email = `smoke.stripe.${ts}@test.local`;
  const referencia = `SMK${String(ts).slice(-10)}`;

  let profesional;
  let paciente;
  let turno;

  try {
    profesional = await Profesional.create({
      slug,
      nombre: 'Smoke',
      apellido: 'Stripe',
      email,
      passwordHash: 'hash',
      especialidad: 'Clinica',
      modalidad: 'presencial',
      pagoObligatorio: true,
      pasarelaPago: 'stripe',
      montoPorTurno: 15000,
      moneda: 'ARS',
      planActivo: true,
    });

    paciente = await Paciente.create({
      profesionalId: profesional.id,
      nombre: 'Paciente',
      apellido: 'Smoke',
      email: `paciente.smoke.${ts}@test.local`,
      telefono: '1122334455',
      tieneObraSocial: false,
    });

    turno = await Turno.create({
      referencia,
      profesionalId: profesional.id,
      pacienteId: paciente.id,
      fecha: '2026-12-31',
      horaInicio: '10:00',
      horaFin: '10:30',
      duracion: 30,
      modalidad: 'presencial',
      estado: 'pendiente_pago',
      creadoManualmente: false,
    });

    const event = {
      id: `evt_smoke_${ts}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: `cs_smoke_${ts}`,
          payment_status: 'paid',
          amount_total: 1500000,
          currency: 'ars',
          payment_intent: `pi_smoke_${ts}`,
          metadata: {
            profesionalId: String(profesional.id),
            turnoReferencia: referencia,
          },
        },
      },
    };

    await pagoService.procesarWebhookStripeEvent(event);

    const turnoAfter = await Turno.findByPk(turno.id);
    const pagos = await Pago.findAll({
      where: {
        profesionalId: profesional.id,
        pasarela: 'stripe',
        transaccionId: `pi_smoke_${ts}`,
      },
    });

    await pagoService.procesarWebhookStripeEvent(event);

    const pagosAfterSecondEvent = await Pago.findAll({
      where: {
        profesionalId: profesional.id,
        pasarela: 'stripe',
        transaccionId: `pi_smoke_${ts}`,
      },
    });

    expect(turnoAfter && turnoAfter.estado === 'confirmado', 'Turno no quedo confirmado tras webhook Stripe');
    expect(pagos.length === 1, `Se esperaba 1 pago stripe y hay ${pagos.length}`);
    expect(String(pagos[0].estado) === 'aprobado', `Estado de pago esperado aprobado y fue ${pagos[0].estado}`);
    expect(
      pagosAfterSecondEvent.length === 1,
      `Fallo idempotencia Stripe: pagos despues de 2 eventos = ${pagosAfterSecondEvent.length}`
    );
  } finally {
    try {
      if (turno) await Pago.destroy({ where: { turnoId: turno.id } });
    } catch (_) {}
    try {
      if (turno) await Turno.destroy({ where: { id: turno.id } });
    } catch (_) {}
    try {
      if (paciente) await Paciente.destroy({ where: { id: paciente.id } });
    } catch (_) {}
    try {
      if (profesional) await Profesional.destroy({ where: { id: profesional.id } });
    } catch (_) {}
  }
};

const main = async () => {
  try {
    await testStripeWebhookSigned();
    await testMpWebhookRejectsInvalidSignatureInProd();
    await testStripeInternalE2E();

    console.log('SMOKE_PAYMENTS_OK');
  } catch (error) {
    console.error('SMOKE_PAYMENTS_FAIL', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

main();
