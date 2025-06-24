// backend/src/prisma/client.js
const { PrismaClient } = require('@prisma/client');

const clients = new Map();

/**
 * Obtiene el cliente Prisma específico para un tenant.
 * @param {string} schema - Esquema de base de datos del tenant (e.g. "empresa1")
 */
function getPrismaClient(schema) {
  if (!schema) throw new Error("❌ Tenant schema no proporcionado");

  if (clients.has(schema)) {
    return clients.get(schema);
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Reemplazar el middleware para inyectar el esquema dinámico
  prisma.$use(async (params, next) => {
    params.model = params.model && `${schema}.${params.model}`;
    return next(params);
  });

  clients.set(schema, prisma);
  return prisma;
}

module.exports = {
  getPrismaClient,
};
