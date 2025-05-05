// chatController.js
const  dbService  = require('../services/dbService');

const getAllUsers = async (req, res) => {
  try {
    const users = await dbService.getUsersFromDB();
    console.log("✅ Usuarios obtenidos:", users);
    res.json(users);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

module.exports = { 
    getAllUsers
};