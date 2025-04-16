const express = require("express");
const multer = require("multer");
const upload = require("../utils/multerUtils");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../utils/authMiddleware").auth;
const validate = require("../utils/validators");

router.post("/send",
    auth,
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
                    if (!b.reply?.id || !b.reply?.title) {
                        throw new Error("Cada botón debe tener un id y title");
                    }
                }
                return true;
            }),
    ],
    validate,
    messageController.sendMessageReply
);

module.exports = router;
