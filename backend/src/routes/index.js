const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const publicoRoutes = require('./publico.routes');
const profesionalRoutes = require('./profesional.routes');
const pagoRoutes = require('./pago.routes');
const adminRoutes = require('./admin.routes');
const webhookRoutes = require('./webhook.routes');
const profesionalController = require('../controllers/profesional.controller');

router.use('/auth', authRoutes);
router.use('/publico', publicoRoutes);
router.use('/profesional/pagos', pagoRoutes);
router.use('/profesional', profesionalRoutes);
router.use('/admin', adminRoutes);
// Webhooks externos (MP, etc.) — sin auth JWT
router.use('/webhooks', webhookRoutes);
// Callback OAuth MercadoPago — sin auth JWT (MP redirige aquí con ?code=&state=)
router.get('/mp/oauth/callback', profesionalController.mpOAuthCallback);
// Callback OAuth Stripe Connect — sin auth JWT (Stripe redirige aquí con ?code=&state=)
router.get('/stripe/oauth/callback', profesionalController.stripeOAuthCallback);

module.exports = router;
