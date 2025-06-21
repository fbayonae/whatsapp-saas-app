const express = require('express');
const { param } = require('express-validator');

// Controllers
const preferencesController = require('../controllers/preferencesController');

// Middleware 
const auth = require("../../../core/middleware/auth").auth;
const isAdmin = require("../../../core/middleware/auth").isAdmin;

const router = express.Router();

router.put('/', auth, preferencesController.updatePreferences);
router.get('/', auth, preferencesController.getPreferences);

module.exports = router;
