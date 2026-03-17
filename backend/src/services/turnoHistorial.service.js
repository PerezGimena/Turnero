const { Op } = require('sequelize');
const { Turno, TurnoHistorial } = require('../models');

const _validarTurnoDelProfesional = async (profesionalId, turnoId) => {
  const turno = await Turno.findOne({ where: { id: turnoId, profesionalId } });
  if (!turno) throw new Error('TURNO_NO_ENCONTRADO');
  return turno;
};

const listTurnoHistorial = async (profesionalId, query = {}) => {
  const { turnoId, estadoNuevo, fechaDesde, fechaHasta, pagina = 1, porPagina = 50 } = query;

  const where = {};
  if (estadoNuevo) where.estadoNuevo = estadoNuevo;
  if (fechaDesde || fechaHasta) {
    where.createdAt = {};
    if (fechaDesde) where.createdAt[Op.gte] = new Date(fechaDesde);
    if (fechaHasta) where.createdAt[Op.lte] = new Date(fechaHasta);
  }

  const includeTurno = {
    model: Turno,
    as: 'turno',
    where: { profesionalId },
    required: true,
    attributes: ['id', 'referencia', 'fecha', 'horaInicio', 'estado'],
  };

  if (turnoId) includeTurno.where.id = turnoId;

  const limit = Math.min(Math.max(parseInt(porPagina, 10) || 50, 1), 200);
  const page = Math.max(parseInt(pagina, 10) || 1, 1);
  const offset = (page - 1) * limit;

  const { count, rows } = await TurnoHistorial.findAndCountAll({
    where,
    include: [includeTurno],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  return {
    rows,
    pagination: {
      total: count,
      pagina: page,
      porPagina: limit,
      totalPaginas: Math.ceil(count / limit),
    },
  };
};

const getTurnoHistorialById = async (profesionalId, id) => {
  return TurnoHistorial.findOne({
    where: { id },
    include: [
      {
        model: Turno,
        as: 'turno',
        where: { profesionalId },
        required: true,
      },
    ],
  });
};

const createTurnoHistorial = async (profesionalId, payload) => {
  await _validarTurnoDelProfesional(profesionalId, payload.turnoId);

  return TurnoHistorial.create({
    ...payload,
    actorTipo: 'profesional',
    actorId: profesionalId,
  });
};

const updateTurnoHistorial = async (profesionalId, id, payload) => {
  const record = await getTurnoHistorialById(profesionalId, id);
  if (!record) throw new Error('HISTORIAL_NO_ENCONTRADO');

  if (payload.turnoId && Number(payload.turnoId) !== Number(record.turnoId)) {
    await _validarTurnoDelProfesional(profesionalId, payload.turnoId);
  }

  await record.update(payload);
  return record;
};

const deleteTurnoHistorial = async (profesionalId, id) => {
  const record = await getTurnoHistorialById(profesionalId, id);
  if (!record) throw new Error('HISTORIAL_NO_ENCONTRADO');
  await record.destroy();
  return true;
};

module.exports = {
  listTurnoHistorial,
  getTurnoHistorialById,
  createTurnoHistorial,
  updateTurnoHistorial,
  deleteTurnoHistorial,
};
