// routes/filemakerRoutes.js
const express = require("express");
const router = express.Router();
const filemakerService = require("../services/fmService");

router.post("/loggin", async (req, res) => {
  try {
    const data = await filemakerService.login();
    res.json(data);
  } catch (err) {
    console.error("❌ Error en FileMaker test:", err.message);
    res.status(500).json({ error: "Error conectando con FileMaker" });
  }
});

module.exports = router;
