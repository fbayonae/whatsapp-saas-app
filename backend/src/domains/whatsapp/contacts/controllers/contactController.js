const { getPrismaClient } = require("../../../../prisma/client");

// Services
const contactService = require('../services/contactService');
const messageService = require('../../messages/services/messageService');

// Middlewares
const checkLimit = require('../../../../core/utils/checkTenantLimit');

const getAllContacts = async (req, res) => {

    const prisma = getPrismaClient(req.user.tenantId);
    const tenantId = req.user.tenantId;
    const userId = req.user.id;

    try {
        const contacts = await contactService.getContactsFromDB(prisma);
        res.json(contacts);
    } catch (error) {
        console.error('❌ Error obteniendo contactos:', error);

        logger.error(`[Tenant: ${tenantId}] [User: ${userId}] Error obteniendo contactos`, {
            error: error.message,
            stack: error.stack,
            context: { tenantId, userId }
        });

        if (error instanceof AppError) {
            return next(error);
        }

        next(new AppError('Error al obtener los contactos', 500, {
            originalError: error.message,
            tenantId,
            userId
        }));
        //res.status(500).json({ error: 'Error al obtener las contactos' });
    }
};

const createContact = async (req, res) => {
    const prisma = getPrismaClient(req.user.tenantId);
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const { phoneNumber, name } = req.body;

    //comprobamos el límite de contactos
    await checkLimit(tenantId, 'contacts');

    if (!phoneNumber || !name) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const contact = await contactService.createContactFromDB(prisma, { phoneNumber, name });
        res.status(201).json({ success: true, contact });
    } catch (error) {
        console.error("❌ Error al crear contacto:", error);

        logger.error(`[Tenant: ${tenantId}] [User: ${userId}] Error al crear contacto`, {
            error: error.message,
            stack: error.stack,
            context: { tenantId, userId, phoneNumber, name }
        });

        if (error instanceof AppError) {
            return next(error);
        }

        next(new AppError('Error al crear contacto', 500, {
            originalError: error.message,
            tenantId,
            userId,
            inputData: { phoneNumber, name }
        }));
        //res.status(500).json({ error: "Error al crear contacto" });
    }
};

const updateContact = async (req, res) => {
    const prisma = getPrismaClient(req.user.tenantId);
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const { id } = req.params;
    const { name, phoneNumber } = req.body;

    try {
        const updated = await contactService.updateContactFromDB(prisma, id, { name, phoneNumber });
        return res.status(200).json(updated);
    } catch (err) {
        console.error("❌ Error al actualizar contacto:", err);
        logger.error(`[Tenant: ${tenantId}] [User: ${userId}] Error al actualizar contacto ID: ${id}`, {
            error: error.message,
            stack: error.stack,
            context: { tenantId, userId, contactId: id, updateData: { name, phoneNumber } }
        });

        if (error instanceof AppError) {
            return next(error);
        }

        next(new AppError('No se pudo actualizar el contacto', 500, {
            originalError: error.message,
            tenantId,
            userId,
            contactId: id
        }));
        //return res.status(500).json({ error: "No se pudo actualizar el contacto" });
    }
};

const deleteContact = async (req, res) => {
    const prisma = getPrismaClient(req.user.tenantId);
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: "ID de contacto inválido" });
    }

    try {
        await contactService.deleteContactFromDB(prisma, parseInt(id));
        res.json({ success: true, message: "Contacto eliminado correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar contacto:", error);
        logger.error(`[Tenant: ${tenantId}] [User: ${userId}] Error al eliminar contacto ID: ${id}`, {
            error: error.message,
            stack: error.stack,
            context: { tenantId, userId, contactId: id }
        });

        if (error instanceof AppError) {
            return next(error);
        }

        next(new AppError('Error al eliminar contacto', 500, {
            originalError: error.message,
            tenantId,
            userId,
            contactId: id
        }));
        //res.status(500).json({ error: "Error al eliminar contacto" });
    }
};

const getConversationsByContact = async (req, res) => {
    const prisma = getPrismaClient(req.user.tenantId);
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
        throw new ValidationError("ID de contacto inválido");
        //return res.status(400).json({ error: "ID de contacto inválido" });
    }

    try {
        const conversations = await messageService.getConversationsByContactFromDB(prisma, { id: parseInt(id) });
        res.json({ success: true, conversations });
    } catch (error) {
        console.error("❌ Error obteniendo conversaciones:", error);
        logger.error(`[Tenant: ${tenantId}] [User: ${userId}] Error obteniendo conversaciones para contacto ID: ${id}`, {
            error: error.message,
            stack: error.stack,
            context: { tenantId, userId, contactId: id }
        });

        if (error instanceof AppError) {
            return next(error);
        }

        next(new AppError('Error al obtener conversaciones', 500, {
            originalError: error.message,
            tenantId,
            userId,
            contactId: id
        }));
        //res.status(500).json({ error: "Error al obtener conversaciones" });
    }
};



module.exports = {
    getAllContacts,
    createContact,
    updateContact,
    deleteContact,
    getConversationsByContact
};
