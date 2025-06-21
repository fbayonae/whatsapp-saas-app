const express = require("express");
const router = express.Router();

// Controllers
const webhookControler = require('./controllers/webhookController');

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

// Ruta para recibir mensajes
router.post("/", (req, res) => {
  // ✅ Confirmación para Meta
  res.sendStatus(200);

  const entries = req.body.entry || [];

  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const value = change.value;

      switch (change.field) {
        case "messages":
          webhookControler.handleWebhookMessage(value);
          break;

        case "message_template_status_update":
          webhookControler.handleTemplateStatusUpdate(value);
          break;

        case "message_template_quality_update":
          webhookControler.handleTemplateQualityUpdate(value);
          break;

        case "template_category_update":
          webhookControler.handleTemplateCategoryUpdate(value);
          break;

        case "message_echoes":
          webhookControler.handleEchoMessage(value);
          break;

        default:
          console.log(`⚠️ Webhook recibido con campo desconocido: ${field}`);
      }
    }
  }
});


module.exports = router;
