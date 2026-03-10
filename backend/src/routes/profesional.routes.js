const express = require('express');
const router = express.Router();
const profesionalController = require('../controllers/profesional.controller');
const recordatorioController = require('../controllers/recordatorio.controller');
const pagoController = require('../controllers/pago.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { uploadFotoPerfil } = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { z } = require('zod');
const { Profesional } = require('../models');

// Middleware de protección general para este router
router.use(authMiddleware('profesional'));

// Schemas Zod locales
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

const pacienteManualSchema = z.object({
    nombre: z.string(),
    apellido: z.string(),
    email: z.string().email(),
    telefono: z.string(),
    dni: z.string().optional()
});

// --- RUTAS TURNOS ---
router.get('/turnos', profesionalController.getTurnos);

router.get('/turnos/hoy', (req, res, next) => {
    req.query.fecha = new Date().toISOString().split('T')[0];
    next();
}, profesionalController.getTurnos);

router.get('/turnos/pendientes', (req, res, next) => {
    req.query.estado = 'pendiente';
    next();
}, profesionalController.getTurnos);

router.get('/turnos/:id', profesionalController.getTurnoById);
router.post('/turnos', validate(turnoManualSchema), profesionalController.crearTurnoManual);
router.patch('/turnos/:id/confirmar', profesionalController.confirmarTurno);
router.patch('/turnos/:id/rechazar', validate(rechazoSchema), profesionalController.rechazarTurno);
router.patch('/turnos/:id/ausente', profesionalController.marcarAusente);
router.patch('/turnos/:id/cancelar', profesionalController.cancelarTurno);
router.patch('/turnos/:id/reprogramar', profesionalController.reprogramarTurno);

// --- PACIENTES ---
router.get('/pacientes', profesionalController.getPacientes);
router.get('/pacientes/:id', profesionalController.getPacienteById);
router.post('/pacientes', validate(pacienteManualSchema), profesionalController.crearPacienteManual);
router.post('/pacientes/:id/mensaje', profesionalController.enviarMensajePaciente);

// --- DASHBOARD ---
router.get('/dashboard/metricas', profesionalController.getMetricasDashboard);

// --- PERFIL ---
router.get('/perfil', profesionalController.getPerfil);
router.put('/perfil', profesionalController.updatePerfil);

// Subida de foto
router.post('/perfil/foto', uploadFotoPerfil, async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ ok: false, error: 'NO_FILE', message: 'No se subió ningún archivo' });
        }
        
        const profesionalId = req.user.sub;
        await Profesional.update(
            { fotoPerfil: req.file.path }, // Se guarda el path relativo
            { where: { id: profesionalId } }
        );

        res.json({ 
            ok: true, 
            message: 'Foto de perfil actualizada', 
            data: { 
                filename: req.file.filename,
                path: req.file.path 
            } 
        });
    } catch (error) {
        next(error);
    }
});

// --- RECORDATORIOS ---
router.get('/recordatorios/config', recordatorioController.getRecordatorios);
router.put('/recordatorios/config', recordatorioController.updateRecordatorios);
router.post('/recordatorios/prueba', recordatorioController.enviarPrueba);

// --- PAGOS ---
router.get('/pagos', pagoController.getPagos);

// --- PAGOS CONFIG ---
router.get('/pagos-config', profesionalController.getPerfil);
router.put('/pagos-config', profesionalController.updatePerfil);

// --- CREDENCIALES PAGO ---
router.get('/pagos-credenciales', profesionalController.getEstadoCredencialesPago);
router.post('/pagos-credenciales', profesionalController.guardarCredencialesPago);
router.delete('/pagos-credenciales', profesionalController.desconectarPasarela);
router.get('/pagos-credenciales/mp-oauth-url', profesionalController.getMpOAuthUrl);
router.get('/pagos-credenciales/stripe-oauth-url', profesionalController.getStripeOAuthUrl);

module.exports = router;
