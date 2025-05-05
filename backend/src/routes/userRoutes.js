const express = require("express");
const { param } = require('express-validator');
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../utils/authMiddleware").auth;
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

module.exports = router;