require('dotenv').config();

const axios = require('axios');
const token = process.env.TOKEN_DEV;
const phoneId = process.env.PHONE_NUMBER_ID;
const businessId = process.env.BUSINESS_ID;
const url_base = "https://graph.facebook.com/";
const version = process.env.VERSION_GRAPH;



exports.sendTextMessage = async (to, message) => {
  const url = `${url_base}${version}/${phoneId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: message }
  };
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const res = await axios.post(url, body, { headers });
  return res.data;
};

exports.sendTextMessageTemplate = async (to, id_template ) => {
    const url = `${url_base}${version}/${phoneId}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: { name: id_template },
      language: { code: "es" }
    };
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const res = await axios.post(url, body, { headers });
    return res.data;
};

/** 
 * 
 * TEMPLATES
 * 
 * */ 

// Get all templates  
exports.getTemplatesFromMeta = async () => {
  const url = `${url_base}${version}/${businessId}/message_templates`;
  const headers = { Authorization: `Bearer ${token}` };
  const res = await axios.get(url, { headers });
  console.log(res.data);
  return res.data;
};

//Get template by name
exports.findTemplateByName = async (name) => {
  const url = `${url_base}${version}/${businessId}/message_templates?name=${name}`;
  const headers = {
    Authorization: `Bearer ${token}`
  };

  const res = await axios.get(url, { headers });
  const templates = res.data?.data || [];

  // Buscar la plantilla por nombre
  const template = templates.find(t => t.name === name);
  return template || null;
};


exports.getPhoneNumbers = async () => {
  const url = `${url_base}${version}/${businessId}/phone_numbers`;
  const headers = { Authorization: `Bearer ${token}` };
  const res = await axios.get(url, { headers });
  return res.data;
};
