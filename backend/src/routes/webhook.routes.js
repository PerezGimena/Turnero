// ============================================================
//  TurnoSalud — Webhook Routes
//  Base: /api/webhooks
// ============================================================
const express           = require('express');
const router            = express.Router();
const webhookController = require('../controllers/webhook.controller');

// POST /api/webhooks/mercadopago
// MercadoPago notifica cambios de estado de pagos aquí.
// ⚠️  Esta ruta NO tiene auth middleware (es pública para MP).
//  La autenticidad se valida por firma HMAC (x-signature header).
router.post('/mercadopago', webhookController.recibirWebhookMP);

// POST /api/webhooks/stripe
// Stripe notifica eventos de checkout/payment_intent aquí.
router.post('/stripe', webhookController.recibirWebhookStripe);

module.exports = router;
