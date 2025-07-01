const { PrismaClient } = require("@prisma/client");
const { execSync } = require("child_process");
const path = require("path");

require("dotenv").config();

const prisma = new PrismaClient();
const schemaName = process.argv[2];

if (!schemaName) {
  console.error("❌ Debes proporcionar un nombre de esquema (ej: empresa1)");
  process.exit(1);
}

async function createTenant(schema) {
  try {
    console.log(`🚀 Creando schema PostgreSQL '${schema}'...`);
    execSync(`psql "${process.env.DATABASE_URL}" -c 'CREATE SCHEMA IF NOT EXISTS "${schema}";'`);

    console.log("📦 Ejecutando migraciones...");
    execSync(`npx prisma migrate deploy --schema=./prisma/schema.prisma`, { stdio: "inherit" });

    console.log("📝 Registrando tenant en base de datos...");

    await prisma.tenant.create({
      data: {
        name: schema,
        slug: schema,
        wa_businessId: null,
        wa_versionGraph: null,
        wa_tokendev: null,
        wa_verify_token: null,
        wa_phone_number: null,
      },
    });

    console.log("🌱 Aplicando seed inicial...");
    execSync(`node ${path.join(__dirname, "seed-tenant.js")} ${schema}`, { stdio: "inherit" });

    console.log(`✅ Tenant '${schema}' creado correctamente.\n`);
  } catch (error) {
    console.error("❌ Error creando el tenant:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTenant(schemaName);
