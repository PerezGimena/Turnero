const obraSocialService = require('../services/obraSocial.service');

const listObrasSociales = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const result = await obraSocialService.listObrasSocialesProfesional(profesionalId, req.query);
    res.json({ ok: true, data: result.rows, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

const createObraSocial = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const data = await obraSocialService.createObraSocialProfesional(profesionalId, req.body);
    res.status(201).json({ ok: true, data, message: 'Obra social asignada al profesional' });
  } catch (error) {
    if (error.message === 'OBRA_SOCIAL_NO_ENCONTRADA') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    if (error.message === 'NOMBRE_REQUERIDO') {
      return res.status(400).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

const updateObraSocial = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    const data = await obraSocialService.updateObraSocialProfesional(profesionalId, id, req.body);
    res.json({ ok: true, data, message: 'Obra social actualizada' });
  } catch (error) {
    if (error.message === 'OBRA_SOCIAL_NO_ASIGNADA') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    if (error.message === 'OBRA_SOCIAL_NO_ENCONTRADA') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

const deleteObraSocial = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const id = Number(req.params.id);
    await obraSocialService.deleteObraSocialProfesional(profesionalId, id);
    res.json({ ok: true, message: 'Obra social desvinculada del profesional' });
  } catch (error) {
    if (error.message === 'OBRA_SOCIAL_NO_ASIGNADA') {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
};

module.exports = {
  listObrasSociales,
  createObraSocial,
  updateObraSocial,
  deleteObraSocial,
};
