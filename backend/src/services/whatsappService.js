require('dotenv').config();

const axios = require('axios');
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

const token = process.env.TOKEN_DEV;
const phoneId = process.env.PHONE_NUMBER_ID;
const businessId = process.env.BUSINESS_ID;
const url_base = "https://graph.facebook.com/";
const version = process.env.VERSION_GRAPH;

/************************************* PLANTILLAS ***********************************/

const getTemplatesFromMeta = async () => {
  //const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
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

const createTemplate = async ({name, language, category, components}) => {
  //const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
  try {
    const response = await axios.post(`${url_base}${version}/${businessId}/message_templates`, {
      name,
      language,
      category,
      components
    },{
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

const deleteTemplate = async ({templateId, name}) => {
  try {
    const response = await axios.delete(`${url_base}${version}/${bussinessId}/message_templates/hsm_id=${templateId}&name=${name}`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }catch (error) {
    console.error('❌ Error eliminando plantilla en Meta:', error.message);
    throw error;
  }
};

const updateTemplate = async ({templateId, name, language, category, components}) => {
  try {
    const response = await axios.post(`${url_base}${version}/${templateId}`, {
      name,
      language,
      category,
      components
    },{
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

const sendTemplateMessage = async ({phone, template, language, parameters}) => {
  const parsedParameters = typeof parameters === 'string' ? JSON.parse(parameters) : parameters;
  console.log(parameters);
  console.log(parsedParameters);
  try {
    const response = await axios.post(`${url_base}${version}/${phoneId}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "template",
      template: {
        name: template,
        language: {
          code: language
        },
        components: [
          {
            type: "body",
            parameters: parsedParameters.map(param => ({
              type: "text",
              text: param
            }))
          }
        ]
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