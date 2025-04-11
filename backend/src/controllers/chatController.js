// chatController.js
const  dbService  = require('../services/dbService');
const auth = require("../utils/authUtils");

router.get("/", auth, templateController.getTemplates);
router.post("/sync", auth, templateController.syncTemplates);

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

module.exports = { 
    getConversations, 
    getMessagesByConversation 
};
