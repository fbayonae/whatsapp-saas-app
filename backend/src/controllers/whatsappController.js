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

exports.getTemplates = async (req, res) => {
  try {
    //const response = await whatsappService.getTemplates();
    //res.json(response);
    res.json({ mensaje: 'Ruta /api/templates funcionando' });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener plantillas' });
  }
};

exports.getPhoneNumbers = async (req, res) => {
  try {
    const response = await whatsappService.getPhoneNumbers();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener teléfonos' });
  }
};
