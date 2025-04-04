const { getTemplatesFromMeta } = require('../services/whatsappService');
const { saveTemplateToDB } = require('../services/dbService');

const syncTemplates = async (req, res) => {
  try {
    const templates = await getTemplatesFromMeta();
    const results = [];

    console.log("templateController");

    for (const tpl of templates) {
      console.log(tpl);
      const saved = await saveTemplateToDB(tpl);
      console.log(saved);
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

module.exports = { syncTemplates };
