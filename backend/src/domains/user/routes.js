const express = require("express");
const { param, body } = require('express-validator');

const router = express.Router();

// Controllers
const userController = require("./controllers/userController");

// Middlewares
const auth = require("../../core/middleware/auth").auth;
const checkLimit = require('../../core/middleware/limitTenant');
//const validate = require("../utils/validators");

router.get("/",
    auth,
    userController.getAllUsers
);

router.get("/:id/sessions",
    auth,
    [
        param("id")
            .notEmpty()
            .withMessage("El id es requerido")
    ],
    userController.getAllSessionsByUser
);

router.put("/:id",
    auth,
    [
        param("id")
            .notEmpty()
            .withMessage("El id es requerido"),
        body("name").notEmpty().withMessage("El nombre es obligatorio"),
        body("role").notEmpty().withMessage("El role es obligatorio"),
    ],
    userController.updateUser
);

router.post("/register",
    auth,
    checkLimit('users'),
    [
        body("name").notEmpty().withMessage("El nombre es obligatorio"),
        body("role").notEmpty().withMessage("El role es obligatorio"),
        body("email")
            .notEmpty()
            .withMessage("El email es obligatorio")
            .isEmail()
            .withMessage("El email no es válido"),
        body("password")
            .notEmpty()
            .withMessage("La contraseña es obligatoria")
            .isLength({ min: 6 })
            .withMessage("La contraseña debe tener al menos 6 caracteres"),
    ],
    userController.registerUser
);

router.get("/check-email",
    auth,
    [
        param("email")
            .notEmpty()
            .withMessage("El email es obligatorio")
            .isEmail()
            .withMessage("El email no es válido"),
    ],
    userController.checkEmail
);

router.delete("/:id", 
    auth,
    [
        param("id")
            .notEmpty()
            .withMessage("El id es requerido"),
    ],
    userController.deleteUser);

module.exports = router;