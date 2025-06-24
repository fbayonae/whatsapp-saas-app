// backend/src/core/middleware/error.js
const logger = require("../../config/logger");

module.exports.errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(500).json({ error: "Error interno del servidor" });
};
