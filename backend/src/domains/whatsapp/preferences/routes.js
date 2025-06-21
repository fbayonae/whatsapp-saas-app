const express = require('express');
const { param } = require('express-validator');

// Controllers
const preferencesController = require('../controllers/preferencesController');

// Middleware 
const auth = require("../../../core/middleware/authMiddleware").auth;
const isAdmin = require("../../../core/middleware/authMiddleware").isAdmin;

const router = express.Router();

router.put('/', auth, preferencesController.updatePreferences);
router.get('/', auth, preferencesController.getPreferences);

module.exports = router;
