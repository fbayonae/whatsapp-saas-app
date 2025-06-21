const express = require('express');
const { param } = require('express-validator');
const preferencesController = require('../controllers/preferencesController');
const auth = require("../utils/authMiddleware").auth;
const isAdmin = require("../utils/authMiddleware").isAdmin;

const router = express.Router();

router.put('/', auth, preferencesController.updatePreferences);
router.get('/', auth, preferencesController.getPreferences);

module.exports = router;
