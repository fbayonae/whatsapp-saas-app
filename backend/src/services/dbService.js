const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { isWithin24Hours } = require('../utils/timeUtils');


/*******************************************************
 * CONTACTS
 *******************************************************/

const getContactsFromDB = async () => {
  return await prisma.contact.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

const createContactFromDB = async ({ phoneNumber, name }) => {
  try {
    const contact = await prisma.contact.create({
      data: {
        phoneNumber,
        name,
      },
    });
    return contact;
  } catch (error) {
    console.error("❌ Error creando contacto:", error);
    throw error;
  }
};

const deleteContactFromDB = async ({ id }) => {
  try {
    // Obtener el contacto
    const contact = await prisma.contact.findFirst({
      where: {
        ...(id && { id })
      },
    });

    if (!contact) {
      throw new Error("Contacto no encontrado");
    }

    // Obtener conversaciones asociadas
    const conversations = await prisma.conversation.findMany({
      where: { contactId: contact.id },
      select: { id: true },
    });

    const conversationIds = conversations.map(c => c.id);

    if (conversationIds.length > 0) {
      // Eliminar mensajes
      await prisma.message.deleteMany({
        where: {
          conversationId: { in: conversationIds },
        },
      });

      // Eliminar conversaciones
      await prisma.conversation.deleteMany({
        where: {
          id: { in: conversationIds },
        },
      });
    }

    // Eliminar el contacto
    const deleted = await prisma.contact.delete({
      where: { id: contact.id },
    });

    return deleted;

  } catch (error) {
    console.error("❌ Error eliminando contacto:", error);
    throw error;
  }
};


const updateContactFromDB = async (id, data) => {
  try {
    const updated = await prisma.contact.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber
      }
    });
    return updated;
  } catch (error) {
    console.error("❌ Error actualizando contacto:", error);
    throw error;
  }
};


const getConversationsByContactFromDB = async ({ id, phoneNumber }) => {
  try {
    // Buscar contacto por ID o phoneNumber
    const contact = await prisma.contact.findFirst({
      where: {
        ...(id && { id }),
        ...(phoneNumber && { phoneNumber }),
      },
      include: {
        conversations: {
          orderBy: { lastMessageAt: 'desc' },
          include: { messages: true },
        },
      },
    });

    if (!contact) {
      throw new Error("Contacto no encontrado");
    }

    return contact.conversations;
  } catch (error) {
    console.error("❌ Error obteniendo conversaciones del contacto:", error);
    throw error;
  }
};



/*******************************************************
 * CONVERSATIONS
 *******************************************************/

const getConversationsFromDB = async () => {
  return await prisma.conversation.findMany({
    orderBy: { lastMessageAt: 'desc' },
    include: {
      contact: true
    }
  });
};

const getConversationFromDB = async (conversationId) => {
  return await prisma.conversation.findUnique({
    where: { id: parseInt(conversationId) },
    include: {
      contact: true
    }
  });
};

const createConversationFromDB = async (contactId) => {
  try {
    const conversation = await prisma.conversation.create({
      data: {
        contactId
      }
    });
    return conversation;
  } catch (error) {
    console.error("❌ Error creando conversación:", error);
    throw error;
  }
}

/*******************************************************
 * MESSAGES
 *******************************************************/

const getMessagesFromDB = async (conversationId) => {
  return await prisma.message.findMany({
    where: { conversationId: parseInt(conversationId) },
    orderBy: { timestamp: 'asc' }
  });
};

const createMessageToDB = async ({ conversationId, type, content, id_meta, contextId, status, media_id, media_mimeType, media_sha256, header_type, header, footer, action, metadata }) => {
  try {
    const savedMessage = await prisma.message.create({
      data: {
        conversationId,
        direction: "OUTBOUND",
        content,
        type: type || "text",
        id_meta: id_meta || "manual",
        timestamp: new Date(),
        contextId,
        status,
        media_id,
        media_mimeType,
        media_sha256,
        header_type,
        header,
        footer,
        action,
        metadata
      }
    });
    return savedMessage;
  } catch (error) {
    console.error("❌ Error guardando mensaje outbound:", error);
    throw error;
  }
};

const checkConversationWindow = async ({ conversationId }) => {
  const lastMessage = await prisma.message.findFirst({
    where: { conversationId },
    orderBy: { createdAt: "desc" }
  });

  if (!lastMessage) return false;

  return isWithin24Hours(lastMessage.createdAt);
};

/*******************************************************
 * CAMPAIGNS
 *******************************************************/

const createCampaign = async ({ name, templateId }) => {
  try {
    return await prisma.campaign.create({ data: { name, templateId } });
  } catch (error) {
    console.error("❌ Error creando campaña:", error);
    throw error;
  }
};

const getAllCampaigns = async () => {
  try {
    return await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: { template: true },
    });
  } catch (error) {
    console.error("❌ Error obteniendo campañas:", error);
    throw error;
  }
};

