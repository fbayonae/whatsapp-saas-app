const whatsappService = require('../services/whatsappService');
const dbService = require('../services/dbService');

const syncTemplates = async (req, res) => {
  try {

    console.log("syncTemplates");

    const templates = await whatsappService.getTemplatesFromMeta();
    const results = [];

    for (const tpl of templates) {
      const savedTpl = await dbService.saveTemplateToDB(tpl);
      if (tpl.components?.length) {
        for (const comp of tpl.components) {
          await dbService.saveComponentToDB(comp, savedTpl.id);
        }
      }
      results.push(savedTpl.name);
    }

    res.json({
      message: '✅ Plantillas y componentes sincronizados',
      total: results.length,
      nombres: results
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al sincronizar plantillas' });
  }
};

const generateTemplatePayload = async (req, res) => {
  const templateId = req.params.id;
  const conversationId = req.query.conversationId || 1; // valor de ejemplo si no se proporciona

  try {
    const template = await dbService.getTemplateByIdFromDB(templateId);
    if (!template) {
      return res.status(404).json({ error: "Plantilla no encontrada" });
    }

    const payload = {
      conversationId,
      template: template.id_meta,
      language: template.language,
      parameters: []
    };

    const bodyComponent = template.components.find(c => c.type === "BODY");
    if (bodyComponent?.text && bodyComponent.text.includes("{{")) {
      const bodyMatches = bodyComponent.text.match(/{{\d+}}/g) || [];
      payload.parameters.push({
        body: bodyMatches.map((_, i) => `valor_body_${i + 1}`)
      });
    }

    const buttonComponent = template.components.find(c => c.type === "BUTTONS");
    if (buttonComponent && buttonComponent.buttons?.length) {
      buttonComponent.buttons.forEach((btn, i) => {
        if (btn.url?.includes("{{")) {
          const urlMatches = btn.url.match(/{{\d+}}/g) || [];
          payload.parameters.push({
            [`button${i + 1}`]: urlMatches.map((_, j) => `valor_btn${i + 1}_${j + 1}`)
          });
        }
      });
    }

    return res.json(payload);
  } catch (error) {
    console.error("❌ Error generando payload de plantilla:", error);
    return res.status(500).json({ error: "Error interno generando el payload" });
  }
};


const getTemplatesWhatsapp = async (req, res) => {
  try {
    const templates = await whatsappService.getTemplatesFromMeta();
    console.log(templates);
    res.json(templates);
  } catch (error) {
    console.error('❌ Error obteniendo plantillas:', error);
    res.status(500).json({ error: 'Error al obtener las plantillas' });
  }
};

const getTemplates = async (req, res) => {
  try {
    const templates = await dbService.getTemplatesFromDB();
    res.json(templates);
  } catch (error) {
    console.error('❌ Error obteniendo plantillas:', error);
    res.status(500).json({ error: 'Error al obtener las plantillas' });
  }
};

const deleteTemplate = async (req, res) => {
  const template_id_meta = req.params.id_meta;
  try {

    const template = await dbService.getTemplateByIdFromDB(template_id_meta);

    if (!template) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    const response = await dbService.deleteTemplateFromDB(template_id_meta);
    if (!response) {
      return res.status(500).json({ error: 'Error al eliminar la plantilla de la base de datos' });
    }
    console.log("Plantilla eliminada de la base de datos");
    res.json({ message: 'Plantilla eliminada de la base de datos' });
    /*const response = await whatsappService.deleteTemplate({
      templateId: template_id_meta,
      name: template.name
    });
  
    res.json(response);*/
  } catch (error) {
    console.error('❌ Error obteniendo plantillas:', error);
    res.status(500).json({ error: 'Error al obtener las plantillas' });
  }
};

const createTemplate = async (req, res) => {

  console.log(req.body);
  const { name, language, category, components } = req.body;

  if (!name || !language || !category || !components || !Array.isArray(components)) {
    return res.status(400).json({ error: "Faltan campos obligatorios o formato inválido" });
  }

  try {

    // Validar tipos permitidos
    const allowedComponentTypes = ["HEADER", "BODY", "FOOTER", "BUTTONS"];
    const validatedComponents = components.map(component => {
      if (!allowedComponentTypes.includes(component.type)) {
        throw new Error(`Tipo de componente no permitido: ${component.type}`);
      }
      return component;
    });

    // Enviar plantilla a WhatsApp
    const response = await whatsappService.createTemplate({
      name,
      language,
      category,
      components: validatedComponents
    });

    console.log(response);

    let template = {
      name,
      language,
      category: response.category,
      status: response.status,
      id_meta: response.id,
      components: validatedComponents
    };

    const saveTemplate = await dbService.saveTemplateToDB(template);
    if (template.components?.length) {
      for (const comp of template.components) {
        await dbService.saveComponentToDB(comp, response.id);
      }
    }

    res.json({ succes: true, message: "Plantilla creada correctamente", template: saveTemplate });
  } catch (error) {
    console.error('❌ Error creando plantilla:', error);
    res.status(500).json({ error: 'Error al crear la plantilla' });
  }
};

module.exports = {
  syncTemplates,
  getTemplates,
  createTemplate,
  deleteTemplate,
  getTemplatesWhatsapp,
  generateTemplatePayload
  //updateTemplate
};
