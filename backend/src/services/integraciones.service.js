/**
 * Servicio centralizado para credenciales de integraciones de pago.
 * Lee primero desde la columna `configuracion` del Admin en BD,
 * luego hace fallback a variables de entorno.
 */
const Admin = require('../models/Admin');

const CLAVES = [
  'MP_CLIENT_ID',
  'MP_CLIENT_SECRET',
  'STRIPE_CLIENT_ID',
  'STRIPE_SECRET_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_FROM',
];

// Cache en memoria para evitar consultas repetidas (TTL: 60s)
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 60_000;

const getIntegracionesConfig = async () => {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL_MS) return _cache;

  let dbConfig = {};
  try {
    const admin = await Admin.findOne({ attributes: ['configuracion'] });
    dbConfig = admin?.configuracion || {};
  } catch {
    // La columna 'configuracion' puede no existir aún si la migración no fue ejecutada.
    // En ese caso se usa solo process.env como fallback.
  }

  const config = {};
  for (const clave of CLAVES) {
    config[clave] = dbConfig[clave] || process.env[clave] || null;
  }

  _cache = config;
  _cacheTime = now;
  return config;
};

/** Invalida la cache (llamar después de guardar nuevas credenciales) */
const invalidarCache = () => {
  _cache = null;
  _cacheTime = 0;
};

module.exports = { getIntegracionesConfig, invalidarCache, CLAVES };
