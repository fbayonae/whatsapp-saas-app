const express = require('express');
const router = express.Router();

router.post('/send-message', (req, res) => {
  const { phone, message } = req.body;
  console.log(`Mensaje para ${phone}: ${message}`);
  res.json({ status: 'enviado', phone, message });
});

module.exports = router;
