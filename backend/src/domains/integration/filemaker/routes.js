const express = require("express");
const router = express.Router();

// Services
const filemakerService = require("./services/fmService");

// Middleware
const auth = require("../../../core/middleware/authMiddleware").auth;

router.post("/loggin", auth, async (req, res) => {
  try {
    const data = await filemakerService.login();
    res.json(data);
  } catch (err) {
    console.error("❌ Error en FileMaker test:", err.message);
    res.status(500).json({ error: "Error conectando con FileMaker" });
  }
});

module.exports = router;
