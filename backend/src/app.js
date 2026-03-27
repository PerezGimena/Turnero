const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimiterGlobal } = require('./middlewares/rateLimiter.middleware');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler.middleware');
require('dotenv').config();

const app = express();

// Necesario detrás de Nginx/Proxy para rate-limit e IP real de cliente.
app.set('trust proxy', 1);

// Stripe requiere body raw para validar la firma webhook.
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Middlewares Globales
app.use(helmet());
app.use(cors({
  origin: process.env.APP_DOMAIN || '*', 
  credentials: true
}));
app.use(express.json()); // Body parser json
app.use(express.urlencoded({ extended: true })); // Body parser urlencoded
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logger solo en dev
}

// Rate Limiter Global
app.use(rateLimiterGlobal);

// Rutas
app.use('/api', routes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    ok: false,
    error: 'RUTA_NO_ENCONTRADA',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

// Error Handler (Siempre al final)
app.use(errorHandler);

module.exports = app;
