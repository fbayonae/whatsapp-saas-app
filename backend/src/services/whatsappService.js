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

const getTemplatesFromMeta = async () => {
  //const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
  console.log("whatsappService");
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
    },{
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    console.log(response.data);
    return response.data;
  }catch (error) {
    console.error('❌ Error enviando mensaje de media:', error.message);
    throw error;
  }
};


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

  return response.data; // <- media_id
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

module.exports = { 
  getTemplatesFromMeta,
  sendTextMessage,
  sendMediaMessage,
  uploadMedia,
  getMediaUrl,
  downloadMediaFile 
};