const getCampaignById = async (id) => {
  try {
    return await prisma.campaign.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            components: true
          }
        },
        contacts: {
          include: { contact: true, message: true },
        },
      },
    });
  } catch (error) {
    console.error("❌ Error obteniendo campaña por ID:", error);
    throw error;
  }
};

const updateCampaign = async (id, data) => {
  try {
    return await prisma.campaign.update({ where: { id }, data });
  } catch (error) {
    console.error("❌ Error actualizando campaña:", error);
    throw error;
  }
};

const deleteCampaign = async (id) => {
  try {
    await prisma.campaignContact.deleteMany({ where: { campaignId: id } });
    return await prisma.campaign.delete({ where: { id } });
  } catch (error) {
    console.error("❌ Error eliminando campaña:", error);
    throw error;
  }
};

/*******************************************************
 * CAMPAIGN CONTACTS
 *******************************************************/

const addContactsToCampaign = async (campaignId, contactIds) => {
  try {
    const data = contactIds.map((contactId) => ({ campaignId, contactId }));
    return await prisma.campaignContact.createMany({ data, skipDuplicates: true });
  } catch (error) {
    console.error("❌ Error añadiendo contactos a campaña:", error);
    throw error;
  }
};

const removeContactFromCampaign = async (campaignId, contactId) => {
  try {
    return await prisma.campaignContact.deleteMany({ where: { campaignId, contactId } });
  } catch (error) {
    console.error("❌ Error eliminando contacto de campaña:", error);
    throw error;
  }
};

const getCampaignContacts = async (campaignId) => {
  try {
    return await prisma.campaignContact.findMany({
      where: { campaignId },
      include: { contact: true },
    });
  } catch (error) {
    console.error("❌ Error obteniendo contactos de campaña:", error);
    throw error;
  }
};

// Envío y seguimiento
const getCampaignSendQueue = async (campaignId) => {
  try {
    return await prisma.campaignContact.findMany({
      where: { campaignId, status: "pending" },
      include: {
        contact: true,
        campaign: {
          include: {
            template: {
              include: { components: true },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("❌ Error obteniendo cola de envío:", error);
    throw error;
  }
};

const markContactAsSent = async (id, messageId = null) => {
  try {
    return await prisma.campaignContact.update({
      where: { id },
      data: {
        status: "sent",
        messageId: messageId,
      },
    });
  } catch (error) {
    console.error("❌ Error marcando contacto como enviado:", error);
    throw error;
  }
};

const markContactAsError = async (id, errorMsg) => {
  try {
    return await prisma.campaignContact.update({
      where: { id },
      data: {
        status: "error",
        errorMsg,
      },
    });
  } catch (error) {
    console.error("❌ Error marcando contacto como error:", error);
    throw error;
  }
};

const getCampaignStatus = async (campaignId) => {
  try {
    const result = await prisma.campaignContact.groupBy({
      by: ["status"],
      where: { campaignId },
      _count: { _all: true },
    });

    const status = {};
    result.forEach((row) => {
      status[row.status] = row._count._all;
    });

    return status;
  } catch (error) {
    console.error("❌ Error obteniendo estado de campaña:", error);
    throw error;
  }
};

const checkAndMarkCampaignAsSent = async (campaignId) => {
  try {
    const remaining = await prisma.campaignContact.count({
      where: {
        campaignId,
        status: { in: ["pending", "sending"] },
      },
    });

    if (remaining === 0) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "sent" },
      });
      console.log(`✅ Campaña ${campaignId} marcada como enviada.`);
    }
  } catch (error) {
    console.error("❌ Error verificando estado de campaña:", error);
    throw error;
  }
};

const getCampaignContactById = async (id) => {
  try {
    return await prisma.campaignContact.findUnique({
      where: { id },
      select: { campaignId: true }
    });
  } catch (err) {
    console.error("❌ Error obteniendo campaignContact:", err);
    throw err;
  }
};



module.exports = {
  saveTemplateToDB,
  createUserFromDB,
  updateUserFromDB,
  deleteUserFromDB,
  getUserByEmailFromDB,
  getTemplatesFromDB,
  deleteTemplateFromDB,
  saveComponentToDB,
  getContactsFromDB,
  createContactFromDB,
  updateContactFromDB,
  deleteContactFromDB,
  getConversationsByContactFromDB,
  getConversationsFromDB,
  getMessagesFromDB,
  getConversationFromDB,
  createConversationFromDB,
  createMessageToDB,
  getTemplateByIdFromDB,
  checkConversationWindow,
  getActiveSessionsByUser,
  createOrUpdatePreferences,
  getPreferences,
  getUsersFromDB,
  getSessionsUserFromDB,
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  addContactsToCampaign,
  removeContactFromCampaign,
  getCampaignContacts,
  getCampaignSendQueue,
  markContactAsSent,
  markContactAsError,
  getCampaignStatus,
  checkAndMarkCampaignAsSent,
  getCampaignContactById
};
