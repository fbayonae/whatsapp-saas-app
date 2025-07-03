const checkLimit = require('../utils/checkTenantLimit');

/**
 * Middleware para verificar si el tenant ha superado el límite de un recurso.
 * @param {'contacts' | 'users' | 'messages'} type Tipo de recurso a validar
 */
function checkLimitMiddleware(type) {
    return async (req, res, next) => {
        const tenantId = req.user?.tenantId;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID no encontrado en la sesión' });
        }

        try {
            await checkLimit(tenantId, type);
            next();
        } catch (err) {
            return res.status(429).json({ error: err.message }); // 429: Too Many Requests
        }
    };
}

module.exports = {
    checkLimitMiddleware
};
