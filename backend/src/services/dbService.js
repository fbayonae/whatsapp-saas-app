const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { isWithin24Hours } = require('../utils/timeUtils');

/*******************************************************
 * PREFERENCES
 *******************************************************/

// Actualizar o crear preferencias
const createOrUpdatePreferences = async (data) => {
  const existing = await prisma.preferences.findFirst();

  if (existing) {
    return await prisma.preferences.update({
      where: { id: existing.id },
      data
    });
  }

  return await prisma.preferences.create({
    data
  });
};


// Obtener las preferencias
const getPreferences = async () => {
  try {
    return await prisma.preference.findFirst();
  } catch (error) {
    console.error("❌ Error obteniendo preferencias:", error);
    throw error;
  }
};

/*******************************************************
 * SESSIONS
 *******************************************************/

// Buscar sesion activa
const getActiveSessionsByUser = async (userId) => {
  return await prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

/*******************************************************
 * TEMPLATES 
 *******************************************************/

const saveTemplateToDB = async (template) => {
  console.log("saveTemplateToDB");
  try {
    const saved = await prisma.template.upsert({
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
    return saved;
  } catch (error) {
    console.error('❌ Error guardando plantilla:', template.name, error);
    return null;
  }
};

const saveComponentToDB = async (component, templateId) => {
  console.log("saveComponentToDB");

  // Evitar componentes duplicados
  const existingComponent = await prisma.component.findFirst({
    where: {
      type: component.type,
      format: component.format || '',
      text: component.text || '',
      templateId: templateId
    }
  });

  const savedComponent = existingComponent || await prisma.component.create({
    data: {
      type: component.type,
      format: component.format || '',
      text: component.text || '',
      example: component.example?.body_text ? JSON.stringify(component.example.body_text) : null,
      template: { connect: { id: templateId } }
    }
  });

  if (component.type === 'BUTTONS' && component.buttons?.length) {
    for (const btn of component.buttons) {
      await prisma.button.create({
        data: {
          type: btn.type,
          text: btn.text,
          url: btn.url || null,
          example: btn.example ? JSON.stringify(btn.example) : null,
          component: { connect: { id: savedComponent.id } }
        }
      });
    }
  }

  return savedComponent;
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

const getTemplateByIdFromDB = async (id) => {
  return await prisma.template.findUnique({
    where: { id_meta: id },
    include: {
      components: {
        include: {
          buttons: true
        }
      }
    }
  });
};

const deleteTemplateFromDB = async (id) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id_meta: id },
      include: {
        components: {
          include: {
            buttons: true
          }
        }
      }
    });

    if (!template) {
      throw new Error("Plantilla no encontrada en la base de datos");
    }

    // 2. Eliminar botones de cada componente
    for (const component of template.components) {
      await prisma.button.deleteMany({
        where: { componentId: component.id }
      });
    }

    // 3. Eliminar componentes
    await prisma.component.deleteMany({
      where: { templateId: template.id }
    });

    // 4. Eliminar plantilla
    const deletedTemplate = await prisma.template.delete({
      where: { id: template.id }
    });

    return deletedTemplate;
  } catch (error) {
    console.error('❌ Error eliminando plantilla:', error);
    throw error;
  }
}

/*******************************************************
 * CONTACTS
 *******************************************************/

const getContactsFromDB = async () => {
  return await prisma.contact.findMany({
    orderBy: { createdAt: 'desc' }
  });

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

const checkConversationWindow = async (conversationId) => {
  const lastMessage = await prisma.message.findFirst({
    where: { conversationId },
    orderBy: { createdAt: "desc" }
  });

  if (!lastMessage) return false;

  return isWithin24Hours(lastMessage.createdAt);
};



module.exports = {
  saveTemplateToDB,
  getTemplatesFromDB,
  deleteTemplateFromDB,
  saveComponentToDB,
  getContactsFromDB,
  getConversationsFromDB,
  getMessagesFromDB,
  getConversationFromDB,
  createMessageToDB,
  getTemplateByIdFromDB,
  checkConversationWindow,
  getActiveSessionsByUser,
  createOrUpdatePreferences,
  getPreferences
};
