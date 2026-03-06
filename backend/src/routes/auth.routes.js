const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { loginSchema } = require('../schemas/auth.schema');

// Rutas Profesional
router.post('/profesional/login', validate(loginSchema), authController.loginProfesional);
router.post('/profesional/registro', authController.registroProfesional);
router.get('/profesional/me', authMiddleware('profesional'), authController.getMeProfesional);

// Rutas Admin
router.post('/admin/login', validate(loginSchema), authController.loginAdmin);
router.get('/admin/me', authMiddleware('admin'), authController.getMeAdmin);

module.exports = router;
