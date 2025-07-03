const { validationResult } = require("express-validator");
const { getPrismaClient } = require("../../../../prisma/client");

const campaignService = require("../services/campaignsService");
const CampaignSendQueue = require("../../../infrastructure/queues/campaignSendQueue");

const getAllCampaigns = async (req, res) => {
    const prisma = getPrismaClient(req.user.tenantId);
    try {
        const campaigns = await campaignService.getAllCampaigns(prisma);
        res.json(campaigns);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener campañas" });
    }
};

const getCampaignById = async (req, res) => {
    const prisma = getPrismaClient(req.user.tenantId);
    try {
        const campaign = await campaignService.getCampaignById(prisma, parseInt(req.params.id));
        if (!campaign) return res.status(404).json({ error: "Campaña no encontrada" });
        res.json(campaign);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener campaña" });
    }
};

const createCampaign = async (req, res) => {
    const errors = validationResult(req);
    const prisma = getPrismaClient(req.user.tenantId);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, templateId } = req.body;
    try {
        const campaign = await campaignService.createCampaign(prisma, { name, templateId });
        res.status(201).json(campaign);
    } catch (err) {
        res.status(500).json({ error: "Error al crear campaña" });
    }
};

const updateCampaign = async (req, res) => {
    const prisma = getPrismaClient(req.user.tenantId);
    try {
        const data = req.body;
        const updated = await campaignService.updateCampaign(prisma, parseInt(req.params.id), data);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar campaña" });
    }
};

const deleteCampaign = async (req, res) => {
    const prisma = getPrismaClient(req.user.tenantId);
    try {
        await campaignService.deleteCampaign(prisma, parseInt(req.params.id));
        res.json({ message: "Campaña eliminada" });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar campaña" });
    }
};

const addContactsToCampaign = async (req, res) => {
    const errors = validationResult(req);
    const prisma = getPrismaClient(req.user.tenantId);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const campaignId = parseInt(req.params.id);
    const { contactIds } = req.body;
    try {
        const result = await campaignService.addContactsToCampaign(prisma, campaignId, contactIds);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: "Error al añadir contactos" });
    }
};

const removeContactFromCampaign = async (req, res) => {
    const prisma = getPrismaClient(req.user.tenantId);
    try {
        const result = await campaignService.removeContactFromCampaign(
            prisma,
            parseInt(req.params.id),
            parseInt(req.params.contactId)
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar contacto" });
    }
};

const sendCampaign = async (req, res) => {
    const campaignId = parseInt(req.params.id);
    const prisma = getPrismaClient(req.user.tenantId);

    try {
        const queue = await campaignService.getCampaignSendQueue(prisma, campaignId);

        if (!queue || queue.length === 0) {
            return res.status(400).json({ error: "No hay contactos pendientes." });
        }

        for (const item of queue) {
            await CampaignSendQueue.add("send-campaign-message", {
                campaignContactId: item.id,
                contactPhone: item.contact.phoneNumber,
                templateId: item.campaign.template.id_meta,
                template_name: item.campaign.template.name,
                language: item.campaign.template.language,
                parameters: [], // en el futuro dinámico
            });
        }

        await campaignService.updateCampaign(prisma, campaignId, { status: "In_progress" });

        res.json({ message: `📨 Encolados ${queue.length} mensajes.` });
    } catch (err) {
        console.error("❌ Error en envío de campaña:", err);
        res.status(500).json({ error: "Error al iniciar envío" });
    }
};

const getCampaignStatus = async (req, res) => {
    const prisma = getPrismaClient(req.user.tenantId);
    try {
        const summary = await campaignService.getCampaignStatus(prisma, parseInt(req.params.id));
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener estado" });
    }
};

module.exports = {
    getAllCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    addContactsToCampaign,
    removeContactFromCampaign,
    sendCampaign,
    getCampaignStatus,
};


