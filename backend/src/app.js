const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler.middleware');
require('dotenv').config();

const app = express();

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

// Rate Limiter Global (Básico)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  limit: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

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
