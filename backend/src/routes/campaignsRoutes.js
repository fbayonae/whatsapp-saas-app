// src/routes/campaignsRoutes.js
const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const auth = require("../utils/authMiddleware").auth;
const campaignsController = require("../controllers/campaignController");

// Campañas
router.get("/",
    auth,
    campaignsController.getAllCampaigns
);

router.get("/:id",
    auth,
    param("id").isInt().withMessage("ID inválido"),
    campaignsController.getCampaignById
);

router.post("/",
    auth,
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("templateId").isInt().withMessage("ID de plantilla inválido"),
    campaignsController.createCampaign
);

router.put("/:id",
    auth,
    param("id").isInt(),
    body("name").optional().notEmpty(),
    body("templateId").optional().isInt(),
    campaignsController.updateCampaign
);

router.delete("/:id",
    auth,
    param("id").isInt(),
    campaignsController.deleteCampaign
);

// Contactos dentro de campaña
router.post("/:id/contacts",
    auth,
    param("id").isInt(),
    body("contactIds").isArray({ min: 1 }).withMessage("Debe incluir al menos un ID de contacto"),
    campaignsController.addContactsToCampaign
);

router.delete("/:id/contacts/:contactId",
    auth,
    param("id").isInt(),
    param("contactId").isInt(),
    campaignsController.removeContactFromCampaign
);

// Lanzar campaña
router.post("/:id/send",
    auth,
    param("id").isInt(),
    campaignsController.sendCampaign
);

// Estado resumen
router.get("/:id/status",
    auth,
    param("id").isInt(),
    campaignsController.getCampaignStatus
);

module.exports = router;
