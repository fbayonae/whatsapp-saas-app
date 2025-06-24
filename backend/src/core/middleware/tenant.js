// backend/src/core/middleware/tenant.js
module.exports.detectTenant = (req, res, next) => {
  const tenantId = req.headers["x-tenant-id"]; // puedes adaptarlo según estrategia

  if (!tenantId) {
    return res.status(400).json({ error: "Tenant no especificado" });
  }

  req.tenantId = tenantId;
  next();
};
