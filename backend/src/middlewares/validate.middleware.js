const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(422).json({
      ok: false,
      error: 'VALIDACION_FALLIDA',
      message: 'Error de validación en los datos enviados',
      detalles: error.errors.map(err => ({
        campo: err.path.join('.'),
        mensaje: err.message
      }))
    });
  }
};

module.exports = validate;
