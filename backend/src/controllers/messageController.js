const axios = require('axios');
const fs = require("fs");

const dbService = require('../services/dbService');
const whatsappService = require('../services/whatsappService');
const mediaUtils = require("../utils/mediaUtils");


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
      type: "text",
      content: text,
      id_meta: response.messages?.[0]?.id || null
    });

    res.json({ success: true, message: savedMessage });

  } catch (error) {
    console.error("❌ Error enviando mensaje:", error?.response?.data || error.message);
    res.status(500).json({ error: "Error al enviar el mensaje" });
  }
};

const sendMessageTemplate = async (req, res) => {
  const { conversationId, template, language, parameters } = req.body;

  if (!conversationId || !template || !language) {
    return res.status(400).json({ error: "conversationId, template y language son requeridos" });
  }

  try {
    // 1. Obtener conversación y número
    const conversation = await dbService.getConversationFromDB(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    const phone = conversation.contact.phoneNumber;

    const response_template = await dbService.getTemplateByIdFromDB(template);

    if (!response_template) {
      return res.status(404).json({ error: "Plantilla no encontrada" });
    }

    const template_name = response_template.name;

     // Función para verificar si hay {{n}} en algún componente
     const hasParams = response_template.components.some(comp =>
      /{{\d+}}/.test(comp.text || "") ||
      comp.buttons?.some(btn => /{{\d+}}/.test(btn.url || ""))
    );

    // Preparar componentes según parámetros recibidos
    const bodyParams = parameters.find(p => p.body)?.body || [];
    const buttonParams = parameters.filter(p => Object.keys(p)[0].startsWith("button"));

    const components = [];

    if (bodyParams.length) {
      components.push({
        type: "body",
        parameters: bodyParams.map(p => ({ type: "text", text: p }))
      });
    }

    if (buttonParams.length) {
      const buttons = buttonParams.map((btnObj, index) => {
        const key = Object.keys(btnObj)[0];
        const params = btnObj[key];
        return {
          type: "button",
          sub_type: "url",
          index,
          parameters: params.map(p => ({ type: "text", text: p }))
        };
      });
      components.push(...buttons);
    }

    // ✅ Construir payload de envío según si hay parámetros o no
    const payload = {
      phone,
      template,
      template_name,
      language,
    };

    if (hasParams) {
      payload.parameters = components;
    }

    // Composición del mensaje guardado
    const bodyComponent = response_template.components.find(c => c.type === "BODY");
    const footerComponent = response_template.components.find(c => c.type === "FOOTER");
    const headerComponent = response_template.components.find(c => c.type === "HEADER");

    let finalText = bodyComponent?.text || "";
    if (bodyParams.length) {
      finalText = finalText.replace(/{{(\d+)}}/g, (_, index) => bodyParams[parseInt(index) - 1] || "");
    }

    console.log("Final Text:", finalText);
    console.log("Header:", headerComponent?.text);
    console.log("Footer:", footerComponent?.text);
    console.log("Button Params:", buttonParams);

    const response = await whatsappService.sendTemplateMessage(payload);
    console.log(response);

    // Guardar mensaje con sustituciones
    const savedMessage = await dbService.createMessageToDB({
      conversationId,
      type: "template",
      content: finalText,
      header: headerComponent?.text || "",
      footer: footerComponent?.text || "",
      action: JSON.stringify(buttonParams),
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

    // ✅ Validar archivo
    const { valid, reason, type: media_type } = mediaUtils.validateMediaFile(file);

    if (!valid) {
      return res.status(400).json({ error: `Archivo no soportado: ${reason}` });
    }

    // 1. Subir el archivo a Meta
    const media_id = await whatsappService.uploadMedia(file.path, file.mimetype);

    // 2. Enviar el mensaje con ese media_id
    const response = await whatsappService.sendMediaMessage({
      phone,
      media_id,
      media_type: detectedMediaType, // o "image", según lo que esperes
      caption
    });

    console.log(response);

    // 3. Obtener información del archivo subido 
    const media_response = await whatsappService.getMediaData(media_id);

    // 4. Limpiar archivo temporal
    fs.unlinkSync(file.path);

    // 5. Guardar mensaje en la base de datos
    const savedMessage = await dbService.createMessageToDB({
      conversationId: parseInt(conversationId),
      type: detectedMediaType,
      content: caption || '',
      id_meta: response.messages?.[0]?.id || null,
      contextId: '',
      status: 'SENT',
      media_id: media_id,
      media_mimeType: media_response.mime_type,
      media_sha256: media_response.sha256
    });

    // 6. Guardar el documento en downloads 
    if (media_response) {
      try {
        const url = await whatsappService.getMediaUrl(media_id);
        const localFile = await whatsappService.downloadMediaFile(url, media_id, media_response.mime_type);

        console.log("📥 Archivo guardada en:", localFile);
      } catch (error) {
        console.error("❌ Error al descargar archivo multimedia:", error.message);
      }
    }

    res.json({ success: true, message: savedMessage });

  } catch (error) {
    console.error("❌ Error en sendMedia:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al enviar archivo por WhatsApp" });
  }
};

const sendMessageCTA = async (req, res) => {

  const { conversationId, header, header_type, body, footer, action } = req.body;
  console.log(req.body);

  if (!conversationId || !body || !action) {
    return res.status(400).json({ error: "conversationId, action y body son requeridos" });
  }

  try {

    // 1. Obtener conversación y número
    const conversation = await dbService.getConversationFromDB(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    const phone = conversation.contact.phoneNumber;

    if (!phone) {
      return res.status(400).json({ error: "Faltan el número de teléfono" });
    }

    const response = await whatsappService.sendCTAMessage({ phone, header_type, header, body, footer, action });
    console.log(response);

    const savedMessage = await dbService.createMessageToDB({
      conversationId: parseInt(conversationId),
      type: "cta",
      content: body,
      id_meta: response.messages?.[0]?.id || null,
      contextId: '',
      status: 'SENT',
      media_id: null,
      media_mimeType: null,
      media_sha256: null,
      header_type: header_type,
      header: header,
      footer: footer,
      action: action
    });

    res.json({ success: true, message: savedMessage });

  } catch (error) {
    console.error("❌ Error en sendCTA:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al enviar mensaje CTA por WhatsApp" });
  }
};

const sendMessageReply = async (req, res) => {

  const { conversationId, header, body, footer, buttons, metadata } = req.body;
  const file = req.file;
  let header_type = req.body.header_type || '';
  let header_media_id = '';
  let media_response = '';

  console.log(req.body);
  console.log(file);

  if (!conversationId || !body || !buttons) {
    return res.status(400).json({ error: "conversationId, buttons y body son requeridos" });
  }

  try {

    if (file && file.path && file.originalname) {
      // Detectar tipo de media (image, audio, document...)
      const detectedMediaType = mediaUtils.detectMediaType(file.mimetype);

      // ✅ Validar archivo
      const { valid, reason, type: media_type } = mediaUtils.validateMediaFile(file);

      header_type = media_type;

      if (!valid) {
        return res.status(400).json({ error: `Archivo no soportado: ${reason}` });
      }

      // Subir el archivo a Meta
      header_media_id = await whatsappService.uploadMedia(file.path, file.mimetype);

      // Obtener información del archivo subido 
      media_response = await whatsappService.getMediaData(header_media_id);

      // Limpiar archivo temporal
      fs.unlinkSync(file.path);
    }

    // 1. Obtener conversación y número
    const conversation = await dbService.getConversationFromDB(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    const phone = conversation.contact.phoneNumber;

    if (!phone) {
      return res.status(400).json({ error: "Faltan el número de teléfono" });
    }

    const response = await whatsappService.sendReplyMessage({ phone, header_type, header, header_media_id, body, footer, buttons });
    console.log(response);

    const parsedButtons = typeof buttons === 'string' ? JSON.parse(buttons) : buttons;
    const parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

    const savedMessage = await dbService.createMessageToDB({
      conversationId: parseInt(conversationId),
      type: "reply",
      content: body,
      id_meta: response.messages?.[0]?.id || null,
      contextId: '',
      status: 'SENT',
      media_id: header_media_id || null,
      media_mimeType: media_response.mime_type,
      media_sha256: media_response.sha256,
      header_type: header_type,
      header: header,
      footer: footer,
      action: parsedButtons,
      metadata: parsedMetadata
    });

    if (media_response) {
      try {
        const url = await whatsappService.getMediaUrl(header_media_id);
        const localFile = await whatsappService.downloadMediaFile(url, header_media_id, media_response.mime_type);

        console.log("📥 Archivo guardada en:", localFile);
      } catch (error) {
        console.error("❌ Error al descargar archivo multimedia:", error.message);
      }
    }

    res.json({ success: true, message: savedMessage });

  } catch (error) {
    console.error("❌ Error en sendReply:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al enviar mensaje Reply por WhatsApp" });
  }
};


module.exports = {
  sendMessage,
  sendMessageMedia,
  sendMessageCTA,
  sendMessageReply,
  sendMessageTemplate
};
