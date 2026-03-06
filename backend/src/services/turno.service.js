const { sequelize, Turno, Paciente, Profesional, Pago } = require('../models');
const { generarReferenciaUnica } = require('./referencia.service');
const { calcularSlotsDisponibles } = require('./disponibilidad.service');
const recordatorioService = require('./recordatorio.service'); // Importamos servicio emails

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

    // 6. Determinar Estado
    const estadoInicial = profesional.confirmacionAutomatica ? 'confirmado' : 'pendiente';

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

    // 8. Crear Pago pendiente si es obligatorio
    if (profesional.pagoObligatorio) {
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

    // 9. Enviar Emails (Fuera de la transacción para no bloquear si falla el SMTP)
    if (estadoInicial === 'confirmado') {
      await recordatorioService.enviarConfirmacionReserva(nuevoTurno, paciente, profesional);
    } else {
      await recordatorioService.enviarNotificacionPendiente(nuevoTurno, paciente, profesional);
    }

    return {
      turno: nuevoTurno,
      paciente
    };

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  crearReserva
};
