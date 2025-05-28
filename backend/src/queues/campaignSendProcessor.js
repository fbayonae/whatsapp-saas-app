// src/queues/CampaignSendProcessor.js
const { Worker } = require("bullmq");
const connection = require("./connection");
const whatsappService = require("../services/whatsappService");
const dbService = require("../services/dbService");

const CampaignSendWorker = async (data) => {
  const {
    campaignContactId,
    contactPhone,
    templateId,
    template_name,
    language,
    parameters,
  } = data;
  console.log(data);
  try {
    const result = await whatsappService.sendTemplateMessage({
      phone: contactPhone,
      template: templateId,
      template_name,
      language,
      parameters,
    });

    // Actualizar el estado del envío como enviado
    await dbService.markContactAsSent(campaignContactId, {
      id_meta: result.messages?.[0]?.id || null,
    });

    console.log(`✅ Enviado a ${contactPhone}`);
  } catch (error) {
    console.error(`❌ Error al enviar a ${contactPhone}:`, error?.message || error);

    // Marcar como error
    await dbService.markContactAsError(campaignContactId, {
      error: error.message || "Error desconocido",
    });
  }
};

module.exports = {CampaignSendWorker};
