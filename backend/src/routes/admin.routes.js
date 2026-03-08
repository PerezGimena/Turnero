const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { z } = require('zod');

// Middleware: Solo admins
router.use(authMiddleware('admin'));

// Schemas
const createProfSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug inválido (solo minúsculas, números y guiones)'),
  especialidad: z.string().optional()
});

const estadoSchema = z.object({
  planActivo: z.boolean()
});

// Rutas Profesionales
router.get('/profesionales', adminController.getProfesionales);
router.post('/profesionales', validate(createProfSchema), adminController.createProfesional);
router.put('/profesionales/:id', adminController.updateProfesional);
router.patch('/profesionales/:id/estado', validate(estadoSchema), adminController.updateEstadoProfesional);
router.delete('/profesionales/:id', adminController.deleteProfesional);

// Impersonar
router.post('/profesionales/:id/impersonar', adminController.impersonarProfesional);

// Dashboard
router.get('/dashboard/metricas', adminController.getMetricasGlobales);

module.exports = router;
