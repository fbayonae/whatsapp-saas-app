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

  try {

     // 1. Obtener la conversación del contacto
    const conversations = await dbService.getConversationsByContactFromDB({ phoneNumber: contactPhone });
    const conversation = conversations?.[0];
    if (!conversation) {
      throw new Error("No se encontró una conversación para el contacto.");
    }

    const conversationId = conversation.id;

    // 2. Obtener información de la plantilla
    const template = await dbService.getTemplateByIdFromDB(templateId);
    if (!template) throw new Error("Plantilla no encontrada");

    const bodyComponent = template.components.find(c => c.type === "BODY");
    const footerComponent = template.components.find(c => c.type === "FOOTER");
    const headerComponent = template.components.find(c => c.type === "HEADER");

    const bodyParams = parameters.find(p => p.type === "body")?.parameters || [];
    const buttonParams = parameters.filter(p => p.type === "button");

    // Armar contenido visible
    let finalText = bodyComponent?.text || "";
    if (bodyParams.length) {
      finalText = finalText.replace(/{{(\d+)}}/g, (_, index) =>
        bodyParams[parseInt(index) - 1]?.text || ""
      );
    }

    // 3. Enviar mensaje
    const result = await whatsappService.sendTemplateMessage({
      phone: contactPhone,
      template: templateId,
      template_name,
      language,
      parameters,
    });

    const id_meta = result.messages?.[0]?.id || null;

    // 4. Guardar mensaje en BBDD
    const savedMessage = await dbService.createMessageToDB({
      conversationId,
      type: "template",
      content: finalText,
      header: headerComponent?.text || "",
      footer: footerComponent?.text || "",
      action: JSON.stringify(buttonParams),
      id_meta,
    });

    // 5. Marcar contacto como enviado
    await dbService.markContactAsSent(campaignContactId, {
      messageId: savedMessage.id,
    });

    console.log(`✅ Enviado y registrado mensaje a ${contactPhone}`);
  } catch (error) {
    console.error(`❌ Error al enviar a ${contactPhone}:`, error?.message || error);

    await dbService.markContactAsError(campaignContactId, {
      error: error.message || "Error desconocido",
    });
  }
};


/*const CampaignSendWorker = async (data) => {
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

    // Enviar mensaje de plantilla a través del servicio de WhatsApp
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
};*/

module.exports = {CampaignSendWorker};
