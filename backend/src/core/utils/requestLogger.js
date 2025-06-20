const logger = require("../../utils/logger");

const requestLogger = (req, res, next) => {
  const { method, originalUrl } = req;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  res.on("finish", () => {
    const { statusCode } = res;
    logger.info(`${method} ${originalUrl} ${statusCode} - IP: ${ip}`);
  });

  next();
};

module.exports = requestLogger;
