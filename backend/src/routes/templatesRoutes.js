const express = require('express');
const templateController = require('../controllers/templateController');
const auth = require("../utils/authUtils");

const router = express.Router();

router.post('/sync', auth, templateController.syncTemplates);
router.get('/', auth, templateController.getTemplates);

module.exports = router;
