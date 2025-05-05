const express = require('express');
const { body } = require("express-validator");
const authController = require('../controllers/authController');
const rateLimiter = require('../utils/rateLimiter');
const validate = require('../utils/validators');

const router = express.Router();

// Ruta para registrar un nuevo usuario
// Se utiliza el middleware de validación para verificar los datos de entrada
router.post('/register',
    [
        body('email').isEmail().withMessage("Email inválido"),
        body('password').isLength({ min: 6 }).withMessage("Contraseña muy corta"),
        body('role').optional().isIn(['admin', 'client']).withMessage("Rol no válido")
    ],
    validate,
    authController.registerUser
);

// Ruta para iniciar sesión
// Se utiliza el middleware de limitación de tasa para prevenir ataques de fuerza bruta
// Se utiliza el middleware de validación para verificar los datos de entrada
router.post('/login',
    rateLimiter.loginLimiter,
    [
        body('email').isEmail().withMessage("Email inválido"),
        body('password').notEmpty().withMessage("Contraseña obligatoria")
    ],
    validate,
    authController.login
);

router.post('/refresh', authController.refresh);
router.post('/refresh-cookie', authController.refreshWithCookie);
router.post('/logout', authController.logout);

module.exports = router;
