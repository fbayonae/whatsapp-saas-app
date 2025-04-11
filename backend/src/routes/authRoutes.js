const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/refresh-cookie', authController.refresWithCookie);
router.post('/logout', authController.logout);

module.exports = router;
