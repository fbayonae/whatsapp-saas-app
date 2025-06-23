const dbContacts = require('../services/contactService');
const dbMessages = require('../../messages/services/messageService');

const getAllContacts = async (req, res) => {
    try {
        const contacts = await dbContacts.getContactsFromDB();
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
        const contact = await dbContacts.createContactFromDB({ phoneNumber, name });
        res.status(201).json({ success: true, contact });
    } catch (error) {
        console.error("❌ Error al crear contacto:", error);
        res.status(500).json({ error: "Error al crear contacto" });
    }
};

const updateContact = async (req, res) => {
    const { id } = req.params;
    const { name, phoneNumber } = req.body;

    try {
        const updated = await dbContacts.updateContactFromDB(id, { name, phoneNumber });
        return res.status(200).json(updated);
    } catch (err) {
        console.error("❌ Error al actualizar contacto:", err);
        return res.status(500).json({ error: "No se pudo actualizar el contacto" });
    }
};

const deleteContact = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: "ID de contacto inválido" });
    }

    try {
        await dbContacts.deleteContactFromDB(parseInt(id));
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
        const conversations = await dbMessages.getConversationsByContactFromDB({ id: parseInt(id) });
        res.json({ success: true, conversations });
    } catch (error) {
        console.error("❌ Error obteniendo conversaciones:", error);
        res.status(500).json({ error: "Error al obtener conversaciones" });
    }
};



module.exports = {
    getAllContacts,
    createContact,
    updateContact,
    deleteContact,
    getConversationsByContact
};
