const { isWithin24Hours } = require('../../../../core/utils/time');

/*******************************************************
 * CONVERSATIONS
 *******************************************************/

const getConversationsByContactFromDB = async (prisma, { id, phoneNumber }) => {
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

const getConversationsFromDB = async (prisma) => {
    return await prisma.conversation.findMany({
        orderBy: { lastMessageAt: 'desc' },
        include: {
            contact: true
        }
    });
};

const getConversationFromDB = async (prisma, conversationId) => {
    return await prisma.conversation.findUnique({
        where: { id: parseInt(conversationId) },
        include: {
            contact: true
        }
    });
};

const createConversationFromDB = async (prisma, contactId) => {
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

const getMessagesFromDB = async (prisma, conversationId) => {
    return await prisma.message.findMany({
        where: { conversationId: parseInt(conversationId) },
        orderBy: { timestamp: 'asc' }
    });
};

const createMessageToDB = async (prisma, { conversationId, type, content, id_meta, contextId, status, media_id, media_mimeType, media_sha256, header_type, header, footer, action, metadata }) => {
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

const checkConversationWindow = async (prisma, { conversationId }) => {
    const lastMessage = await prisma.message.findFirst({
        where: { conversationId },
        orderBy: { createdAt: "desc" }
    });

    if (!lastMessage) return false;

    return isWithin24Hours(lastMessage.createdAt);
};

module.exports = {
    getConversationsByContactFromDB,
    getConversationsFromDB,
    getConversationFromDB,
    createConversationFromDB,
    getMessagesFromDB,
    createMessageToDB,
    checkConversationWindow
};