const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
//const whatsappService = require("../services/whatsappService");
const messageQueue = require("../../../../infrastructure/queues/messageQueue");

//const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // defínelo en tu .env

// ✅ Procesa mensajes entrantes y los encola
const handleWebhookMessage = async (value) => {
  const messages = value.messages || [];
  const contact_wa = value.contacts || [];

  for (const msg of messages) {
    try {
      const jobData = {
        message: msg,
        contact: contact_wa[0] || {}
      };

      await messageQueue.add("incoming-message", jobData);
      console.log(`📥 Mensaje encolado con ID: ${msg.id}`);
    } catch (error) {
      console.error(`❌ Error al encolar el mensaje: ${error.message}`, error);
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

// ✅ Procesa actualizaciones de calidad de plantillas
const handleTemplateQualityUpdate = async (value) => {
  const {
    previous_quality_score,
    new_quality_score,
    message_template_id,
    message_template_name,
    message_template_language
  } = value;

  try {
    const updated = await prisma.template.updateMany({
      where: {
        id_meta: message_template_id.toString(),
        name: message_template_name,
        language: message_template_language
      },
      data: {
        quality: new_quality_score,
        qualityPrev: previous_quality_score || null
      }
    });

    console.log(`✅ Calidad actualizada para la plantilla "${message_template_name}" (${message_template_id}) => ${new_quality_score}`);
    return updated;
  } catch (error) {
    console.error("❌ Error actualizando estado de plantilla:", error);
  }
};

// ✅ Procesa actualizaciones de categoria de plantillas
const handleTemplateCategoryUpdate = async (value) => {
  const {
    previous_category,
    new_category,
    correct_category,
    message_template_id,
    message_template_name,
    message_template_language
  } = value;

  try {
    const updated = await prisma.template.updateMany({
      where: {
        id_meta: message_template_id.toString(),
        name: message_template_name,
        language: message_template_language
      },
      data: {
        category: correct_category
      }
    });

    console.log(`✅ Calidad actualizada para la plantilla "${message_template_name}" (${message_template_id}) => ${new_quality_score}`);
    return updated;
  } catch (error) {
    console.error("❌ Error actualizando estado de plantilla:", error);
  }
};

const handleEchoMessage = async (value) => {
  const echoes = value.message_echoes || [];

  for (const msg of echoes) {
    const messageId = msg.id;
    const to = msg.to;
    const content = msg.text?.body || "";
    const timestamp = new Date(Number(msg.timestamp) * 1000).toISOString();

    console.log(`📤 Echo recibido: ${content} → ${to} (${timestamp})`);

    // Opcional: actualizar estado en la BBDD
    await prisma.message.updateMany({
      where: { id_meta: messageId },
      data: { status: "sent", deliveredAt: timestamp }
    });
  }
};



module.exports = {
  handleWebhookMessage,
  handleTemplateStatusUpdate,
  handleTemplateQualityUpdate,
  handleTemplateCategoryUpdate,
  handleEchoMessage 
};
