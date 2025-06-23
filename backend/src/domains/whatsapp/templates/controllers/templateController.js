const whatsappService = require('../../../infrastructure/whatsapp/whatsappService');
const dbTemplates = require('../services/templateService');

const syncTemplates = async (req, res) => {
  try {

    console.log("syncTemplates");

    const templates = await whatsappService.getTemplatesFromMeta();
    const results = [];

    for (const tpl of templates) {
      const savedTpl = await dbTemplates.saveTemplateToDB(tpl);
      if (tpl.components?.length) {
        for (const comp of tpl.components) {
          await dbTemplates.saveComponentToDB(comp, savedTpl.id);
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
  const conversationId = req.query.conversationId || 1;

  try {
    const template = await dbTemplates.getTemplateByIdFromDB(templateId);
    if (!template) {
      return res.status(404).json({ error: "Plantilla no encontrada" });
    }

    const payload = {
      conversationId,
      template: template.id_meta,
      language: template.language,
      parameters: []
    };

    // BODY si tiene placeholders
    const bodyComponent = template.components.find(c => c.type === "BODY");
    if (bodyComponent?.text?.includes("{{")) {
      const bodyMatches = bodyComponent.text.match(/{{\d+}}/g);
      if (bodyMatches?.length) {
        payload.parameters.push({
          type: "body",
          parameters: bodyMatches.map((_, i) => ({
            type: "text",
            text: `[[valor_body_${i + 1}]]`
          }))
        });
      }
    }

    // BUTTONS con URL y parámetros
    const buttonComponent = template.components.find(c => c.type === "BUTTONS");
    if (buttonComponent?.buttons?.length) {
      buttonComponent.buttons.forEach((btn, i) => {
        if (btn.type === "URL" && btn.url?.includes("{{")) {
          const urlMatches = btn.url.match(/{{\d+}}/g);
          if (urlMatches?.length) {
            payload.parameters.push({
              type: "button",
              sub_type: "url",
              index: i,
              parameters: urlMatches.map((_, j) => ({
                type: "text",
                text: `[[valor_button${i}_${j + 1}]]`
              }))
            });
          }
        }
        // ❌ Eliminar el else-if del tipo PHONE_NUMBER si no tiene parámetros
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
    const templates = await dbTemplates.getTemplatesFromDB();
    res.json(templates);
  } catch (error) {
    console.error('❌ Error obteniendo plantillas:', error);
    res.status(500).json({ error: 'Error al obtener las plantillas' });
  }
};

const deleteTemplate = async (req, res) => {
  const template_id_meta = req.params.id_meta;
  try {

    const template = await dbTemplates.getTemplateByIdFromDB(template_id_meta);

    if (!template) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    const response = await dbTemplates.deleteTemplateFromDB(template_id_meta);
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

    const validatedComponents = components
      .filter(component => {
        if (!allowedComponentTypes.includes(component.type)) {
          throw new Error(`Tipo de componente no permitido: ${component.type}`);
        }

        if (
          component.type === "HEADER" &&
          component.format === "TEXT" &&
          (!component.text || component.text.trim() === "")
        ) {
          return false;
        }

        if (
          (component.type === "BODY" || component.type === "FOOTER") &&
          (!component.text || component.text.trim() === "")
        ) {
          return false;
        }

        if (
          component.type === "BUTTONS" &&
          (!Array.isArray(component.buttons) || component.buttons.length === 0)
        ) {
          return false;
        }

        return true;
      })
      .map(component => {
        // Limpieza de botones vacíos
        if (component.type === "BUTTONS" && Array.isArray(component.buttons)) {
          const validButtons = component.buttons.filter(btn =>
            btn.type === "QUICK_REPLY" &&
            btn.reply?.title &&
            btn.reply.title.trim() !== ""
          );
          return { ...component, buttons: validButtons };
        }

        // Añadir ejemplos si no existen
        if (component.type === "BODY" && !component.example) {
          const matches = component.text?.match(/{{\d+}}/g) || [];
          if (matches.length > 0) {
            const exampleBody = matches.map((_, i) => `Ejemplo${i + 1}`);
            component.example = { body_text: exampleBody };
          }
        }

        if (component.type === "HEADER" && component.format === "TEXT" && !component.example) {
          if ((component.text || "").includes("{{")) {
            component.example = { header_text: ["EjemploHeader"] };
          }
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
      status: response.status || "PENDING",
      id_meta: response.id,
      components: validatedComponents
    };

    const saveTemplate = await dbTemplates.saveTemplateToDB(template);
    if (template.components?.length) {
      for (const comp of template.components) {
        await dbTemplates.saveComponentToDB(comp, response.id);
      }
    }

    res.json({ succes: true, message: "Plantilla creada correctamente", template: saveTemplate });
  } catch (error) {
    console.error('❌ Error creando plantilla:', error);
    res.status(500).json({ error: 'Error al crear la plantilla' });
  }
};

const updateTemplate = async (req, res) => {
  const templateId = req.params.id_meta;
  const { name, language, category, components } = req.body;

  if (!name || !language || !category || !components || !Array.isArray(components)) {
    return res.status(400).json({ error: "Faltan campos obligatorios o formato inválido" });
  }

  try {
    const allowedComponentTypes = ["HEADER", "BODY", "FOOTER", "BUTTONS"];

    const validatedComponents = components
      .filter(component => {
        if (!allowedComponentTypes.includes(component.type)) {
          throw new Error(`Tipo de componente no permitido: ${component.type}`);
        }

        if (
          component.type === "HEADER" &&
          component.format === "TEXT" &&
          (!component.text || component.text.trim() === "")
        ) {
          return false;
        }

        if (
          (component.type === "BODY" || component.type === "FOOTER") &&
          (!component.text || component.text.trim() === "")
        ) {
          return false;
        }

        if (
          component.type === "BUTTONS" &&
          (!Array.isArray(component.buttons) || component.buttons.length === 0)
        ) {
          return false;
        }

        return true;
      })
      .map(component => {
        // Limpieza de botones vacíos
        if (component.type === "BUTTONS" && Array.isArray(component.buttons)) {
          const validButtons = component.buttons.filter(btn =>
            btn.type === "QUICK_REPLY" &&
            btn.reply?.title &&
            btn.reply.title.trim() !== ""
          );
          return { ...component, buttons: validButtons };
        }

        // Añadir ejemplos si no existen
        if (component.type === "BODY" && !component.example) {
          const matches = component.text?.match(/{{\d+}}/g) || [];
          if (matches.length > 0) {
            const exampleBody = matches.map((_, i) => `Ejemplo${i + 1}`);
            component.example = { body_text: exampleBody };
          }
        }

        if (component.type === "HEADER" && component.format === "TEXT" && !component.example) {
          if ((component.text || "").includes("{{")) {
            component.example = { header_text: ["EjemploHeader"] };
          }
        }

        return component;
      });

    const response = await whatsappService.updateTemplate({
      templateId,
      name,
      language,
      category,
      components: validatedComponents
    });

    console.log(response);

    const template = {
      name,
      language,
      category: response.category,
      status: response.status || "PENDING",
      id_meta: response.id,
      components: validatedComponents
    };

    const saveTemplate = await dbTemplates.saveTemplateToDB(template);
    if (template.components?.length) {
      for (const comp of template.components) {
        await dbTemplates.saveComponentToDB(comp, response.id);
      }
    }

    res.json({ succes: true, message: "Plantilla actualizada correctamente", template: saveTemplate });
  } catch (error) {
    console.error('❌ Error actualizando plantilla:', error);
    res.status(500).json({ error: 'Error al actualizar la plantilla' });
  }
};



module.exports = {
  syncTemplates,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplatesWhatsapp,
  generateTemplatePayload
  //updateTemplate
};
