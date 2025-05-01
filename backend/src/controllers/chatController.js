// chatController.js
const  dbService  = require('../services/dbService');

const getConversations = async (req, res) => {
  try {
    const conversations = await dbService.getConversationsFromDB();
    res.json(conversations);
  } catch (error) {
    console.error("❌ Error al obtener conversaciones:", error);
    res.status(500).json({ error: "Error al obtener chats" });
  }
};

const getMessagesByConversation = async (req, res) => {
  const { id } = req.params;
  try {
    const messages = await dbService.getMessagesFromDB(id);
    res.json(messages);
  } catch (error) {
    console.error("❌ Error al obtener mensajes:", error);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
};

const checkWindow24h = async (req, res) => {

  const {conversationId} = req.params;

  if (isNaN(conversationId)) {
    return res.status(400).json({ error: "ID de conversación inválido" });
  }

  try {
    const within24Hours = await dbService.checkConversationWindow(parseInt(conversationId));
    res.json({ within24Hours });
  } catch (error) {
    console.error("❌ Error verificando ventana de 24h:", error);
    res.status(500).json({ error: "Error interno verificando ventana de 24h" });
  }
};

module.exports = { 
    getConversations, 
    getMessagesByConversation,
    checkWindow24h 
};
