const  dbService  = require('../services/dbService');
const auth = require("../utils/authUtils");

router.get("/", auth, templateController.getTemplates);
router.post("/sync", auth, templateController.syncTemplates);

const getAllContacts = async (req, res) => {
    try {
        const contacts = await dbService.getContactsFromDB();
        res.json(contacts);
      } catch (error) {
        console.error('❌ Error obteniendo contactos:', error);
        res.status(500).json({ error: 'Error al obtener las contactos' });
    }
};

module.exports = { getAllContacts };
