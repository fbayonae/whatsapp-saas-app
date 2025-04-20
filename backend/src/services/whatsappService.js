require('dotenv').config();

const axios = require('axios');
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");
const dbService = require("./dbService");

const token = process.env.TOKEN_DEV;
const phoneId = process.env.PHONE_NUMBER_ID;
const businessId = process.env.BUSINESS_ID;
const url_base = "https://graph.facebook.com/";
const version = process.env.VERSION_GRAPH;

/************************************* PLANTILLAS ***********************************/

const getTemplatesFromMeta = async () => {

  try {
    const response = await axios.get(`${url_base}${version}/${businessId}/message_templates`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('❌ Error obteniendo plantillas de Meta:', error.message);
    throw error;
  }
};

const createTemplate = async ({ name, language, category, components }) => {

  try {
    const response = await axios.post(`${url_base}${version}/${businessId}/message_templates`, {
      name,
      language,
      category,
      components
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error creando plantilla en Meta:', error.message);
    throw error;
  }
};

const deleteTemplate = async ({ templateId, name }) => {
  try {
    const response = await axios.delete(`${url_base}${version}/${bussinessId}/message_templates/hsm_id=${templateId}&name=${name}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error eliminando plantilla en Meta:', error.message);
    throw error;
  }
};

const updateTemplate = async ({ templateId, name, language, category, components }) => {
  try {
    const response = await axios.post(`${url_base}${version}/${templateId}`, {
      name,
      language,
      category,
      components
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando plantilla en Meta:', error.message);
    throw error;
  }
};
/********************************** FIN PLANTILLAS ***********************************/

/********************************** ENVIAR MENSAJES ******************************/
const sendTextMessage = async (phone, message) => {
  try {
    const response = await axios.post(`${url_base}${version}/${phoneId}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "text",
      text: {
        body: message
      }
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error.message);
    throw error;
  }
};

const buildTemplateComponents = (components, parameters = []) => {
  const paramList = [...parameters];
  const result = [];

  for (const comp of components) {
    // BODY
    if (comp.type === "BODY" && /{{\d+}}/.test(comp.text || "")) {
      const placeholders = comp.text.match(/{{\d+}}/g) || [];
      result.push({
        type: "body",
        parameters: placeholders.map((_, i) => ({
          type: "text",
          text: paramList[i] || ""
        }))
      });
    }

    // BOTONES
    if (comp.type === "BUTTONS" && comp.buttons?.length) {
      const buttons = comp.buttons.map((btn, i) => {
        if (btn.type === "URL" && btn.url?.includes("{{")) {
          const match = btn.url.match(/{{(\d+)}}/);
          const idx = match ? parseInt(match[1], 10) - 1 : -1;
          return {
            type: "url",
            sub_type: "url",
            index: i,
            parameters: [
              {
                type: "text",
                text: paramList[idx] || ""
              }
            ]
          };
        } else if (btn.type === "PHONE_NUMBER") {
          return {
            type: "phone_number",
            sub_type: "phone_number",
            index: i
          };
        } else if (btn.type === "QUICK_REPLY") {
          return {
            type: "quick_reply",
            sub_type: "quick_reply",
            index: i
          };
        }
        return null;
      }).filter(Boolean);

      if (buttons.length > 0) {
        result.push({
          type: "button",
          buttons
        });
      }
    }
  }

  return result;
};

const sendTemplateMessage = async ({ phone, template, template_name, language, parameters }) => {
  const parsedParameters = typeof parameters === 'string' ? JSON.parse(parameters) : parameters;

  try {
    const components = [];

    // BODY
    const bodyParams = parsedParameters.find(p => p.body)?.body;
    if (bodyParams && bodyParams.length) {
      components.push({
        type: "body",
        parameters: bodyParams.map(p => ({ type: "text", text: p }))
      });
    }

    console.log("bodyParams", bodyParams);

    // BUTTONS (button1, button2, etc.)
    const buttonComponents = parsedParameters.filter(p => {
      const key = Object.keys(p)[0];
      return key.startsWith("button");
    });

    if (buttonComponents.length) {
      const buttons = buttonComponents.map((btnObj, index) => {
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

    console.log("buttonComponents", buttonComponents);

    const response = await axios.post(`${url_base}${version}/${phoneId}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "template",
      template: {
        name: template_name,
        language: { code: language },
        components: components.length > 0 ? components : undefined
      }
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error?.response?.data || error.message);
    throw error;
  }
};

const sendMediaMessage = async ({ phone, media_id, media_type, caption }) => {
  try {
    const response = await axios.post(`${url_base}${version}/${phoneId}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: media_type,
      [media_type]: {
        id: media_id,
        ...(caption ? { caption } : {})
      }
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando mensaje de media:', error.message);
    throw error;
  }
};

const sendCTAMessage = async ({ phone, header_type, header, body, footer, action }) => {
  try {
    const parsedAction = typeof action === 'string' ? JSON.parse(action) : action;
    const response = await axios.post(`${url_base}${version}/${phoneId}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "interactive",
      interactive: {
        type: "cta_url",
        header: {
          type: header_type || "",
          text: header || '',
        },
        body: {
          text: body,
        },
        footer: {
          text: footer || ''
        },
        action: {
          name: "cta_url",
          parameters: {
            display_text: parsedAction.display_text || "Ver",
            url: parsedAction.url,
          }
        },
      }
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando mensaje CTA:', error.message);
    throw error;
  }
};

const sendReplyMessage = async ({ phone, header_type, header, header_media_id, body, footer, buttons }) => {
  try {
    const parsedButtons = typeof buttons === 'string' ? JSON.parse(buttons) : buttons;
    const interactive = {
      type: "button",
      body: {
        text: body
      },
      action: {
        buttons: parsedButtons.map(btn => ({
          type: "reply",
          reply: {
            id: btn.id,
            title: btn.title
          }
        }))
      }
    };

    // Agregar header si se proporciona
    if (header_type) {
      if (header_type === "text") {
        interactive.header = {
          type: "text",
          text: header || ""
        };
      } else if (["image", "video", "document"].includes(header_type)) {
        if (!header_media_id) {
          throw new Error(`Se requiere media_id para header de tipo ${header_type}`);
        }
        interactive.header = {
          type: header_type,
          [header_type]: {
            id: header_media_id
          }
        };
      }
    }
    console.log(interactive);
    const response = await axios.post(`${url_base}${version}/${phoneId}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "interactive",
      interactive
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando mensaje Reply:', error.message);
    throw error;
  }
};
/********************************** FIN ENVIAR MENSAJES ******************************/



/********************************** ARCHIVOS *****************************************/
const uploadMedia = async (filePath, mimetype) => {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("type", mimetype); // ej: application/pdf
  form.append("messaging_product", "whatsapp");

  const response = await axios.post(
    `${url_base}${version}/${phoneId}/media`,
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
    }
  );

  return response.data.id; // <- media_id
};

const getMediaUrl = async (media_id) => {
  const response = await axios.get(
    `${url_base}${version}/${media_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.url;
};

const getMediaData = async (media_id) => {
  const response = await axios.get(
    `${url_base}${version}/${media_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const downloadMediaFile = async (url, media_id, mimetype) => {
  const ext = mimetype.split("/")[1]; // ejemplo: image/jpeg → jpeg
  const filename = `${media_id}.${ext}`;
  const filepath = path.join(__dirname, "../downloads", filename);

  const response = await axios.get(url, {
    responseType: "stream",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const writer = fs.createWriteStream(filepath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filepath));
    writer.on("error", reject);
  });
};

/********************************** FIN ARCHIVOS ****************************************/

module.exports = {
  getTemplatesFromMeta,
  createTemplate,
  deleteTemplate,
  sendTextMessage,
  sendMediaMessage,
  sendCTAMessage,
  sendReplyMessage,
  sendTemplateMessage,
  uploadMedia,
  getMediaUrl,
  downloadMediaFile,
  getMediaData,

};