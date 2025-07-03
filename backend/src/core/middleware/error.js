const logger = require('../../config/logger');
const { AppError } = require('../errors');

module.exports = {
    errorHandler: (err, req, res, next) => {
        let status = 500;
        let message = 'Error interno del servidor';
        let details = {};

        if (err instanceof AppError) {
            status = err.statusCode || 500;
            message = err.message;
            details = err.details || {};
        } else if (err.name === 'PrismaClientKnownRequestError') {
            status = 400;
            message = 'Error en la base de datos';

            if (err.code === 'P2002') {
                message = 'Registro duplicado: ' + err.meta?.target?.join(', ');
            }
        }

        logger.error({
            message: err.message,
            stack: err.stack,
            statusCode: status,
            details: {
                ...details,
                path: req.path,
                method: req.method,
                user: req.user?.id,
                tenant: req.user?.tenantId
            }
        });

        // Respuesta al cliente
        res.status(status).json({
            success: false,
            error: message,
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack,
                details: details
            })
        });
    }
};
