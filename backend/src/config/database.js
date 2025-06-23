// backend/src/config/database.js
const { PrismaClient } = require("@prisma/client");
const { multiTenant } = require("./env");

// Cache local de instancias por tenant
const clients = new Map();

const getTenantClient = (schemaName) => {
  if (!clients.has(schemaName)) {
    const url = `${multiTenant.baseDbUrl}?schema=${schemaName}`;
    const client = new PrismaClient({ datasources: { db: { url } } });
    clients.set(schemaName, client);
  }
  return clients.get(schemaName);
};

module.exports = {
  getTenantClient
};
