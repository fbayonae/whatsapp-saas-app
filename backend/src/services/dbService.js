const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const saveTemplateToDB = async (template) => {
  console.log("saveTemplateToDB");
  try {
    return await prisma.template.upsert({
      where: { id_meta: template.id },
      update: {
        category: template.category,
        language: template.language,
        status: template.status,
        id_meta: template.id
      },
      create: {
        name: template.name,
        category: template.category,
        language: template.language,
        status: template.status,
        id_meta: template.id
      }
    });
  } catch (error) {
    console.error('❌ Error guardando plantilla:', template.name, error);
    return null;
  }
};

const getTemplatesFromDB = async () => {
    return await prisma.template.findMany({
      include: {
        components: {
          include: {
            buttons: true
          }
        }
      }
    });
  };
  

module.exports = {
  saveTemplateToDB,
  getTemplatesFromDB
};
