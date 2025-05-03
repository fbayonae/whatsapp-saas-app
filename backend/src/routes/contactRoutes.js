const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const contactController = require("../controllers/contactController");
const auth = require("../utils/authMiddleware").auth;
const validate = require("../utils/validators");

router.get("/",
    auth,
    contactController.getAllContacts
);

router.post("/",
    auth,
    [
        body("phoneNumber")
            .notEmpty().withMessage("El número de teléfono es obligatorio")
            .isString().withMessage("El número de teléfono debe ser un string"),
        body("name")
            .notEmpty().withMessage("El nombre es obligatorio")
            .isString().withMessage("El nombre debe ser un string"),
    ],
    contactController.createContact
);

router.put("/:id",
    auth,
    [
        param("id")
            .isInt({ min: 1 })
            .withMessage("El ID del contacto debe ser un número entero positivo"),
            body("name").notEmpty().withMessage("El nombre es obligatorio"),
            body("phoneNumber").notEmpty().withMessage("El número es obligatorio"),
    ],
    contactController.updateContact
);

router.delete("/:id",
    auth,
    [
        param("id")
            .isInt({ min: 1 })
            .withMessage("El ID del contacto debe ser un número entero positivo")
    ],
    contactController.deleteContact
);

router.get("/:id",
    auth,
    [
        param("id")
            .isInt({ min: 1 })
            .withMessage("El ID del contacto debe ser un número entero positivo")
    ],
    contactController.getConversationsByContact
);

module.exports = router;
