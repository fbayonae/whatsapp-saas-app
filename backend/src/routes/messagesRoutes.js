const express = require("express");
const multer = require("multer");
const upload = require("../utils/multerUtils");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.post("/send", messageController.sendMessage);
router.post("/send-media", upload.single("file"), messageController.sendMessageMedia);

module.exports = router;
