const axios = require('axios');
const fs = require("fs");

const dbService  = require('../services/dbService');
const whatsappService  = require('../services/whatsappService');
const mediaUtils  = require("../utils/mediaUtils");


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
        content: text,
        id_meta: response.messages?.[0]?.id || null
      });
  
    res.json({ success: true, message: savedMessage });

  } catch (error) {
    console.error("❌ Error enviando mensaje:", error?.response?.data || error.message);
    res.status(500).json({ error: "Error al enviar el mensaje" });
  }
};

const sendMessageMedia = async (req, res) => {
    try {
        const { conversationId, caption } = req.body;
        const file = req.file;

        // 1. Obtener conversación y número
        const conversation = await dbService.getConversationFromDB(conversationId);

        if (!conversation) {
        return res.status(404).json({ error: "Conversación no encontrada" });
        }

        const phone = conversation.contact.phoneNumber;

        if (!file || !phone) {
          return res.status(400).json({ error: "Faltan el archivo o el número de teléfono" });
        }

        // Detectar tipo de media (image, audio, document...)
        const detectedMediaType = mediaUtils.detectMediaType(file.mimetype);
        console.log("detectedMediaType", detectedMediaType);
        console.log("file.mimetype", file.mimetype);

        // ✅ Validar archivo
        const { valid, reason, type: media_type } = mediaUtils.validateMediaFile(file);

        if (!valid) {
        return res.status(400).json({ error: `Archivo no soportado: ${reason}` });
        }

        // 1. Subir el archivo a Meta
        const media_id = await whatsappService.uploadMedia(file.path, file.mimetype);
        console.log("media_id", media_id);  

        // 2. Enviar el mensaje con ese media_id
        const response = await whatsappService.sendMediaMessage({
          phone,
          media_id,
          detectedMediaType, // o "image", según lo que esperes
          caption
        });
    
        // 3. Limpiar archivo temporal
        fs.unlinkSync(file.path);
    
        res.json({
          success: true,
          messageId: response?.data?.messages?.[0]?.id || null,
        });
      } catch (error) {
        console.error("❌ Error en sendMedia:", error.response?.data || error.message);
        res.status(500).json({ error: "Error al enviar archivo por WhatsApp" });
      } 
}; 

module.exports = {
  sendMessage,
  sendMessageMedia
};
