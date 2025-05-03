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

const createContact = async (req, res) => {
  const { phoneNumber, name } = req.body;

  if (!phoneNumber || !name) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const contact = await dbService.createContactFromDB({ phoneNumber, name });
    res.status(201).json({ success: true, contact });
  } catch (error) {
    console.error("❌ Error al crear contacto:", error);
    res.status(500).json({ error: "Error al crear contacto" });
  }
};

const deleteContact = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "ID de contacto inválido" });
  }

  try {
    await dbService.deleteContactFromDB(parseInt(id));
    res.json({ success: true, message: "Contacto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar contacto:", error);
    res.status(500).json({ error: "Error al eliminar contacto" });
  }
};

const getConversationsByContact = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "ID de contacto inválido" });
  }

  try {
    const conversations = await dbService.getConversationsByContactFromDB({ id: parseInt(id) });
    res.json({ success: true, conversations });
  } catch (error) {
    console.error("❌ Error obteniendo conversaciones:", error);
    res.status(500).json({ error: "Error al obtener conversaciones" });
  }
};



module.exports = { 
  getAllContacts,
  createContact,
  deleteContact,
  getConversationsByContact 
};
