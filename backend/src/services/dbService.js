const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const saveTemplateToDB = async (template) => {
  return prisma.template.upsert({
    where: { name: template.name },
    update: {
      category: template.category,
      language: template.language,
      status: template.status
    },
    create: {
      name: template.name,
      category: template.category,
      language: template.language,
      status: template.status
    }
  });
};

module.exports = {
  saveTemplateToDB
};
