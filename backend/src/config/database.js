// backend/src/config/database.js
const { PrismaClient } = require("@prisma/client");

// Cache de clientes por schema
const tenantsCache = {};

// Cliente global para schema "auth"
const globalPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

/**
 * Devuelve un cliente Prisma para el esquema "auth"
 */
const getGlobalPrisma = () => globalPrisma;

/**
 * Devuelve o crea un cliente Prisma para un tenant específico
 * @param {string} schemaName - Nombre del esquema (empresa1, empresa2...)
 */
const getTenantPrisma = (schemaName) => {
  if (!schemaName) throw new Error("schemaName es requerido");

  if (!tenantsCache[schemaName]) {
    tenantsCache[schemaName] = new PrismaClient({
      datasources: {
        db: {
          url: `${process.env.DATABASE_URL}?schema=${schemaName}`
        }
      }
    });
  }

  return tenantsCache[schemaName];
};

module.exports = {
  getGlobalPrisma,
  getTenantPrisma
};
