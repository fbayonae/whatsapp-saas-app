const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLimit(tenantId, type) {
  const limits = await prisma.tenantLimit.findUnique({
    where: { tenantId }
  });

  if (!limits) throw new Error("Límites del tenant no definidos");

  switch (type) {
    case 'contacts':
      const totalContacts = await prisma.contact.count();
      if (totalContacts >= limits.maxContacts) {
        throw new Error(`Se alcanzó el límite de ${limits.maxContacts} contactos`);
      }
      break;

    case 'users':
      const totalUsers = await prisma.user.count({ where: { tenantId } });
      if (totalUsers >= limits.maxUsers) {
        throw new Error(`Se alcanzó el límite de ${limits.maxUsers} usuarios`);
      }
      break;

    case 'messages':
      const currentMonth = new Date().getMonth();
      const totalMessages = await prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), currentMonth, 1)
          }
        }
      });
      if (totalMessages >= limits.maxMessagesPerMonth) {
        throw new Error(`Se alcanzó el límite de ${limits.maxMessagesPerMonth} mensajes este mes`);
      }
      break;

    default:
      throw new Error(`Tipo de límite desconocido: ${type}`);
  }
}

module.exports = checkLimit;
