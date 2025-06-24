const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createTenant = async (data) => {
  return prisma.tenant.create({ data });
};

const getAllTenants = async () => {
  return prisma.tenant.findMany();
};

const getTenantById = async (id) => {
  return prisma.tenant.findUnique({ where: { id } });
};

const updateTenant = async (id, data) => {
  return prisma.tenant.update({ where: { id }, data });
};

const deleteTenant = async (id) => {
  return prisma.tenant.delete({ where: { id } });
};

module.exports = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant
};
