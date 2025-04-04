const { whatsappService } = require('../services/whatsappService');
const { templatesService } = require('../services/dbService');

const syncTemplates = async (req, res) => {
  try {
    const templates = await whatsappService.getTemplatesFromMeta();
    const results = [];

    for (const tpl of templates) {
      const saved = await templatesService.saveTemplateToDB(tpl);
      results.push(saved);
    }
    
    res.json({
      message: 'Plantillas sincronizadas correctamente',
      total: results.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al sincronizar plantillas' });
  }
};

const getTemplates = async (req, res) => {
    try {
      const templates = await templatesService.getTemplatesFromDB();
      res.json(templates);
    } catch (error) {
      console.error('❌ Error obteniendo plantillas:', error);
      res.status(500).json({ error: 'Error al obtener las plantillas' });
    }
  };

module.exports = { 
    syncTemplates,
    getTemplates 
};
