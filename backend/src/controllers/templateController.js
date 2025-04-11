const  whatsappService  = require('../services/whatsappService');
const  dbService  = require('../services/dbService');
const auth = require("../utils/authUtils");

router.get("/", auth, templateController.getTemplates);
router.post("/sync", auth, templateController.syncTemplates);

const syncTemplates = async (req, res) => {
  try {

    console.log("syncTemplates");

    const templates = await whatsappService.getTemplatesFromMeta();
    const results = [];
    
    for (const tpl of templates) {
        const savedTpl = await dbService.saveTemplateToDB(tpl);
        if (tpl.components?.length) {
            for (const comp of tpl.components) {
                await dbService.saveComponentToDB(comp, savedTpl.id);
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
      const templates = await dbService.getTemplatesFromDB();
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
