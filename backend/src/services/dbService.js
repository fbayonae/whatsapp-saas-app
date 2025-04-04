const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const saveTemplateToDB = async (template) => {
  console.log("saveTemplateToDB");
  return prisma.template.upsert({
    where: { name: template.name },
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
};

module.exports = {
  saveTemplateToDB
};
