// chatController.js
const  dbService  = require('../services/dbService');

const getAllUsers = async (req, res) => {
  try {
    const users = await dbService.getUsersFromDB();
    res.json(users);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

const getAllSessionsByUser = async (req, res) => {
    try {
      const sessions = await dbService.getSessionsUserFromDB();
      res.json(sessions);
    } catch (error) {
      console.error("❌ Error al obtener sesiones del usuario:", error);
      res.status(500).json({ error: "Error al obtener sesiones del usuario" });
    }
  };

module.exports = { 
    getAllUsers,
    getAllSessionsByUser
};