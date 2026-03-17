const excepcionAgendaService = require('../services/excepcionAgenda.service');

const listExcepcionesAgenda = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const result = await excepcionAgendaService.listExcepcionesAgenda(profesionalId, req.query);
    res.json({ ok: true, data: result.rows, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

const getExcepcionAgendaById = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    const data = await excepcionAgendaService.getExcepcionAgendaById(profesionalId, id);
    if (!data) return res.status(404).json({ ok: false, error: 'EXCEPCION_NO_ENCONTRADA' });
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
};

const createExcepcionAgenda = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const data = await excepcionAgendaService.createExcepcionAgenda(profesionalId, req.body);
    res.status(201).json({ ok: true, data, message: 'Excepción de agenda creada' });
  } catch (error) {
    next(error);
  }
};

const updateExcepcionAgenda = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    const data = await excepcionAgendaService.updateExcepcionAgenda(profesionalId, id, req.body);
    res.json({ ok: true, data, message: 'Excepción de agenda actualizada' });
  } catch (error) {
    if (error.message === 'EXCEPCION_NO_ENCONTRADA') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

const deleteExcepcionAgenda = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    await excepcionAgendaService.deleteExcepcionAgenda(profesionalId, id);
    res.json({ ok: true, message: 'Excepción de agenda eliminada' });
  } catch (error) {
    if (error.message === 'EXCEPCION_NO_ENCONTRADA') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

module.exports = {
  listExcepcionesAgenda,
  getExcepcionAgendaById,
  createExcepcionAgenda,
  updateExcepcionAgenda,
  deleteExcepcionAgenda,
};
