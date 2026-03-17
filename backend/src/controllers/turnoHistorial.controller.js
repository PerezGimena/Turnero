const turnoHistorialService = require('../services/turnoHistorial.service');

const listTurnoHistorial = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const result = await turnoHistorialService.listTurnoHistorial(profesionalId, req.query);
    res.json({ ok: true, data: result.rows, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

const getTurnoHistorialById = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    const data = await turnoHistorialService.getTurnoHistorialById(profesionalId, id);
    if (!data) return res.status(404).json({ ok: false, error: 'HISTORIAL_NO_ENCONTRADO' });
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
};

const createTurnoHistorial = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const data = await turnoHistorialService.createTurnoHistorial(profesionalId, req.body);
    res.status(201).json({ ok: true, data, message: 'Historial de turno creado' });
  } catch (error) {
    if (error.message === 'TURNO_NO_ENCONTRADO') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

const updateTurnoHistorial = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    const data = await turnoHistorialService.updateTurnoHistorial(profesionalId, id, req.body);
    res.json({ ok: true, data, message: 'Historial de turno actualizado' });
  } catch (error) {
    if (error.message === 'HISTORIAL_NO_ENCONTRADO' || error.message === 'TURNO_NO_ENCONTRADO') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

const deleteTurnoHistorial = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    await turnoHistorialService.deleteTurnoHistorial(profesionalId, id);
    res.json({ ok: true, message: 'Historial de turno eliminado' });
  } catch (error) {
    if (error.message === 'HISTORIAL_NO_ENCONTRADO') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

module.exports = {
  listTurnoHistorial,
  getTurnoHistorialById,
  createTurnoHistorial,
  updateTurnoHistorial,
  deleteTurnoHistorial,
};
