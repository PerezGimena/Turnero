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
const pagoService = require('../services/pago.service');

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
  if (!secret) return true; // Sin secret → solo para desarrollo

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
  // Responder 200 de inmediato para evitar reintentos innecesarios de MP
  res.status(200).json({ received: true });

  const { type, data, action } = req.body;

  // Validar firma antes de procesar
  if (!_firmaValida(req)) {
    console.warn('[Webhook MP] ⚠️  Firma inválida — notificación ignorada');
    return;
  }

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

module.exports = { recibirWebhookMP };
