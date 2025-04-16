const express = require('express');
const { body } = require('express-validator');
const templateController = require('../controllers/templateController');
const auth = require("../utils/authMiddleware").auth;
const isAdmin = require("../utils/authMiddleware").isAdmin;

const router = express.Router();

router.post('/sync', auth, templateController.syncTemplates);
router.get('/', auth, templateController.getTemplates);
router.post("/create", 
    auth, 
    templateController.createTemplate
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


module.exports = router;
