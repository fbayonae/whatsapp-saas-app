const express = require('express');
const { param } = require('express-validator');

// Controllers
const templateController = require('../controllers/templateController');

// Middleware
const auth = require("../../../core/middleware/authMiddleware").auth;
const isAdmin = require("../../../core/middleware/authMiddleware").isAdmin;

const router = express.Router();

router.get('/whatsapp', 
    auth, 
    templateController.getTemplatesWhatsapp
);

router.post('/sync', 
    auth, 
    templateController.syncTemplates
);

router.get('/', 
    auth,
   templateController.getTemplates
);

router.post("/create",
    auth,
    templateController.createTemplate
);

router.put("/update/:id_meta",
    auth,
    [
        param("id_meta")
            .notEmpty()
            .withMessage("El id es requerido")
            .isLength({ min: 6 })
            .withMessage("El id debe tener al menos 6 caracteres")
            .matches(/^[a-zA-Z0-9\-_.]+$/)
            .withMessage("El id contiene caracteres no válidos"),
    ],
    templateController.updateTemplate
);

router.delete("/delete/:id_meta",
    auth,
    [
        param("id_meta")
            .notEmpty()
            .withMessage("El id es requerido")
            .isLength({ min: 6 })
            .withMessage("El id debe tener al menos 6 caracteres")
            .matches(/^[a-zA-Z0-9\-_.]+$/)
            .withMessage("El id contiene caracteres no válidos"),
    ],
    templateController.deleteTemplate
);

router.get("/:id/payload",
    auth,
    [
        param("id")
            .notEmpty()
            .withMessage("El id es requerido")
    ], 
    templateController.generateTemplatePayload
);

module.exports = router;
