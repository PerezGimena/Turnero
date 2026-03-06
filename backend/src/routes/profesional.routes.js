const express = require('express');
const router = express.Router();
const profesionalController = require('../controllers/profesional.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { z } = require('zod');

// Middleware de protección general para este router
router.use(authMiddleware('profesional'));

// Schemas Zod locales (ideal mover a schemas/profesional.schema.js)
const rechazoSchema = z.object({
  motivo: z.string().min(5, 'El motivo es requerido (min 5 chars)')
});

const turnoManualSchema = z.object({
  fecha: z.string(),
  horaInicio: z.string(),
  paciente: z.object({
    nombre: z.string(),
    apellido: z.string(),
    email: z.string().email(),
    telefono: z.string()
  }),
  modalidad: z.enum(['presencial', 'virtual', 'ambas']).optional()
});

// Turnos
router.get('/turnos', profesionalController.getTurnos);
router.post('/turnos', validate(turnoManualSchema), profesionalController.crearTurnoManual);
router.get('/turnos/:id', profesionalController.getTurnoById);
router.patch('/turnos/:id/confirmar', profesionalController.confirmarTurno);
router.patch('/turnos/:id/rechazar', validate(rechazoSchema), profesionalController.rechazarTurno);

// Pacientes
router.get('/pacientes', profesionalController.getPacientes);
router.get('/pacientes/:id', profesionalController.getPacienteById);

// Perfil
router.get('/perfil', profesionalController.getPerfil);
router.put('/perfil', profesionalController.updatePerfil);

// Dashboard
router.get('/dashboard/metricas', profesionalController.getMetricasDashboard);

// Recordatorios
router.post('/recordatorios/prueba', profesionalController.enviarRecordatorioPrueba);

module.exports = router;
