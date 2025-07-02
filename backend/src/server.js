require("dotenv").config(); // Carga las variables de entorno

const app = require("./app"); // Importa la configuración completa de la app

const { closeAllPrismaClients } = require("./prisma/client");
const prisma = require("./prisma/client");
const logger = require("./config/logger");

const PORT = process.env.PORT || 3001;

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// -------------------------
// Cierre ordenado
// -------------------------
async function gracefulShutdown(signal) {
  logger.info(`🛑 Señal recibida: ${signal}. Cerrando servidor...`);
  server.close(async () => {
    logger.info("🔌 Servidor Express cerrado");
    await prisma.$disconnect();
    await closeAllPrismaClients();
    logger.info("✅ Conexiones Prisma cerradas");
    process.exit(0);
  });
}

// Señales comunes
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Errores no controlados
process.on("uncaughtException", (err) => {
  logger.error("❌ Excepción no controlada:", err);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  logger.error("❌ Promesa no manejada:", reason);
  gracefulShutdown("unhandledRejection");
});