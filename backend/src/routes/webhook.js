const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Verificación inicial (GET)
router.get('/', webhookController.verifyWebhook);

// Recepción de eventos (POST)
router.post('/', webhookController.receiveEvent);

module.exports = router;
