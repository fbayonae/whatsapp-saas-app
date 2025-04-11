const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const auth = require("../utils/authMiddleware").auth;

router.get("/", auth, contactController.getAllContacts);

module.exports = router;
