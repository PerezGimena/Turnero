const { Op } = require('sequelize');
const { sequelize, ObraSocial, ProfesionalObraSocial } = require('../models');

const listObrasSocialesProfesional = async (profesionalId, query = {}) => {
  const { busqueda, activa, pagina = 1, porPagina = 20 } = query;

  const where = {};
  if (busqueda) {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${busqueda}%` } },
      { codigo: { [Op.like]: `%${busqueda}%` } },
    ];
  }
  if (activa !== undefined) {
    where.activa = activa === 'true';
  }

  const limit = Math.min(Math.max(parseInt(porPagina, 10) || 20, 1), 100);
  const page = Math.max(parseInt(pagina, 10) || 1, 1);
  const offset = (page - 1) * limit;

  const { count, rows } = await ObraSocial.findAndCountAll({
    where,
    include: [
      {
        model: ProfesionalObraSocial,
        as: 'profesionalesObraSocial',
        where: { profesionalId },
        required: true,
        attributes: [],
      },
    ],
    order: [['nombre', 'ASC']],
    limit,
    offset,
    distinct: true,
    subQuery: false,
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

const createObraSocialProfesional = async (profesionalId, payload) => {
  const t = await sequelize.transaction();
  try {
    const { obraSocialId, nombre, codigo, activa = true } = payload;

    let obraSocial = null;
    if (obraSocialId) {
      obraSocial = await ObraSocial.findByPk(obraSocialId, { transaction: t });
      if (!obraSocial) throw new Error('OBRA_SOCIAL_NO_ENCONTRADA');
    } else {
      if (!nombre) throw new Error('NOMBRE_REQUERIDO');
      const [instance] = await ObraSocial.findOrCreate({
        where: { nombre },
        defaults: { codigo: codigo || null, activa: Boolean(activa) },
        transaction: t,
      });
      obraSocial = instance;
    }

    await ProfesionalObraSocial.findOrCreate({
      where: { profesionalId, obraSocialId: obraSocial.id },
      defaults: { profesionalId, obraSocialId: obraSocial.id },
      transaction: t,
    });

    await t.commit();
    return obraSocial;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const updateObraSocialProfesional = async (profesionalId, obraSocialId, payload) => {
  const vinculo = await ProfesionalObraSocial.findOne({
    where: { profesionalId, obraSocialId },
  });
  if (!vinculo) throw new Error('OBRA_SOCIAL_NO_ASIGNADA');

  const obraSocial = await ObraSocial.findByPk(obraSocialId);
  if (!obraSocial) throw new Error('OBRA_SOCIAL_NO_ENCONTRADA');

  const updates = {};
  if (payload.nombre !== undefined) updates.nombre = payload.nombre;
  if (payload.codigo !== undefined) updates.codigo = payload.codigo;
  if (payload.activa !== undefined) updates.activa = Boolean(payload.activa);

  await obraSocial.update(updates);
  return obraSocial;
};

const deleteObraSocialProfesional = async (profesionalId, obraSocialId) => {
  const deleted = await ProfesionalObraSocial.destroy({
    where: { profesionalId, obraSocialId },
  });
  if (!deleted) throw new Error('OBRA_SOCIAL_NO_ASIGNADA');
  return true;
};

module.exports = {
  listObrasSocialesProfesional,
  createObraSocialProfesional,
  updateObraSocialProfesional,
  deleteObraSocialProfesional,
};
