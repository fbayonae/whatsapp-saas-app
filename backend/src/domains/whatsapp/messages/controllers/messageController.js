const axios = require('axios');
const fs = require("fs");

const { getPrismaClient } = require("../../../../prisma/client");

const templateService = require('../../templates/services/messageService');
const messageService = require('../services/messageService');
const whatsappService = require('../../../../infrastructure/whatsapp/whatsappService');
const mediaUtils = require("../../../utils/media");


const sendMessage = async (req, res) => {
    const { conversationId, text } = req.body;
    const prisma = getPrismaClient(req.user.tenantId);

    const withinWindow = await messageService.checkConversationWindow(prisma, parseInt(conversationId));

    if (!withinWindow) {
        return res.status(403).json({
            error: "La ventana de 24 horas ha expirado. Solo se pueden enviar mensajes de tipo plantilla."
        });
    }

    if (!conversationId || !text) {
        return res.status(400).json({ error: "conversationId y text son requeridos" });
    }

    try {
        // 1. Obtener conversación y número
        const conversation = await messageService.getConversationFromDB(prisma, parseInt(conversationId));

        if (!conversation) {
            return res.status(404).json({ error: "Conversación no encontrada" });
        }

        const phoneNumber = conversation.contact.phoneNumber;

        const response = await whatsappService.sendTextMessage(phoneNumber, text);

        const savedMessage = await messageService.createMessageToDB(prisma, {
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
    const prisma = getPrismaClient(req.user.tenantId);
    const { conversationId, template, language, parameters } = req.body;

    if (!conversationId || !template || !language) {
        return res.status(400).json({ error: "conversationId, template y language son requeridos" });
    }

    try {
        const conversation = await messageService.getConversationFromDB(prisma, parseInt(conversationId));
        if (!conversation) return res.status(404).json({ error: "Conversación no encontrada" });

        const phone = conversation.contact.phoneNumber;
        const response_template = await templateService.getTemplateByIdFromDB(prisma, template);
        if (!response_template) return res.status(404).json({ error: "Plantilla no encontrada" });

        const template_name = response_template.name;

        // Verifica si existen parámetros en algún componente
        const hasParams = response_template.components.some(comp =>
            /{{\d+}}/.test(comp.text || "") ||
            comp.buttons?.some(btn => /{{\d+}}/.test(btn.url || ""))
        );

        // Preparar componentes
        const bodyParams = parameters.find(p => p.type === "body")?.parameters || [];

        const components = [];

        if (bodyParams.length) {
            components.push({
                type: "body",
                parameters: bodyParams
            });
        }

        const buttonParams = parameters.filter(p => p.type === "button");
        if (buttonParams.length) {
            // Agregamos directamente los objetos tal como vienen
            components.push(...buttonParams);
        }

        // Armar payload
        const payload = {
            phone,
            template,
            template_name,
            language
        };

        if (hasParams && components.length > 0) {
            payload.parameters = components;
        }

        // Sustituir texto final
        const bodyComponent = response_template.components.find(c => c.type === "BODY");
        const footerComponent = response_template.components.find(c => c.type === "FOOTER");
        const headerComponent = response_template.components.find(c => c.type === "HEADER");

        let finalText = bodyComponent?.text || "";
        if (bodyParams.length) {
            finalText = finalText.replace(/{{(\d+)}}/g, (_, index) => bodyParams[parseInt(index) - 1]?.text || "");
        }

        const response = await whatsappService.sendTemplateMessage(payload);

        const savedMessage = await messageService.createMessageToDB(prisma, {
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
    const prisma = getPrismaClient(req.user.tenantId);
    try {
        const { conversationId, caption } = req.body;
        const file = req.file;

        const withinWindow = await messageService.checkConversationWindow(prisma, parseInt(conversationId));

        if (!withinWindow) {
            return res.status(403).json({
                error: "La ventana de 24 horas ha expirado. Solo se pueden enviar mensajes de tipo plantilla."
            });
        }

        // 1. Obtener conversación y número
        const conversation = await messageService.getConversationFromDB(prisma, parseInt(conversationId));

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

        // 3. Obtener información del archivo subido 
        const media_response = await whatsappService.getMediaData(media_id);

        // 4. Limpiar archivo temporal
        fs.unlinkSync(file.path);

        // 5. Guardar mensaje en la base de datos
        const savedMessage = await messageService.createMessageToDB(prisma, {
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
    const prisma = getPrismaClient(req.user.tenantId);
    const { conversationId, header, header_type, body, footer, action } = req.body;

    const withinWindow = await messageService.checkConversationWindow(prisma, parseInt(conversationId));

    if (!withinWindow) {
        return res.status(403).json({
            error: "La ventana de 24 horas ha expirado. Solo se pueden enviar mensajes de tipo plantilla."
        });
    }


    if (!conversationId || !body || !action) {
        return res.status(400).json({ error: "conversationId, action y body son requeridos" });
    }

    try {

        // 1. Obtener conversación y número
        const conversation = await messageService.getConversationFromDB(prisma, parseInt(conversationId));

        if (!conversation) {
            return res.status(404).json({ error: "Conversación no encontrada" });
        }

        const phone = conversation.contact.phoneNumber;

        if (!phone) {
            return res.status(400).json({ error: "Faltan el número de teléfono" });
        }

        const response = await whatsappService.sendCTAMessage({ phone, header_type, header, body, footer, action });

        const savedMessage = await messageService.createMessageToDB(prisma,{
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

    const prisma = getPrismaClient(req.user.tenantId);
    const { conversationId, header, body, footer, buttons, metadata } = req.body;

    const withinWindow = await messageService.checkConversationWindow(prisma, parseInt(conversationId));

    if (!withinWindow) {
        return res.status(403).json({
            error: "La ventana de 24 horas ha expirado. Solo se pueden enviar mensajes de tipo plantilla."
        });
    }

    const file = req.file;
    let header_type = req.body.header_type || '';
    let header_media_id = '';
    let media_response = '';

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
        const conversation = await messageService.getConversationFromDB(prisma, parseInt(conversationId));

        if (!conversation) {
            return res.status(404).json({ error: "Conversación no encontrada" });
        }

        const phone = conversation.contact.phoneNumber;

        if (!phone) {
            return res.status(400).json({ error: "Faltan el número de teléfono" });
        }

        const response = await whatsappService.sendReplyMessage({ phone, header_type, header, header_media_id, body, footer, buttons });

        const parsedButtons = typeof buttons === 'string' ? JSON.parse(buttons) : buttons;
        const parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

        const savedMessage = await messageService.createMessageToDB(prisma, {
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
