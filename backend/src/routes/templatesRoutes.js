const express = require('express');
const { getTemplates } = require('../controllers/templateController');

const router = express.Router();

router.post('/sync', syncTemplates);

module.exports = router;
