const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pago.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas las rutas de este router requieren autenticación de profesional
router.use(authMiddleware('profesional'));

router.get('/', pagoController.getPagos);
router.get('/metricas', pagoController.getMetricasPagos);

module.exports = router;
