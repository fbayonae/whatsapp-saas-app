const express = require('express');
const authController = require('../controllers/authController');
const rateLimiter = require('../utils/rateLimiter');

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', rateLimiter.loginLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/refresh-cookie', authController.refreshWithCookie);
router.post('/logout', authController.logout);

module.exports = router;
