const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const authMiddleware = (rolRequerido) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        error: 'TOKEN_NO_PROVISTO',
        message: 'Acceso denegado. Token no provisto.'
      });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: false,
          error: 'TOKEN_INVALIDO',
          message: 'Token inválido o expirado.'
        });
      }

      // Validar rol si se especifica uno
      if (rolRequerido && decoded.rol !== rolRequerido) {
        // Excepción: Si el rol requerido es 'admin' y el user es 'profesional', denegar
        // Pero el sistema puede tener roles jerárquicos? En este caso son estancos según prompt.
        return res.status(403).json({
          ok: false,
          error: 'ACCESO_DENEGADO',
          message: `Acceso denegado. Se requiere rol: ${rolRequerido}`
        });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'ERROR_DE_AUTENTICACION',
      message: 'Error al procesar la autenticación'
    });
  }
};

module.exports = authMiddleware;
