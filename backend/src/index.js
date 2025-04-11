const express = require('express');
const dotenv = require('dotenv');
const whatsappRoutes = require('./routes/whatsapp');
const authRoutes = require('./routes/authRoutes');
const templatesRoutes = require('./routes/templatesRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const contactRoutes = require("./routes/contactRoutes");
const chatRoutes = require("./routes/chatsRoutes");
const messageRoutes = require("./routes/messagesRoutes");
const mediaRoutes = require("./routes/mediaRoutes");

dotenv.config();
const app = express();

app.use(cors({
  origin: "https://whatsapp.technologygroup.es", // o el dominio que uses
  credentials: true
}));

// necesario para leer POST de Meta
app.use(express.json({ limit: '5mb' })); 

app.use('/api/templates', templatesRoutes);
app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/media", mediaRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
