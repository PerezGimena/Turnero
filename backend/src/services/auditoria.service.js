const { Op } = require('sequelize');
const { Auditoria } = require('../models');

const listAuditoriasProfesional = async (profesionalId, query = {}) => {
  const { entidad, accion, fechaDesde, fechaHasta, pagina = 1, porPagina = 50 } = query;

  const where = {
    actorTipo: 'profesional',
    actorId: profesionalId,
  };

  if (entidad) where.entidad = entidad;
  if (accion) where.accion = accion;

  if (fechaDesde || fechaHasta) {
    where.createdAt = {};
    if (fechaDesde) where.createdAt[Op.gte] = new Date(fechaDesde);
    if (fechaHasta) where.createdAt[Op.lte] = new Date(fechaHasta);
  }

  const limit = Math.min(Math.max(parseInt(porPagina, 10) || 50, 1), 200);
  const page = Math.max(parseInt(pagina, 10) || 1, 1);
  const offset = (page - 1) * limit;

  const { count, rows } = await Auditoria.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
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

const getAuditoriaProfesionalById = async (profesionalId, id) => {
  return Auditoria.findOne({
    where: {
      id,
      actorTipo: 'profesional',
      actorId: profesionalId,
    },
  });
};

const createAuditoriaProfesional = async (profesionalId, payload) => {
  return Auditoria.create({
    ...payload,
    actorTipo: 'profesional',
    actorId: profesionalId,
  });
};

const updateAuditoriaProfesional = async (profesionalId, id, payload) => {
  const record = await getAuditoriaProfesionalById(profesionalId, id);
  if (!record) throw new Error('AUDITORIA_NO_ENCONTRADA');

  const updates = { ...payload };
  delete updates.actorTipo;
  delete updates.actorId;

  await record.update(updates);
  return record;
};

const deleteAuditoriaProfesional = async (profesionalId, id) => {
  const deleted = await Auditoria.destroy({
    where: {
      id,
      actorTipo: 'profesional',
      actorId: profesionalId,
    },
  });
  if (!deleted) throw new Error('AUDITORIA_NO_ENCONTRADA');
  return true;
};

module.exports = {
  listAuditoriasProfesional,
  getAuditoriaProfesionalById,
  createAuditoriaProfesional,
  updateAuditoriaProfesional,
  deleteAuditoriaProfesional,
};
