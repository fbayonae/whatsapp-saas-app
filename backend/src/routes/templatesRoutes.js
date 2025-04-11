const express = require('express');
const templateController = require('../controllers/templateController');
const auth = require("../utils/authMiddleware");

const router = express.Router();

router.post('/sync', auth.auth, templateController.syncTemplates);
router.get('/', auth.auth, templateController.getTemplates);

module.exports = router;
