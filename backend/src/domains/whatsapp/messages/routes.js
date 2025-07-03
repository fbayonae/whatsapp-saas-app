const express = require("express");
const multer = require("multer");
const { body } = require("express-validator");

const router = express.Router();

// Controllers
const messageController = require("./controllers/messageController");

// Middleware
const upload = require("../../../core/middleware/multerUtils");
const auth = require("../../../core/middleware/auth").auth;
const validate = require('../../core/middleware/validators');
const checkLimit = require('../../../core/middleware/checkLimitMiddleware');

router.post("/send",
    auth,
    checkLimit('messages'),
    [
        body("conversationId")
            .isInt({ gt: 0 })
            .withMessage("conversationId debe ser un número válido"),
        body("text")
            .trim()
            .notEmpty()
            .withMessage("El texto no puede estar vacío"),
    ],
    validate,
    messageController.sendMessage
);

router.post("/send-media",
    auth,
    checkLimit('messages'),
    upload.single("file"),
    [
        body("conversationId")
            .isInt({ gt: 0 })
            .withMessage("conversationId debe ser un número válido"),
        body("caption")
            .optional()
            .isString()
            .withMessage("El caption debe ser texto"),
    ],
    validate,
    messageController.sendMessageMedia
);

router.post("/send-cta",
    auth,
    checkLimit('messages'),
    [
        body("conversationId")
            .isInt({ gt: 0 })
            .withMessage("conversationId inválido"),
        body("body")
            .notEmpty()
            .withMessage("El cuerpo del mensaje es obligatorio"),
        body("action")
            .notEmpty()
            .withMessage("La acción CTA es requerida")
            .custom((value) => {
                if (!value.url || !value.display_text) {
                    throw new Error("La acción debe tener url y display_text");
                }
                return true;
            }),
    ],
    validate,
    messageController.sendMessageCTA
);

router.post("/send-reply",
    auth,
    checkLimit('messages'),
    upload.single("file"),
    [
        body("conversationId")
            .isInt({ gt: 0 })
            .withMessage("conversationId inválido"),
        body("body")
            .notEmpty()
            .withMessage("El cuerpo es obligatorio"),
        body("buttons")
            .notEmpty()
            .withMessage("Se requieren botones")
            .custom((value) => {
                const parsed = typeof value === "string" ? JSON.parse(value) : value;
                if (!Array.isArray(parsed) || parsed.length === 0) {
                    throw new Error("Debe haber al menos un botón");
                }
                for (const b of parsed) {
                    if (!(b.id && b.title) && !(b.reply?.id && b.reply?.title)) {
                        throw new Error("Cada botón debe tener un id y title");
                    }
                }
                return true;
            }),
    ],
    validate,
    messageController.sendMessageReply
);

router.post("/send-template",
    auth,
    checkLimit('messages'),
    [
        body("conversationId")
            .isInt({ gt: 0 })
            .withMessage("conversationId inválido"),
        body("template")
            .notEmpty()
            .withMessage("El template es obligatorio"),
        body("language")
            .notEmpty()
            .withMessage("El idioma es obligatorio"),
    ],
    validate,
    messageController.sendMessageTemplate
);

module.exports = router;
