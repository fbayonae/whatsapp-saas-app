const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();


const login = async (req, res) => {
    const { email, password, userAgent } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Faltan datos" });
  
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) return res.status(401).json({ error: "Contraseña incorrecta" });
  
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_SECRET_EXPIRES_IN }
      );
  
      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET_KEY,
        { expiresIn: process.env.JWT_REFRESH_SECRET_EXPIRES_IN }
      );
  
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + (Number(process.env.JWT_REFRESH_SECRET_EXPIRES_IN) * 1000))
        }
      });
  
      res.json({
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + (Number(process.env.JWT_SECRET_EXPIRES_IN )* 1000)).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
      });
  
    } catch (err) {
      console.error("❌ Error en login:", err);
      res.status(500).json({ error: "Error interno" });
    }
};

const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Falta refreshToken" });
  
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
      const stored = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: decoded.userId,
          revoked: false,
        },
      });
  
      if (!stored) return res.status(403).json({ error: "Token inválido o revocado" });
  
      const accessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_SECRET_EXPIRES_IN }
      );
  
      res.json({
        accessToken,
        expiresAt: new Date(Date.now() + Number(process.env.JWT_SECRET_EXPIRES_IN)*1000).toISOString()
      });
  
    } catch (err) {
      return res.status(403).json({ error: "Refresh token inválido o expirado" });
    }
};

const logout = async (req, res) => {
    const { refreshToken } = req.body;
  
    if (!refreshToken) return res.status(400).json({ error: "Falta refreshToken" });
  
    try {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true }
      });
  
      res.json({ message: "Sesión cerrada correctamente" });
    } catch (err) {
      res.status(500).json({ error: "Error al cerrar sesión" });
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
  refresh,
  logout
};

