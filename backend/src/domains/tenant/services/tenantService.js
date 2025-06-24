const tenantRepository = require("../repositories/tenantRepository");

const createTenant = async (data) => {
  return tenantRepository.createTenant(data);
};

const getAllTenants = async () => {
  return tenantRepository.getAllTenants();
};

const getTenantById = async (id) => {
  return tenantRepository.getTenantById(id);
};

const updateTenant = async (id, data) => {
  return tenantRepository.updateTenant(id, data);
};

const deleteTenant = async (id) => {
  return tenantRepository.deleteTenant(id);
};

module.exports = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant
};
