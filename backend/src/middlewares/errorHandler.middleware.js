const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Sequelize Errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      ok: false,
      error: 'REGISTRO_DUPLICADO',
      message: 'El registro ya existe (email, slug o referencia duplicada)'
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      ok: false,
      error: 'VALIDACION_DB_FALLIDA',
      message: err.errors.map(e => e.message).join(', ')
    });
  }

  // Errores operacionales explícitos (los que lanzamos con throw new Error)
  // Nota: Idealmente usaríamos clases de error custom, pero chequeamos mensaje por simplicidad
  const erroresConocidos = {
    'PROFESIONAL_NO_ENCONTRADO': 404,
    'TURNO_NO_ENCONTRADO': 404,
    'PACIENTE_NO_ENCONTRADO': 404,
    'SLOT_NO_DISPONIBLE': 409,
    'DATOS_PACIENTE_INCOMPLETOS': 400,
    'EMAIL_DUPLICADO': 409,
    'SLUG_DUPLICADO': 409,
    'CREDENCIALES_INVALIDAS': 401
  };

  if (erroresConocidos[err.message]) {
    return res.status(erroresConocidos[err.message]).json({
      ok: false,
      error: err.message,
      message: err.message.replace(/_/g, ' ')
    });
  }

  // Default Error
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    ok: false,
    error: 'ERROR_INTERNO',
    message: process.env.NODE_ENV === 'production' ? 'Ha ocurrido un error interno' : err.message
  });
};

module.exports = errorHandler;
