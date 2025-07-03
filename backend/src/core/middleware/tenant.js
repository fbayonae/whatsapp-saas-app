// backend/src/core/middleware/tenant.js
module.exports = (req, res, next) => {
  const tenantId =
    req.headers["x-tenant-id"] ||
    req.cookies?.tenantId ||
    req.query?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: "Tenant no especificado" });
  }

  req.tenantId = tenantId;
  next();
};
