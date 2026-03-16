// ============================================================
//  TurnoSalud — Cron Jobs
//
//  Procesos automáticos:
//    1. Recordatorios de turno   → cada hora  (0 * * * *)
//    2. Detección de ausencias   → cada 30min (*/30 * * * *)
//
//  Para activar, llamar iniciarCronJobs() desde server.js.
// ============================================================
const cron = require('node-cron');
const { Op } = require('sequelize');

const { Turno, Paciente, Profesional, ConfiguracionRecordatorios } = require('../models');
const recordatorioService = require('./recordatorio.service');

// ─── Recordatorios de turno ──────────────────────────────────────────────────

/**
 * Busca turnos confirmados próximos y envía recordatorios según
 * la configuración de cada profesional (hasta 3 recordatorios con ventana de ±1h).
 */
const procesarRecordatoriosPendientes = async () => {
  const ahora  = new Date();
  const en48h  = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);

  const turnos = await Turno.findAll({
    where: {
      estado: 'confirmado',
      fecha: {
        [Op.between]: [
          ahora.toISOString().split('T')[0],
          en48h.toISOString().split('T')[0],
        ],
      },
    },
    include: [
      { model: Paciente, as: 'paciente' },
      {
        model: Profesional,
        as: 'profesional',
        include: [{ model: ConfiguracionRecordatorios, as: 'recordatorios' }],
      },
    ],
  });

  let enviados = 0;

  for (const turno of turnos) {
    const config = turno.profesional?.recordatorios;
    if (!config) continue;

    const paciente = turno.paciente;
    if (!paciente?.aceptaRecordatorios) continue;

    // Construir datetime del turno
    const turnoDateTime   = new Date(`${turno.fecha}T${turno.horaInicio}:00`);
    const horasHastaElTurno = (turnoDateTime - ahora) / (1000 * 60 * 60);

    const recordatorios = [
      { habilitado: config.recordatorio1Habilitado, horasAntes: config.recordatorio1HorasAntes },
      { habilitado: config.recordatorio2Habilitado, horasAntes: config.recordatorio2HorasAntes },
      { habilitado: config.recordatorio3Habilitado, horasAntes: config.recordatorio3HorasAntes },
    ];

    for (const rec of recordatorios) {
      if (!rec.habilitado || !rec.horasAntes) continue;
      // Ventana de ±1 hora alrededor de las "horasAntes" configuradas
      if (horasHastaElTurno <= rec.horasAntes + 1 && horasHastaElTurno > rec.horasAntes - 1) {
        try {
          await recordatorioService.enviarRecordatorio(
            turno,
            paciente,
            turno.profesional,
          );
          enviados++;
        } catch (err) {
          console.error(`[Cron] Error enviando recordatorio turno ${turno.id}:`, err.message);
        }
        break; // Solo un recordatorio por turno por ciclo
      }
    }
  }

  if (enviados > 0) {
    console.log(`[Cron] Recordatorios: ${enviados} enviados`);
  }
};

// ─── Detección de ausencias ──────────────────────────────────────────────────

/**
 * Marca como 'ausente' los turnos confirmados cuya horaFin ya pasó
 * (con un margen de gracia de 15 minutos) y envía notificación si está configurado.
 */
const detectarAusencias = async () => {
  const ahora  = new Date();
  const margenMs = 15 * 60 * 1000; // 15 minutos de gracia

  const turnos = await Turno.findAll({
    where: {
      estado: 'confirmado',
      // Turnos de hoy o anteriores (para no cargar días futuros)
      fecha: { [Op.lte]: ahora.toISOString().split('T')[0] },
    },
    include: [
      { model: Paciente, as: 'paciente' },
      {
        model: Profesional,
        as: 'profesional',
        include: [{ model: ConfiguracionRecordatorios, as: 'recordatorios' }],
      },
    ],
  });

  let ausentes = 0;

  for (const turno of turnos) {
    const turnoFin     = new Date(`${turno.fecha}T${turno.horaFin}:00`);
    const msPasados    = ahora - turnoFin;

    if (msPasados < margenMs) continue; // Aún dentro del margen de gracia

    try {
      await turno.update({ estado: 'ausente' });
      ausentes++;

      const config  = turno.profesional?.recordatorios;
      const paciente = turno.paciente;

      if (config?.recordatorioAusencia && paciente?.aceptaRecordatorios) {
        await recordatorioService.enviarNotificacionAusencia(
          turno,
          paciente,
          turno.profesional,
        );
      }
    } catch (err) {
      console.error(`[Cron] Error marcando ausente turno ${turno.id}:`, err.message);
    }
  }

  if (ausentes > 0) {
    console.log(`[Cron] Ausencias detectadas: ${ausentes}`);
  }
};

// ─── Init ────────────────────────────────────────────────────────────────────

/**
 * Inicia todos los cron jobs del sistema.
 * Llamar desde server.js después de que la BD esté conectada.
 */
const iniciarCronJobs = () => {
  // Recordatorios — cada hora en punto
  cron.schedule('0 * * * *', async () => {
    try {
      await procesarRecordatoriosPendientes();
    } catch (error) {
      console.error('[Cron] Error en recordatorios:', error.message);
    }
  });

  // Detección de ausencias — cada 30 minutos
  cron.schedule('*/30 * * * *', async () => {
    try {
      await detectarAusencias();
    } catch (error) {
      console.error('[Cron] Error en ausencias:', error.message);
    }
  });

  console.log('✅ Cron jobs iniciados (recordatorios: cada 1h | ausencias: cada 30min)');
};

module.exports = { iniciarCronJobs };
