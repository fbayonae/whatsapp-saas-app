const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

router.post('/send-message', whatsappController.sendMessage);
router.post('/send-message-template', whatsappController.sendMessageTemplate);
router.get('/templates', whatsappController.getTemplates);
router.get('/phones', whatsappController.getPhoneNumbers);

router.get('/test-env', (req, res) => {
    res.json({
      token: process.env.TOKEN_DEV || 'No definida',
      phoneId: process.env.PHONE_NUMBER_ID || 'No definida',
      version: process.env.VERSION_GRAPH || 'No definida',
      businessId: process.env.BUSINESS_ID || 'No definida'
    });
  });
  

module.exports = router;

// This code defines an Express router for handling WhatsApp-related routes.

// It imports the necessary modules and the controller functions.
// The router defines three routes:
// 1. POST /send-message: Calls the sendMessage function from the controller.
// 2. GET /templates: Calls the getTemplates function from the controller.
// 3. GET /phones: Calls the getPhoneNumbers function from the controller.

// Finally, it exports the router for use in other parts of the application.
