const whatsappService = require('../services/whatsappService');

exports.sendMessage = async (req, res) => {
  try {
    const { phone, message } = req.body;
    const response = await whatsappService.sendTextMessage(phone, message);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar mensaje', details: error.message });
  }
};

exports.sendMessageTemplate = async (req, res) => {
    try {
      const { phone, id_template } = req.body;
      const response = await whatsappService.sendTextMessageTemplate(phone, id_template);
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Error al enviar mensaje', details: error.message });
    }
  };

/**
  * 
  * TEMPLATES
  * 
  * */
exports.getTemplatesFromMeta = async () => {
  try {
    const response = await whatsappService.getTemplatesFromMeta();      
    res.json(response);
  } catch (error) {
    console.error('❌ Error obteniendo plantillas de Meta:', error.message);
    throw error;
    //res.status(500).json({ error: 'Error al obtener plantillas' });
  }
};

exports.getTemplateByName = async (req, res) => {
  try {
    const templateName = req.params.name;
    const template = await whatsappService.findTemplateByName(templateName);
  
    if (!template) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
  
    res.json(template);
  } catch (error) {
    console.error('Error al obtener plantilla:', error.message);
    res.status(500).json({ error: 'Error al buscar plantilla' });
  }
};

/**
 * 
 * PHONE NUMBERS
 * 
 * */
exports.getPhoneNumbers = async (req, res) => {
  try {
    const response = await whatsappService.getPhoneNumbers();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener teléfonos' });
  }
};
