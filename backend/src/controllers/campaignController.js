//campaignController.js
// src/controllers/campaignsController.js
const db = require("../services/dbService");
const { validationResult } = require("express-validator");

const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await db.getAllCampaigns();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener campañas" });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const campaign = await db.getCampaignById(parseInt(req.params.id));
    if (!campaign) return res.status(404).json({ error: "Campaña no encontrada" });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener campaña" });
  }
};

const createCampaign = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, templateId } = req.body;
  try {
    const campaign = await db.createCampaign({ name, templateId });
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ error: "Error al crear campaña" });
  }
};

const updateCampaign = async (req, res) => {
  try {
    const data = req.body;
    const updated = await db.updateCampaign(parseInt(req.params.id), data);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar campaña" });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    await db.deleteCampaign(parseInt(req.params.id));
    res.json({ message: "Campaña eliminada" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar campaña" });
  }
};

const addContactsToCampaign = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const campaignId = parseInt(req.params.id);
  const { contactIds } = req.body;
  try {
    const result = await db.addContactsToCampaign(campaignId, contactIds);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "Error al añadir contactos" });
  }
};

const removeContactFromCampaign = async (req, res) => {
  try {
    const result = await db.removeContactFromCampaign(
      parseInt(req.params.id),
      parseInt(req.params.contactId)
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar contacto" });
  }
};

const sendCampaign = async (req, res) => {
  try {
    // Aquí encolarías los envíos con BullMQ
    const queue = await db.getCampaignSendQueue(parseInt(req.params.id));
    // lógica futura: recorrer `queue` y encolar con BullMQ
    res.json({ message: `Se prepararían ${queue.length} envíos.` });
  } catch (err) {
    res.status(500).json({ error: "Error al iniciar envío" });
  }
};

const getCampaignStatus = async (req, res) => {
  try {
    const summary = await db.getCampaignStatus(parseInt(req.params.id));
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


