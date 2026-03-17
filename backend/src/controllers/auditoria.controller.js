const auditoriaService = require('../services/auditoria.service');

const listAuditorias = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const result = await auditoriaService.listAuditoriasProfesional(profesionalId, req.query);
    res.json({ ok: true, data: result.rows, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

const getAuditoriaById = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    const data = await auditoriaService.getAuditoriaProfesionalById(profesionalId, id);
    if (!data) return res.status(404).json({ ok: false, error: 'AUDITORIA_NO_ENCONTRADA' });
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
};

const createAuditoria = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const data = await auditoriaService.createAuditoriaProfesional(profesionalId, req.body);
    res.status(201).json({ ok: true, data, message: 'Auditoría creada' });
  } catch (error) {
    next(error);
  }
};

const updateAuditoria = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    const data = await auditoriaService.updateAuditoriaProfesional(profesionalId, id, req.body);
    res.json({ ok: true, data, message: 'Auditoría actualizada' });
  } catch (error) {
    if (error.message === 'AUDITORIA_NO_ENCONTRADA') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

const deleteAuditoria = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    await auditoriaService.deleteAuditoriaProfesional(profesionalId, id);
    res.json({ ok: true, message: 'Auditoría eliminada' });
  } catch (error) {
    if (error.message === 'AUDITORIA_NO_ENCONTRADA') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

module.exports = {
  listAuditorias,
  getAuditoriaById,
  createAuditoria,
  updateAuditoria,
  deleteAuditoria,
};
