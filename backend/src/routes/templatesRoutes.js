const express = require('express');
const { syncTemplates  } = require('../controllers/templateController');

const router = express.Router();

router.post('/sync', syncTemplates);

module.exports = router;
