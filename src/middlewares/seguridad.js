const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const hpp = require('hpp');
const xssLib = require('xss');

const helmetConfig = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

const limitGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones desde esta IP, intenta en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

const limitAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de autenticación, intenta en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: (hits) => hits * 100,
});

const hppConfig = hpp();

function sanitizeValue(val) {
  if (typeof val === 'string') return xssLib(val);
  if (val && typeof val === 'object') {
    for (const key of Object.keys(val)) val[key] = sanitizeValue(val[key]);
  }
  return val;
}

function xssConfig(req, _res, next) {
  if (req.body) sanitizeValue(req.body);
  next();
}

module.exports = {
  helmetConfig,
  limitGeneral,
  limitAuth,
  speedLimiter,
  hppConfig,
  xssConfig,
};
