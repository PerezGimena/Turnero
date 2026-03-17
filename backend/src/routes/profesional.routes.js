const express = require('express');
const router = express.Router();
const profesionalController = require('../controllers/profesional.controller');
const recordatorioController = require('../controllers/recordatorio.controller');
const pagoController = require('../controllers/pago.controller');
const obraSocialController = require('../controllers/obraSocial.controller');
const excepcionAgendaController = require('../controllers/excepcionAgenda.controller');
const turnoHistorialController = require('../controllers/turnoHistorial.controller');
const notificacionEnvioController = require('../controllers/notificacionEnvio.controller');
const auditoriaController = require('../controllers/auditoria.controller');
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

const obraSocialCreateSchema = z.object({
    obraSocialId: z.number().int().positive().optional(),
    nombre: z.string().min(2).optional(),
    codigo: z.string().max(50).optional(),
    activa: z.boolean().optional(),
}).refine((data) => data.obraSocialId || data.nombre, {
    message: 'Debes enviar obraSocialId o nombre',
});

const obraSocialUpdateSchema = z.object({
    nombre: z.string().min(2).optional(),
    codigo: z.string().max(50).optional(),
    activa: z.boolean().optional(),
});

const excepcionAgendaCreateSchema = z.object({
    fecha: z.string().min(10),
    horaInicio: z.string().min(4).max(5).optional(),
    horaFin: z.string().min(4).max(5).optional(),
    tipo: z.enum(['bloqueo', 'sobreturno', 'feriado']).optional(),
    motivo: z.string().max(2000).optional(),
});

const excepcionAgendaUpdateSchema = z.object({
    fecha: z.string().min(10).optional(),
    horaInicio: z.string().min(4).max(5).optional(),
    horaFin: z.string().min(4).max(5).optional(),
    tipo: z.enum(['bloqueo', 'sobreturno', 'feriado']).optional(),
    motivo: z.string().max(2000).optional(),
});

const turnoHistorialCreateSchema = z.object({
    turnoId: z.number().int().positive(),
    estadoAnterior: z.enum(['pendiente', 'pendiente_pago', 'confirmado', 'cancelado', 'ausente', 'completado']).optional(),
    estadoNuevo: z.enum(['pendiente', 'pendiente_pago', 'confirmado', 'cancelado', 'ausente', 'completado']),
    motivo: z.string().max(2000).optional(),
});

const turnoHistorialUpdateSchema = z.object({
    turnoId: z.number().int().positive().optional(),
    estadoAnterior: z.enum(['pendiente', 'pendiente_pago', 'confirmado', 'cancelado', 'ausente', 'completado']).optional(),
    estadoNuevo: z.enum(['pendiente', 'pendiente_pago', 'confirmado', 'cancelado', 'ausente', 'completado']).optional(),
    motivo: z.string().max(2000).optional(),
});

const notificacionEnvioCreateSchema = z.object({
    pacienteId: z.number().int().positive().optional(),
    turnoId: z.number().int().positive().optional(),
    canal: z.enum(['email', 'whatsapp']),
    tipo: z.enum(['confirmacion', 'recordatorio', 'ausencia', 'pendiente_pago', 'otro']).optional(),
    estado: z.enum(['pendiente', 'enviado', 'fallido']).optional(),
    errorMensaje: z.string().max(3000).optional(),
    enviadoAt: z.string().optional(),
});

const notificacionEnvioUpdateSchema = z.object({
    pacienteId: z.number().int().positive().optional(),
    turnoId: z.number().int().positive().optional(),
    canal: z.enum(['email', 'whatsapp']).optional(),
    tipo: z.enum(['confirmacion', 'recordatorio', 'ausencia', 'pendiente_pago', 'otro']).optional(),
    estado: z.enum(['pendiente', 'enviado', 'fallido']).optional(),
    errorMensaje: z.string().max(3000).optional(),
    enviadoAt: z.string().optional(),
});

const auditoriaCreateSchema = z.object({
    entidad: z.string().min(2).max(80),
    entidadId: z.number().int().positive().optional(),
    accion: z.string().min(2).max(80),
    cambiosAntes: z.any().optional(),
    cambiosDespues: z.any().optional(),
    metadata: z.any().optional(),
});

const auditoriaUpdateSchema = z.object({
    entidad: z.string().min(2).max(80).optional(),
    entidadId: z.number().int().positive().optional(),
    accion: z.string().min(2).max(80).optional(),
    cambiosAntes: z.any().optional(),
    cambiosDespues: z.any().optional(),
    metadata: z.any().optional(),
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

// --- OBRAS SOCIALES (TENANT-SAFE) ---
router.get('/obras-sociales', obraSocialController.listObrasSociales);
router.post('/obras-sociales', validate(obraSocialCreateSchema), obraSocialController.createObraSocial);
router.put('/obras-sociales/:id', validate(obraSocialUpdateSchema), obraSocialController.updateObraSocial);
router.delete('/obras-sociales/:id', obraSocialController.deleteObraSocial);

// --- EXCEPCIONES DE AGENDA (TENANT-SAFE) ---
router.get('/agenda-excepciones', excepcionAgendaController.listExcepcionesAgenda);
router.get('/agenda-excepciones/:id', excepcionAgendaController.getExcepcionAgendaById);
router.post('/agenda-excepciones', validate(excepcionAgendaCreateSchema), excepcionAgendaController.createExcepcionAgenda);
router.put('/agenda-excepciones/:id', validate(excepcionAgendaUpdateSchema), excepcionAgendaController.updateExcepcionAgenda);
router.delete('/agenda-excepciones/:id', excepcionAgendaController.deleteExcepcionAgenda);

// --- HISTORIAL DE TURNOS (TENANT-SAFE) ---
router.get('/turnos-historial', turnoHistorialController.listTurnoHistorial);
router.get('/turnos-historial/:id', turnoHistorialController.getTurnoHistorialById);
router.post('/turnos-historial', validate(turnoHistorialCreateSchema), turnoHistorialController.createTurnoHistorial);
router.put('/turnos-historial/:id', validate(turnoHistorialUpdateSchema), turnoHistorialController.updateTurnoHistorial);
router.delete('/turnos-historial/:id', turnoHistorialController.deleteTurnoHistorial);

// --- LOG DE NOTIFICACIONES (TENANT-SAFE) ---
router.get('/notificaciones-envios', notificacionEnvioController.listNotificacionesEnvio);
router.get('/notificaciones-envios/:id', notificacionEnvioController.getNotificacionEnvioById);
router.post('/notificaciones-envios', validate(notificacionEnvioCreateSchema), notificacionEnvioController.createNotificacionEnvio);
router.put('/notificaciones-envios/:id', validate(notificacionEnvioUpdateSchema), notificacionEnvioController.updateNotificacionEnvio);
router.delete('/notificaciones-envios/:id', notificacionEnvioController.deleteNotificacionEnvio);

// --- AUDITORIA (TENANT-SAFE) ---
router.get('/auditorias', auditoriaController.listAuditorias);
router.get('/auditorias/:id', auditoriaController.getAuditoriaById);
router.post('/auditorias', validate(auditoriaCreateSchema), auditoriaController.createAuditoria);
router.put('/auditorias/:id', validate(auditoriaUpdateSchema), auditoriaController.updateAuditoria);
router.delete('/auditorias/:id', auditoriaController.deleteAuditoria);

module.exports = router;
