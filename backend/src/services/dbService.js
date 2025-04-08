const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    const savedComponent = await prisma.component.create({
      data: {
        type: component.type,
        format: component.format || '',
        text: component.text || '',
        template: { connect: { id: templateId } }
      }
    });
  
    if (component.type === 'BUTTON' && component.buttons?.length) {
      for (const btn of component.buttons) {
        await prisma.button.create({
          data: {
            type: btn.type,
            text: btn.text,
            url: btn.url || null,
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

const getContactsFromDB = async () => {
    return await prisma.contact.findMany({
        orderBy: { createdAt: 'desc' }
    });
   
};

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

const getMessagesFromDB = async (conversationId) => {
    return await prisma.message.findMany({
        where: { conversationId: parseInt(conversationId) },
        orderBy: { timestamp: 'asc' }
    });
};

const createMessageToDB = async (message) => {
    try {
        const saved = await prisma.message.create({
            data: message
        });
        return saved; 
    }
    catch (error) {
        console.error('❌ Error al crear mensaje en db:', error);
        return null;
    }
    
};

module.exports = {
  saveTemplateToDB,
  getTemplatesFromDB,
  saveComponentToDB,
  getContactsFromDB,
  getConversationsFromDB, 
  getMessagesFromDB,
  getConversationFromDB,
  createMessageToDB
};
