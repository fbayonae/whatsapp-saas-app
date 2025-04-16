const rateLimit = require("express-rate-limit");

// Limita el login a 5 intentos cada 10 minutos
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5,
  message: "Demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limita a 100 solicitudes por 15 minutos por IP (para la API en general)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  message: "Demasiadas solicitudes desde esta IP. Inténtalo más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  apiLimiter,
};
