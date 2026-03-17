const { Op } = require('sequelize');
const { ExcepcionAgenda } = require('../models');

const listExcepcionesAgenda = async (profesionalId, query = {}) => {
  const { fechaDesde, fechaHasta, tipo, pagina = 1, porPagina = 50 } = query;

  const where = { profesionalId };
  if (tipo) where.tipo = tipo;

  if (fechaDesde || fechaHasta) {
    where.fecha = {};
    if (fechaDesde) where.fecha[Op.gte] = fechaDesde;
    if (fechaHasta) where.fecha[Op.lte] = fechaHasta;
  } else {
    const hoy = new Date();
    const hasta = new Date();
    hasta.setDate(hasta.getDate() + 30);
    where.fecha = {
      [Op.between]: [
        hoy.toISOString().split('T')[0],
        hasta.toISOString().split('T')[0],
      ],
    };
  }

  const limit = Math.min(Math.max(parseInt(porPagina, 10) || 50, 1), 200);
  const page = Math.max(parseInt(pagina, 10) || 1, 1);
  const offset = (page - 1) * limit;

  const { count, rows } = await ExcepcionAgenda.findAndCountAll({
    where,
    order: [['fecha', 'ASC'], ['horaInicio', 'ASC']],
    limit,
    offset,
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

const getExcepcionAgendaById = async (profesionalId, id) => {
  return ExcepcionAgenda.findOne({ where: { id, profesionalId } });
};

const createExcepcionAgenda = async (profesionalId, payload) => {
  return ExcepcionAgenda.create({ ...payload, profesionalId });
};

const updateExcepcionAgenda = async (profesionalId, id, payload) => {
  const record = await ExcepcionAgenda.findOne({ where: { id, profesionalId } });
  if (!record) throw new Error('EXCEPCION_NO_ENCONTRADA');
  await record.update(payload);
  return record;
};

const deleteExcepcionAgenda = async (profesionalId, id) => {
  const deleted = await ExcepcionAgenda.destroy({ where: { id, profesionalId } });
  if (!deleted) throw new Error('EXCEPCION_NO_ENCONTRADA');
  return true;
};

module.exports = {
  listExcepcionesAgenda,
  getExcepcionAgendaById,
  createExcepcionAgenda,
  updateExcepcionAgenda,
  deleteExcepcionAgenda,
};
