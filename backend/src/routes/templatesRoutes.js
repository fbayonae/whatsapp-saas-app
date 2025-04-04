const express = require('express');
const { templateCtrl  } = require('../controllers/templateController');

const router = express.Router();

router.post('/sync', templateCtrl.syncTemplates);
router.get('/', templateCtrl.getTemplates);

module.exports = router;
