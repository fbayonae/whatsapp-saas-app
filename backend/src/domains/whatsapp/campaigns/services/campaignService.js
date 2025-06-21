const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCampaign = async ({ name, templateId }) => {
    try {
        return await prisma.campaign.create({ data: { name, templateId } });
    } catch (error) {
        console.error("❌ Error creando campaña:", error);
        throw error;
    }
};

const getAllCampaigns = async () => {
    try {
        return await prisma.campaign.findMany({
            orderBy: { createdAt: "desc" },
            include: { template: true },
        });
    } catch (error) {
        console.error("❌ Error obteniendo campañas:", error);
        throw error;
    }
};

const getCampaignById = async (id) => {
    try {
        return await prisma.campaign.findUnique({
            where: { id },
            include: {
                template: {
                    include: {
                        components: true
                    }
                },
                contacts: {
                    include: { contact: true, message: true },
                },
            },
        });
    } catch (error) {
        console.error("❌ Error obteniendo campaña por ID:", error);
        throw error;
    }
};

const updateCampaign = async (id, data) => {
    try {
        return await prisma.campaign.update({ where: { id }, data });
    } catch (error) {
        console.error("❌ Error actualizando campaña:", error);
        throw error;
    }
};

const deleteCampaign = async (id) => {
    try {
        await prisma.campaignContact.deleteMany({ where: { campaignId: id } });
        return await prisma.campaign.delete({ where: { id } });
    } catch (error) {
        console.error("❌ Error eliminando campaña:", error);
        throw error;
    }
};

/*******************************************************
 * CAMPAIGN CONTACTS
 *******************************************************/

const addContactsToCampaign = async (campaignId, contactIds) => {
    try {
        const data = contactIds.map((contactId) => ({ campaignId, contactId }));
        return await prisma.campaignContact.createMany({ data, skipDuplicates: true });
    } catch (error) {
        console.error("❌ Error añadiendo contactos a campaña:", error);
        throw error;
    }
};

const removeContactFromCampaign = async (campaignId, contactId) => {
    try {
        return await prisma.campaignContact.deleteMany({ where: { campaignId, contactId } });
    } catch (error) {
        console.error("❌ Error eliminando contacto de campaña:", error);
        throw error;
    }
};

const getCampaignContacts = async (campaignId) => {
    try {
        return await prisma.campaignContact.findMany({
            where: { campaignId },
            include: { contact: true },
        });
    } catch (error) {
        console.error("❌ Error obteniendo contactos de campaña:", error);
        throw error;
    }
};

// Envío y seguimiento
const getCampaignSendQueue = async (campaignId) => {
    try {
        return await prisma.campaignContact.findMany({
            where: { campaignId, status: "pending" },
            include: {
                contact: true,
                campaign: {
                    include: {
                        template: {
                            include: { components: true },
                        },
                    },
                },
            },
        });
    } catch (error) {
        console.error("❌ Error obteniendo cola de envío:", error);
        throw error;
    }
};

const markContactAsSent = async (id, messageId = null) => {
    try {
        return await prisma.campaignContact.update({
            where: { id },
            data: {
                status: "sent",
                messageId: messageId,
            },
        });
    } catch (error) {
        console.error("❌ Error marcando contacto como enviado:", error);
        throw error;
    }
};

const markContactAsError = async (id, errorMsg) => {
    try {
        return await prisma.campaignContact.update({
            where: { id },
            data: {
                status: "error",
                errorMsg,
            },
        });
    } catch (error) {
        console.error("❌ Error marcando contacto como error:", error);
        throw error;
    }
};

const getCampaignStatus = async (campaignId) => {
    try {
        const result = await prisma.campaignContact.groupBy({
            by: ["status"],
            where: { campaignId },
            _count: { _all: true },
        });

        const status = {};
        result.forEach((row) => {
            status[row.status] = row._count._all;
        });

        return status;
    } catch (error) {
        console.error("❌ Error obteniendo estado de campaña:", error);
        throw error;
    }
};

const checkAndMarkCampaignAsSent = async (campaignId) => {
    try {
        const remaining = await prisma.campaignContact.count({
            where: {
                campaignId,
                status: { in: ["pending", "sending"] },
            },
        });

        if (remaining === 0) {
            await prisma.campaign.update({
                where: { id: campaignId },
                data: { status: "sent" },
            });
            console.log(`✅ Campaña ${campaignId} marcada como enviada.`);
        }
    } catch (error) {
        console.error("❌ Error verificando estado de campaña:", error);
        throw error;
    }
};

const getCampaignContactById = async (id) => {
    try {
        return await prisma.campaignContact.findUnique({
            where: { id },
            select: { campaignId: true }
        });
    } catch (err) {
        console.error("❌ Error obteniendo campaignContact:", err);
        throw err;
    }
};

module.exports = {
    createCampaign,
    getAllCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    addContactsToCampaign,
    removeContactFromCampaign,
    getCampaignContacts,
    getCampaignSendQueue,
    markContactAsSent,
    markContactAsError,
    getCampaignStatus,
    checkAndMarkCampaignAsSent,
    getCampaignContactById
};