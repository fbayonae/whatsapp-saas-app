const  whatsappService  = require('../services/whatsappService');
const  templatesService  = require('../services/dbService');

const syncTemplates = async (req, res) => {
  try {

    console.log("syncTemplates");

    const templates = await whatsappService.getTemplatesFromMeta();
    const results = [];
    
    for (const tpl of templates) {
        console.log(tpl);
        console.log(tpl.components?.length)
        const savedTpl = await templatesDB.saveTemplateToDB(tpl);
        console.log(savedTpl.id);
        if (tpl.components?.length) {
            console.log("Componentes");
          for (const comp of tpl.components) {
            await templatesDB.saveComponentToDB(comp, savedTpl.id);
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
