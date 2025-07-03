const express = require("express");
const { param, body } = require("express-validator");

const router = express.Router();

// Controllers
const chatController = require("./controllers/chatController");

// Middleware
const auth = require("../../../core/middleware/auth").auth;
const validate = require('../../../core/middleware/validators');

router.get("/",
    auth,
    chatController.getConversations
);

router.post("/",
    auth,
    [
        body("contactId")
            .isInt({ min: 1 })
            .withMessage("El ID del contacto debe ser un número entero positivo")
    ],
    chatController.createConversation
);

router.get("/:id/check-window",
    auth,
    [
        param("id")
            .isInt({ min: 1 })
            .withMessage("El ID de la conversación debe ser un número entero positivo")
    ],
    validate,
    chatController.checkWindow24h
);

router.get("/:id/messages",
    auth,
    [
        param("id")
            .isInt({ min: 1 })
            .withMessage("El ID de la conversación debe ser un número entero positivo")
    ],
    validate,
    chatController.getMessagesByConversation
);

module.exports = router;
