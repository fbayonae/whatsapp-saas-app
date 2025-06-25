const logger = require('../../config/logger');
const { AppError } = require('../errors');

module.exports = (err, req, res, next) => {
  let status = 500;
  let message = 'Error interno del servidor';

  if (err instanceof AppError) {
    status = err.statusCode || 500;
    message = err.message;
  } else if (err.name === 'PrismaClientKnownRequestError') {
    status = 400;
    message = 'Error en la base de datos';

    if (err.code === 'P2002') {
      message = 'Registro duplicado: ' + err.meta?.target?.join(', ');
    }
  }

  if (status >= 500) {
    logger.error(`${err.message}\n${err.stack}`);
  }

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
