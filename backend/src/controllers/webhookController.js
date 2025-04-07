const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // defínelo en tu .env

// ✅ Procesa mensajes entrantes
const handleWebhookMessage = async (value) => {
  const messages = value.messages || [];
  const contact = value.contacts || [];

  for (const msg of messages) {
    try {
      const from = msg.from;
      const text = msg.text?.body || '';
      const type = msg.type;
      const meta_id = msg.id;
      const name = contact[0]?.profile?.name || 'desconocido';
      const timestamp = new Date(Number(msg.timestamp) * 1000);

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
            name: name}
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

      // 5. Guardar mensaje recibido
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          from: from,
          direction: 'INBOUND',
          content: text,
          timestamp: timestamp,
          type: type,
          id_meta: meta_id
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
  console.log("🔄 Estado de plantilla actualizado:", JSON.stringify(value, null, 2));
  // Aquí podrías guardar el estado o marcar como rechazada, etc.
};

module.exports = {
  handleWebhookMessage,
  handleTemplateStatusUpdate
};
