const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, errors, json } = format;
const path = require("path");

// Formato personalizado
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Logger principal
const logger = createLogger({
  level: "info", // Cambia a 'debug' para desarrollo
  format: combine(
    timestamp(),
    errors({ stack: true }), // Captura stack trace si es error
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(format.colorize(), logFormat),
    }),
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.join("logs", "combined.log"),
    }),
  ],
});

module.exports = logger;
