const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const whatsappService = require("../services/whatsappService");

//const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // defínelo en tu .env

// ✅ Procesa mensajes entrantes
const handleWebhookMessage = async (value) => {
  const messages = value.messages || [];
  const contact_wa = value.contacts || [];

  for (const msg of messages) {
    console.log(msg);
    try {
      const from = msg.from;
      const text = msg.text?.body || '';
      const contextId = msg.context?.id || '';
      const type = msg.type;
      const meta_id = msg.id;
      const name = contact_wa[0]?.profile?.name || 'desconocido';
      const timestamp = new Date(Number(msg.timestamp) * 1000);

      // Si el mensaje viene con un archivo imagen, documento, video o audio
      let mediaInfo = null;

      if (msg.type === "image" && msg.image?.id) {
        mediaInfo = {
          mediaId: msg.image.id,
          mimeType: msg.image.mime_type,
          sha256: msg.image.sha256,
          caption: msg.image.caption,
        };

      } else if (msg.type === "document" && msg.document?.id) {
        mediaInfo = {
          mediaId: msg.document.id,
          mimeType: msg.document.mime_type,
          sha256: msg.document.sha256,
          caption: msg.image.caption,
        };
      } else if (msg.type === "audio" && msg.audio?.id) {
        mediaInfo = {
          mediaId: msg.audio.id,
          mimeType: msg.audio.mime_type,
          sha256: msg.audio.sha256,
        };
      } else if (msg.type === "video" && msg.video?.id) {
        mediaInfo = {
          mediaId: msg.video.id,
          mimeType: msg.video.mime_type,
          sha256: msg.video.sha256,
          caption: msg.image.caption,
        };
      }

      // guardamos archivo
      if (mediaInfo) {
        try {
          const url = await whatsappService.getMediaUrl(msg.image.id);
          const localFile = await whatsappService.downloadMediaFile(url, msg.image.id, msg.image.mime_type);

          console.log("📥 Archivo guardada en:", localFile);
        } catch (error) {
          console.error("❌ Error al descargar archivo multimedia:", error.message);
        }
      }

      console.log(`💬 Recibido mensaje de ${from}: ${text}`);

      // 1. Buscar conversación activa por número de teléfono
      let conversation = await prisma.conversation.findFirst({
        where: {
          contact: {
            phoneNumber: from
          }
        },
        include: {
          contact: true
        }
      });

      // 2. Si no hay contacto, crearlo
      let contact;
      if (!conversation) {
        contact = await prisma.contact.upsert({
          where: { phoneNumber: from },
          update: {},
          create: {
            phoneNumber: from,
            name: name
          }
        });

        // 3. Crear nueva conversación
        conversation = await prisma.conversation.create({
          data: {
            contactId: contact.id,
            lastMessageAt: timestamp
          }
        });

      } else {
        contact = conversation.contact;

        // 4. Actualizar fecha de último mensaje recibido
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: timestamp
          }
        });
      }
      console.log(msg.interactive?.button_reply?.title);
      // 5. Guardar mensaje recibido
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          //from: from,
          direction: 'INBOUND',
          content: text || mediaInfo?.caption || msg.interactive?.button_reply?.title || '',
          timestamp: timestamp,
          type: type,
          id_meta: meta_id,
          contextId: contextId,
          status: 'RECEIVED',
          media_id: mediaInfo?.mediaId,
          media_mimeType: mediaInfo?.mimeType,
          media_sha256: mediaInfo?.sha256,
          interactive: msg.interactive || null,
        }
      });

      console.log(`✅ Mensaje guardado en conversación ${conversation.id}`);
    } catch (error) {
      console.error(`❌ Error procesando mensaje: ${error.message}`, error);
    }
  }
};

// ✅ Procesa actualizaciones de estado de plantillas
const handleTemplateStatusUpdate = async (value) => {
  const {
    event,
    message_template_id,
    message_template_name,
    message_template_language,
    reason
  } = value;

  try {
    const updated = await prisma.template.updateMany({
      where: {
        id_meta: message_template_id.toString(),
        name: message_template_name,
        language: message_template_language
      },
      data: {
        status: event,
        rejectionReason: reason || null
      }
    });

    console.log(`✅ Estado actualizado para la plantilla "${message_template_name}" (${message_template_id}) => ${event}`);
    return updated;
  } catch (error) {
    console.error("❌ Error actualizando estado de plantilla:", error);
  }
};


module.exports = {
  handleWebhookMessage,
  handleTemplateStatusUpdate
};
