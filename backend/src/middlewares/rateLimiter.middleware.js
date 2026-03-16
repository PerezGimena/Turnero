const rateLimit = require('express-rate-limit');

// Rate Limiter Global: 200 requests por minuto
const rateLimiterGlobal = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'DEMASIADAS_SOLICITUDES',
    message: 'Has excedido el límite de solicitudes. Por favor intenta más tarde.'
  }
});

// Rate Limiter Público (Reservas): 5 requests cada 15 minutos
const rateLimiterPublico = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'DEMASIADAS_RESERVAS',
    message: 'Has excedido el límite de intentos de reserva. Por favor espera 15 minutos.'
  }
});

// Rate Limiter Auth (Login): 10 requests cada 5 minutos
const rateLimiterAuth = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'DEMASIADOS_INTENTOS_LOGIN',
    message: 'Demasiados intentos de inicio de sesión. Por favor espera 5 minutos.'
  }
});

module.exports = {
  rateLimiterGlobal,
  rateLimiterPublico,
  rateLimiterAuth
};
