const express = require("express");
const { param, body } = require("express-validator");
const router = express.Router();
const chatController = require("../controllers/chatController");
const auth = require("../utils/authMiddleware").auth;
const validate = require("../utils/validators");

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
