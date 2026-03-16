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

module.exports = router;
