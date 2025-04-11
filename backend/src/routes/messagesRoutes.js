const express = require("express");
const multer = require("multer");
const upload = require("../utils/multerUtils");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../utils/authUtils");

router.post("/send", auth,  messageController.sendMessage);
router.post("/send-media", auth, upload.single("file"), messageController.sendMessageMedia);

module.exports = router;
