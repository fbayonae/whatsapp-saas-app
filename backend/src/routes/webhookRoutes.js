const express = require("express");
const router = express.Router();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN; 

// Ruta de verificación del webhook
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verificado correctamente.");
      res.status(200).send(challenge);
    } else {
      console.warn("❌ Verificación fallida. Token inválido.");
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;
