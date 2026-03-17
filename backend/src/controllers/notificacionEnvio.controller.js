const notificacionEnvioService = require('../services/notificacionEnvio.service');

const listNotificacionesEnvio = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const result = await notificacionEnvioService.listNotificacionesEnvio(profesionalId, req.query);
    res.json({ ok: true, data: result.rows, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

const getNotificacionEnvioById = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    const data = await notificacionEnvioService.getNotificacionEnvioById(profesionalId, id);
    if (!data) return res.status(404).json({ ok: false, error: 'NOTIFICACION_NO_ENCONTRADA' });
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
};

const createNotificacionEnvio = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const data = await notificacionEnvioService.createNotificacionEnvio(profesionalId, req.body);
    res.status(201).json({ ok: true, data, message: 'Notificación de envío creada' });
  } catch (error) {
    if (error.message === 'PACIENTE_NO_ENCONTRADO' || error.message === 'TURNO_NO_ENCONTRADO') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

const updateNotificacionEnvio = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    const data = await notificacionEnvioService.updateNotificacionEnvio(profesionalId, id, req.body);
    res.json({ ok: true, data, message: 'Notificación de envío actualizada' });
  } catch (error) {
    if (['NOTIFICACION_NO_ENCONTRADA', 'PACIENTE_NO_ENCONTRADO', 'TURNO_NO_ENCONTRADO'].includes(error.message)) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

const deleteNotificacionEnvio = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    await notificacionEnvioService.deleteNotificacionEnvio(profesionalId, id);
    res.json({ ok: true, message: 'Notificación de envío eliminada' });
  } catch (error) {
    if (error.message === 'NOTIFICACION_NO_ENCONTRADA') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

module.exports = {
  listNotificacionesEnvio,
  getNotificacionEnvioById,
  createNotificacionEnvio,
  updateNotificacionEnvio,
  deleteNotificacionEnvio,
};
