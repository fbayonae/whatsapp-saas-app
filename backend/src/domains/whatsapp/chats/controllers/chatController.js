// chatController.js
const { getPrismaClient } = require("../../../../prisma/client");

const messageService = require('../../messages/services/messageService');

const getConversations = async (req, res) => {

    const prisma = getPrismaClient(req.user.tenantId);

    try {
        const conversations = await messageService.getConversationsFromDB(prisma);
        res.json(conversations);
    } catch (error) {
        console.error("❌ Error al obtener conversaciones:", error);
        res.status(500).json({ error: "Error al obtener chats" });
    }
};

const createConversation = async (req, res) => {
    const { contactId } = req.body;
    const prisma = getPrismaClient(req.user.tenantId);

    if (!contactId) {
        return res.status(400).json({ error: "Faltan datos para crear la conversación" });
    }

    try {
        const conversation = await messageService.createConversationFromDB(prisma, parseInt(contactId));
        res.status(201).json(conversation);
    } catch (error) {
        console.error("❌ Error al crear conversación:", error);
        res.status(500).json({ error: "Error al crear conversación" });
    }
};

const getMessagesByConversation = async (req, res) => {
    const { id } = req.params;
    const prisma = getPrismaClient(req.user.tenantId);
    try {
        const messages = await messageService.getMessagesFromDB(prisma, id);
        res.json(messages);
    } catch (error) {
        console.error("❌ Error al obtener mensajes:", error);
        res.status(500).json({ error: "Error al obtener mensajes" });
    }
};

const checkWindow24h = async (req, res) => {

    const { conversationId } = req.params;
    const prisma = getPrismaClient(req.user.tenantId);

    try {
        const within24Hours = await messageService.checkConversationWindow(prisma, parseInt(conversationId));
        res.json({ within24Hours });
    } catch (error) {
        console.error("❌ Error verificando ventana de 24h:", error);
        res.status(500).json({ error: "Error interno verificando ventana de 24h" });
    }
};

module.exports = {
    getConversations,
    getMessagesByConversation,
    checkWindow24h,
    createConversation
};
