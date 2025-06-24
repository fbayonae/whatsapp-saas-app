const tenantService = require("../services/tenantService");

const createTenant = async (req, res) => {
  try {
    const tenant = await tenantService.createTenant(req.body);
    res.status(201).json(tenant);
  } catch (err) {
    res.status(500).json({ error: "Error al crear tenant" });
  }
};

const getAllTenants = async (_req, res) => {
  try {
    const tenants = await tenantService.getAllTenants();
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener tenants" });
  }
};

const getTenantById = async (req, res) => {
  try {
    const tenant = await tenantService.getTenantById(parseInt(req.params.id));
    if (!tenant) return res.status(404).json({ error: "Tenant no encontrado" });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener tenant" });
  }
};

const updateTenant = async (req, res) => {
  try {
    const updated = await tenantService.updateTenant(parseInt(req.params.id), req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar tenant" });
  }
};

const deleteTenant = async (req, res) => {
  try {
    await tenantService.deleteTenant(parseInt(req.params.id));
    res.json({ message: "Tenant eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar tenant" });
  }
};

module.exports = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant
};
