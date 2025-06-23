const dbService = require('../services/dbService');
const bcrypt = require('bcrypt');

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
    const { id } = req.params;
    //console.log("ID del usuario:", id);
    try {
        const sessions = await dbService.getSessionsUserFromDB( parseInt(id));
        res.json(sessions);
    } catch (error) {
        console.error("❌ Error al obtener sesiones del usuario:", error);
        res.status(500).json({ error: "Error al obtener sesiones del usuario" });
    }
};


const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, role, password } = req.body;

    try {
        const updateData = { name, role };

        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        const updated = await dbService.updateUserFromDB(id, updateData);
        return res.status(200).json(updated);
    } catch (err) {
        console.error("❌ Error al actualizar usuario:", err);
        return res.status(500).json({ error: "No se pudo actualizar el usuario" });
    }
};

const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        console.log("Creando usuario:", { name, email, password, role });
        // ¿Ya existe el usuario?
        const existing = await dbService.getUserByEmailFromDB(email);
        if (existing) {
            return res.status(409).json({ error: "El usuario ya existe" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await dbService.createUserFromDB({ name, email, passwordHash, role });

        res.status(201).json(user);
    } catch (error) {
        console.error("❌ Error creando usuario:", error);
        res.status(500).json({ error: "Error interno al crear el usuario" });
    }
};

const checkEmail = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: "Falta el email" });
    }

    try {
        const existing = await dbService.getUserByEmailFromDB(email);
        res.json({ available: !existing });
    } catch (error) {
        console.error("❌ Error verificando email:", error);
        res.status(500).json({ error: "Error interno al verificar el email" });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
  
    try {
      const userId = parseInt(id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "ID inválido" });
      }
  
      const deleted = await dbService.deleteUserFromDB(userId);
      return res.status(200).json({ success: true, message: "Usuario eliminado", user: deleted });
    } catch (error) {
      console.error("❌ Error eliminando usuario:", error);
      return res.status(500).json({ error: "Error al eliminar el usuario" });
    }
  };

module.exports = {
    getAllUsers,
    getAllSessionsByUser,
    updateUser,
    registerUser,
    checkEmail,
    deleteUser
};