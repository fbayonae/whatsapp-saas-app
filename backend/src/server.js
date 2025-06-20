require("dotenv").config(); // Carga las variables de entorno

const app = require("./app"); // Importa la configuración completa de la app

const PORT = process.env.PORT || 3001;

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
