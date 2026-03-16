const { sequelize, Turno, Paciente, Profesional, Pago } = require('../models');
const { generarReferenciaUnica } = require('./referencia.service');
const { calcularSlotsDisponibles } = require('./disponibilidad.service');
const recordatorioService = require('./recordatorio.service');
const pagoService = require('./pago.service');

const crearReserva = async (slugProfesional, datosReserva) => {
  const {
    fecha, // "2024-05-01"
    horaInicio, // "10:00"
    modalidad,
    motivoConsulta,
    paciente: datosPaciente
  } = datosReserva;

  // Iniciar transacción
  const t = await sequelize.transaction();

  try {
    // 1. Obtener profesional
    const profesional = await Profesional.findOne({ where: { slug: slugProfesional } }, { transaction: t });
    if (!profesional) {
      throw new Error('PROFESIONAL_NO_ENCONTRADO');
    }

    // 2. Verificar disponibilidad (Race condition check)
    // Volvemos a calcular slots o verificamos específicamente este horario
    const slots = await calcularSlotsDisponibles(profesional.id, fecha);
    const slotBuscado = slots.find(s => s.hora === horaInicio);

    if (!slotBuscado || !slotBuscado.disponible) {
      throw new Error('SLOT_NO_DISPONIBLE');
    }

    // 3. Gestionar Paciente (Buscar o Crear)
    let paciente = await Paciente.findOne({
      where: {
        email: datosPaciente.email,
        profesionalId: profesional.id
      },
      transaction: t // IMPORTANTE: Pasar transacción
    });

    if (!paciente) {
      if (!datosPaciente.nombre || !datosPaciente.apellido || !datosPaciente.telefono) {
          throw new Error('DATOS_PACIENTE_INCOMPLETOS');
      }

      paciente = await Paciente.create({
        profesionalId: profesional.id,
        nombre: datosPaciente.nombre,
        apellido: datosPaciente.apellido,
        email: datosPaciente.email,
        telefono: datosPaciente.telefono,
        dni: datosPaciente.dni || null,
        obraSocial: datosPaciente.obraSocial || null,
        numeroAfiliado: datosPaciente.numeroAfiliado || null,
        tiemeObraSocial: !!datosPaciente.obraSocial
      }, { transaction: t });
    }

    // 4. Calcular hora fin
    const [h, m] = horaInicio.split(':').map(Number);
    // Usar fecha base arbitraria para sumar minutos
    const dateCalc = new Date(2000, 0, 1, h, m);
    dateCalc.setMinutes(dateCalc.getMinutes() + profesional.duracionTurno);
    const horaFin = `${dateCalc.getHours().toString().padStart(2, '0')}:${dateCalc.getMinutes().toString().padStart(2, '0')}`;

    // 5. Generar Referencia
    const referencia = await generarReferenciaUnica();

    // 6. Determinar Estado inicial
    // Si el profesional requiere pago y tiene MercadoPago configurado → pendiente_pago
    // Si tiene confirmación automática → confirmado
    // En cualquier otro caso → pendiente (el profesional confirma manualmente)
    const tieneMPConfigurado =
      profesional.pagoObligatorio &&
      profesional.pasarelaPago === 'mercadopago' &&
      !!profesional.pagoCredenciales;

    let estadoInicial;
    if (tieneMPConfigurado) {
      estadoInicial = 'pendiente_pago';
    } else if (profesional.confirmacionAutomatica) {
      estadoInicial = 'confirmado';
    } else {
      estadoInicial = 'pendiente';
    }

    // 7. Crear Turno
    const nuevoTurno = await Turno.create({
      referencia,
      profesionalId: profesional.id,
      pacienteId: paciente.id,
      fecha,
      horaInicio,
      horaFin,
      duracion: profesional.duracionTurno,
      modalidad: modalidad || profesional.modalidad || 'presencial',
      estado: estadoInicial,
      motivoConsulta,
      creadoManualmente: false
    }, { transaction: t });

    // 8. Crear registro Pago pendiente solo para pagos presenciales o pasarelas no-MP
    // Para MercadoPago el registro Pago lo crea el webhook when payment arrives
    if (profesional.pagoObligatorio && profesional.pasarelaPago !== 'mercadopago') {
      await Pago.create({
        turnoId: nuevoTurno.id,
        profesionalId: profesional.id,
        pacienteId: paciente.id,
        monto: profesional.montoPorTurno,
        moneda: profesional.moneda,
        pasarela: profesional.pasarelaPago,
        estado: 'pendiente'
      }, { transaction: t });
    }

    await t.commit();

    // 9. Generar preferencia de MercadoPago (fuera de transacción — llama a API externa)
    let pagoUrl = null;
    let preferenceId = null;

    if (estadoInicial === 'pendiente_pago') {
      try {
        const pref = await pagoService.crearPreferenciaMP(nuevoTurno, paciente, profesional);
        pagoUrl = pref.initPoint;
        preferenceId = pref.preferenceId;
      } catch (mpErr) {
        // El turno ya fue creado. Loguear el error — el admin puede reprocesar luego.
        console.error('[TurnoService] Error al crear preferencia MP:', mpErr.message);
      }
    }

    // 10. Enviar notificaciones (fuera de la transacción para no bloquear si falla SMTP/WA)
    if (estadoInicial === 'confirmado') {
      await recordatorioService.enviarConfirmacionReserva(nuevoTurno, paciente, profesional);
    } else if (estadoInicial === 'pendiente_pago') {
      await recordatorioService.enviarNotificacionPendiente(nuevoTurno, paciente, profesional);
    } else {
      await recordatorioService.enviarNotificacionPendiente(nuevoTurno, paciente, profesional);
    }

    return {
      turno: nuevoTurno,
      paciente,
      pagoUrl,
      preferenceId,
    };

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  crearReserva
};
