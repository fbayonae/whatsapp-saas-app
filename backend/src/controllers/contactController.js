const  dbService  = require('../services/dbService');

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
