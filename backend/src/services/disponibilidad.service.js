const { ConfiguracionDia, Turno, Profesional } = require('../models');
const { Op } = require('sequelize');

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

/**
 * Convierte un hora en formato HH:mm a minutos desde el inicio del día
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convierte minutos a formato HH:mm
 */
const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Calcula los slots disponibles para un profesional en una fecha específica
 */
const calcularSlotsDisponibles = async (profesionalId, fechaStr) => {
  // 1. Determinar día de la semana
  // fechaStr viene como YYYY-MM-DD
  const fechaDate = new Date(fechaStr + 'T00:00:00Z'); // Forzar UTC o tratar como local
  // Nota: new Date('2024-05-01') en JS suele ser UTC, cuidado con timezone.
  // Mejor parsear el string directamente para evitar shifts de timezone.
  const [year, month, day] = fechaStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const diaSemanaIndex = dateObj.getDay(); // 0 = domingo, 1 = lunes...
  const diaNombre = DIAS_SEMANA[diaSemanaIndex];

  // 2. Obtener configuración del profesional y del día
  const profesional = await Profesional.findByPk(profesionalId);
  if (!profesional) throw new Error('PROFESIONAL_NO_ENCONTRADO');

  const configDia = await ConfiguracionDia.findOne({
    where: {
      profesionalId,
      dia: diaNombre
    }
  });

  // Si no está configurado o no habilitado, no hay slots
  if (!configDia || !configDia.habilitado) {
    return [];
  }

  // 3. Generar todos los slots posibles
  const slotsPosibles = [];
  const inicioMin = timeToMinutes(configDia.horaInicio);
  const finMin = timeToMinutes(configDia.horaFin);
  const duracion = profesional.duracionTurno; // minutos
  const descanso = profesional.tiempoDescanso; // minutos
  const intervalo = duracion + descanso;

  for (let current = inicioMin; current + duracion <= finMin; current += intervalo) {
    slotsPosibles.push({
      horaInicio: minutesToTime(current),
      horaFin: minutesToTime(current + duracion),
      disponible: true
    });
  }

  // 4. Consultar turnos ocupados
  const turnosOcupados = await Turno.findAll({
    where: {
      profesionalId,
      fecha: fechaStr,
      estado: {
        [Op.notIn]: ['cancelado']
      }
    }
  });

  // 5. Marcar ocupados
  // Un slot está ocupado si se solapa con un turno existente
  // Simplificación: Asumimos que los turnos siempre encajan en la grilla generada.
  // Si se permitieran turnos fuera de grilla, la lógica de solapamiento sería:
  // (SlotInicio < TurnoFin) && (SlotFin > TurnoInicio)

  const slotsFinales = slotsPosibles.map(slot => {
    const slotInicio = timeToMinutes(slot.horaInicio);
    const slotFin = timeToMinutes(slot.horaFin);

    const estaOcupado = turnosOcupados.some(turno => {
      const turnoInicio = timeToMinutes(turno.horaInicio);
      const turnoFin = timeToMinutes(turno.horaFin);
      
      // Coincidencia exacta o solapamiento
      return (slotInicio < turnoFin) && (slotFin > turnoInicio);
    });

    return {
      hora: slot.horaInicio,
      disponible: !estaOcupado
    };
  });

  return slotsFinales;
};

module.exports = {
  calcularSlotsDisponibles
};
