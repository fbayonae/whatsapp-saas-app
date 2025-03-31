const express = require('express');
const dotenv = require('dotenv');
const whatsappRoutes = require('./routes/whatsapp');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(express.json());
app.use('/api', whatsappRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

app.use(cors({
  origin: 'https://whatsapp.technologygroup.es'
}));
