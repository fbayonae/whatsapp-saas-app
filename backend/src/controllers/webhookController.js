const express = require("express");
const router = express.Router();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // defínelo en tu .env

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

//Ruta para recibir mensajes
router.post("/", (req, res) => {
  const body = req.body;
  console.log("ENTRA");  
  
  // 1. Confirmar recepción para Meta (muy importante)
  res.sendStatus(200);

  // 2. Registrar datos para desarrollo
  console.log("📥 Webhook recibido:", JSON.stringify(body, null, 2));

  // 3. Procesar mensajes (ejemplo básico)
  if (body.object && body.entry) {
    body.entry.forEach(entry => {
      const changes = entry.changes || [];
      changes.forEach(change => {
        const value = change.value;
        const metadata = value.metadata;
        const messages = value.messages;

        if (messages && messages.length > 0) {
          messages.forEach(msg => {
            const from = msg.from;
            const type = msg.type;

            if (type === "text") {
              const text = msg.text.body;
              console.log(`💬 Mensaje recibido de ${from}: ${text}`);
            } else {
              console.log(`📦 Otro tipo de mensaje (${type}) de ${from}`);
            }

            // Aquí podrías insertar en tu BBDD con Prisma...
          });
        }
      });
    });
  }
});


module.exports = router;
