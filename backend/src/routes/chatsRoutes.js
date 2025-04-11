// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const auth = require("../utils/authUtils");

router.get("/", auth, chatController.getConversations);
router.get("/:id/messages", auth, chatController.getMessagesByConversation);

module.exports = router;
