const express = require('express');
const router = express.Router();
const publicoController = require('../controllers/publico.controller');
const validate = require('../middlewares/validate.middleware');
const { z } = require('zod');

// Schema validación Reserva
const reservaSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:mm)'),
  modalidad: z.enum(['presencial', 'virtual', 'ambas']).optional(),
  motivoConsulta: z.string().optional(),
  paciente: z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    email: z.string().email(),
    telefono: z.string().min(6),
    dni: z.string().optional(),
    obraSocial: z.string().optional(),
    numeroAfiliado: z.string().optional()
  })
});

// Rutas Públicas
router.get('/:slug', publicoController.getPerfilProfesional);
router.get('/:slug/horarios', publicoController.getSlotsDisponibles);
router.post('/:slug/reservar', validate(reservaSchema), publicoController.crearReserva);
router.get('/:slug/turno/:id', publicoController.getTurno);
router.patch('/:slug/turno/:id/cancelar', publicoController.cancelarTurnoPublico);
router.patch('/:slug/turno/:id/reprogramar', publicoController.reprogramarTurnoPublico);

// Flujo de pago MercadoPago (Checkout Pro)
// POST /:slug/pago/preferencia → crea preferencia MP y retorna { preferenceId, initPoint }
router.post('/:slug/pago/preferencia', publicoController.crearPreferenciaPago);
// POST /:slug/pago/verificar   → verifica pago luego del back_url de MP
router.post('/:slug/pago/verificar', publicoController.verificarPago);

module.exports = router;
