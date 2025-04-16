const express = require('express');
const { body } = require('express-validator');
const templateController = require('../controllers/templateController');
const auth = require("../utils/authMiddleware").auth;
const isAdmin = require("../utils/authMiddleware").isAdmin;

const router = express.Router();

router.post('/sync', auth, templateController.syncTemplates);
router.get('/', auth, templateController.getTemplates);
router.post("/create", 
    auth, 
    isAdmin, 
    templateController.createTemplate
);


module.exports = router;
