// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.get("/", chatController.getConversations);
router.get("/:id/messages", chatController.getMessagesByConversation);

module.exports = router;
