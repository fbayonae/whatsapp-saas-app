require('dotenv').config();

const axios = require('axios');
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
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error.message);
    throw error;
  }
};

module.exports = { 
  getTemplatesFromMeta,
  sendTextMessage 
};