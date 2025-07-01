const { PrismaClient } = require("@prisma/client");
const { exec } = require("child_process");

const prisma = new PrismaClient();
const schema = process.argv[2];

if (!schema) {
  console.error("❌ Debes proporcionar el nombre del esquema a eliminar.");
  process.exit(1);
}

async function deleteTenant(schemaName) {
  try {
    // Eliminar tenant de tabla auth.tenants
    await prisma.tenant.deleteMany({ where: { slug: schemaName } });

    // Eliminar esquema de PostgreSQL
    exec(`psql "${process.env.DATABASE_URL}" -c 'DROP SCHEMA IF EXISTS "${schemaName}" CASCADE;'`, (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Error ejecutando DROP SCHEMA:", stderr);
        process.exit(1);
      }
      console.log(`✅ Esquema '${schemaName}' eliminado correctamente.`);
      process.exit(0);
    });
  } catch (err) {
    console.error("❌ Error al eliminar tenant:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTenant(schema);
