exports.verifyWebhook = (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
  
    if (mode && token === VERIFY_TOKEN) {
      console.log('Webhook verificado correctamente.');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  };
  
  exports.receiveEvent = (req, res) => {
    const data = req.body;
    console.log('📩 Webhook recibido:', JSON.stringify(data, null, 2));
  
    // Aquí puedes procesar eventos de mensaje, delivery, lectura, etc.
  
    res.sendStatus(200);
  };
  