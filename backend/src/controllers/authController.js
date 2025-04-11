const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email y contraseña requeridos" });
  
    try {
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user)
        return res.status(401).json({ error: "Usuario no encontrado" });
  
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid)
        return res.status(401).json({ error: "Contraseña incorrecta" });
  
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "12h" }
      );
  
      res.json({ token });
    } catch (error) {
      console.error("❌ Error en login:", error);
      res.status(500).json({ error: "Error interno" });
    }
  };

  const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
  
    try {
      // ¿Ya existe el usuario?
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: "El usuario ya existe" });
      }
  
      const passwordHash = await bcrypt.hash(password, 10);
  
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: role || "user",
        },
      });
  
      res.status(201).json({
        message: "Usuario creado correctamente",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("❌ Error creando usuario:", error);
      res.status(500).json({ error: "Error interno al crear el usuario" });
    }
  };

module.exports = {
  login,
  registerUser,
};

