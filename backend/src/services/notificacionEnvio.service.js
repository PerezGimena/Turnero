const { Op } = require('sequelize');
const { Paciente, Turno, NotificacionEnvio } = require('../models');

const _validarPacienteDelProfesional = async (profesionalId, pacienteId) => {
  if (!pacienteId) return;
  const paciente = await Paciente.findOne({ where: { id: pacienteId, profesionalId } });
  if (!paciente) throw new Error('PACIENTE_NO_ENCONTRADO');
};

const _validarTurnoDelProfesional = async (profesionalId, turnoId) => {
  if (!turnoId) return;
  const turno = await Turno.findOne({ where: { id: turnoId, profesionalId } });
  if (!turno) throw new Error('TURNO_NO_ENCONTRADO');
};

const listNotificacionesEnvio = async (profesionalId, query = {}) => {
  const { estado, canal, tipo, fechaDesde, fechaHasta, pagina = 1, porPagina = 50 } = query;

  const where = { profesionalId };
  if (estado) where.estado = estado;
  if (canal) where.canal = canal;
  if (tipo) where.tipo = tipo;

  if (fechaDesde || fechaHasta) {
    where.createdAt = {};
    if (fechaDesde) where.createdAt[Op.gte] = new Date(fechaDesde);
    if (fechaHasta) where.createdAt[Op.lte] = new Date(fechaHasta);
  }

  const limit = Math.min(Math.max(parseInt(porPagina, 10) || 50, 1), 200);
  const page = Math.max(parseInt(pagina, 10) || 1, 1);
  const offset = (page - 1) * limit;

  const { count, rows } = await NotificacionEnvio.findAndCountAll({
    where,
    include: [
      { model: Paciente, as: 'paciente', attributes: ['id', 'nombre', 'apellido', 'email'] },
      { model: Turno, as: 'turno', attributes: ['id', 'referencia', 'fecha', 'horaInicio'] },
    ],
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

const getNotificacionEnvioById = async (profesionalId, id) => {
  return NotificacionEnvio.findOne({
    where: { id, profesionalId },
    include: [
      { model: Paciente, as: 'paciente', attributes: ['id', 'nombre', 'apellido', 'email'] },
      { model: Turno, as: 'turno', attributes: ['id', 'referencia', 'fecha', 'horaInicio'] },
    ],
  });
};

const createNotificacionEnvio = async (profesionalId, payload) => {
  await _validarPacienteDelProfesional(profesionalId, payload.pacienteId);
  await _validarTurnoDelProfesional(profesionalId, payload.turnoId);
  return NotificacionEnvio.create({ ...payload, profesionalId });
};

const updateNotificacionEnvio = async (profesionalId, id, payload) => {
  const record = await NotificacionEnvio.findOne({ where: { id, profesionalId } });
  if (!record) throw new Error('NOTIFICACION_NO_ENCONTRADA');

  if (payload.pacienteId !== undefined) {
    await _validarPacienteDelProfesional(profesionalId, payload.pacienteId);
  }
  if (payload.turnoId !== undefined) {
    await _validarTurnoDelProfesional(profesionalId, payload.turnoId);
  }

  await record.update(payload);
  return record;
};

const deleteNotificacionEnvio = async (profesionalId, id) => {
  const deleted = await NotificacionEnvio.destroy({ where: { id, profesionalId } });
  if (!deleted) throw new Error('NOTIFICACION_NO_ENCONTRADA');
  return true;
};

module.exports = {
  listNotificacionesEnvio,
  getNotificacionEnvioById,
  createNotificacionEnvio,
  updateNotificacionEnvio,
  deleteNotificacionEnvio,
};
