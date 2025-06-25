const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getContactsFromDB = async (prisma) => {
    return await prisma.contact.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

const createContactFromDB = async (prisma, { phoneNumber, name }) => {
    try {
        const contact = await prisma.contact.create({
            data: {
                phoneNumber,
                name,
            },
        });
        return contact;
    } catch (error) {
        console.error("❌ Error creando contacto:", error);
        throw error;
    }
};

const deleteContactFromDB = async (prisma, { id }) => {
    try {
        // Obtener el contacto
        const contact = await prisma.contact.findFirst({
            where: {
                ...(id && { id })
            },
        });

        if (!contact) {
            throw new Error("Contacto no encontrado");
        }

        // Obtener conversaciones asociadas
        const conversations = await prisma.conversation.findMany({
            where: { contactId: contact.id },
            select: { id: true },
        });

        const conversationIds = conversations.map(c => c.id);

        if (conversationIds.length > 0) {
            // Eliminar mensajes
            await prisma.message.deleteMany({
                where: {
                    conversationId: { in: conversationIds },
                },
            });

            // Eliminar conversaciones
            await prisma.conversation.deleteMany({
                where: {
                    id: { in: conversationIds },
                },
            });
        }

        // Eliminar el contacto
        const deleted = await prisma.contact.delete({
            where: { id: contact.id },
        });

        return deleted;

    } catch (error) {
        console.error("❌ Error eliminando contacto:", error);
        throw error;
    }
};


const updateContactFromDB = async (prisma, id, data) => {
    try {
        const updated = await prisma.contact.update({
            where: { id: parseInt(id) },
            data: {
                name: data.name,
                phoneNumber: data.phoneNumber
            }
        });
        return updated;
    } catch (error) {
        console.error("❌ Error actualizando contacto:", error);
        throw error;
    }
};

module.exports = {
    getContactsFromDB,
    createContactFromDB,
    deleteContactFromDB,
    updateContactFromDB
};