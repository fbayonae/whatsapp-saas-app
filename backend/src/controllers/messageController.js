const dbService  = require('../services/dbService');
const whatsappService  = require('../services/whatsappService');
const axios = require('axios');

const sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;

  if (!conversationId || !text) {
    return res.status(400).json({ error: "conversationId y text son requeridos" });
  }

  try {
    // 1. Obtener conversación y número
    const conversation = await dbService.getConversationFromDB(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    const phoneNumber = conversation.contact.phoneNumber;

    const response = await whatsappService.sendTextMessage(phoneNumber, text);
    console.log(response);
    
    const savedMessage = await dbService.createMessageToDB({
        conversationId,
        from: phoneNumber,
        content: text,
        id_meta: response.data.messages?.[0]?.id || null
      });
  
    res.json({ success: true, message: savedMessage });

  } catch (error) {
    console.error("❌ Error enviando mensaje:", error?.response?.data || error.message);
    res.status(500).json({ error: "Error al enviar el mensaje" });
  }
};

module.exports = {
  sendMessage
};
