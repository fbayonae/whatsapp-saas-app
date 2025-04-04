const express = require('express');
const dotenv = require('dotenv');
const whatsappRoutes = require('./routes/whatsapp');
const authRoutes = require('./routes/authRoutes');
const templatesRoutes = require('./routes/templatesRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

dotenv.config();
const app = express();

//app.use('/api', whatsappRoutes);

// necesario para leer POST de Meta
app.use(express.json({ limit: '5mb' })); 
//app.use(express.json());

app.use('/api/templates', templatesRoutes);
app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
