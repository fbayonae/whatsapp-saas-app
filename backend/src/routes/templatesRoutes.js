const express = require('express');
const templateController = require('../controllers/templateController');

const router = express.Router();

router.post('/sync', templateController.syncTemplates);
router.get('/', templateController.getTemplates);

module.exports = router;
