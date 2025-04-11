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
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );
  
      res.json({ token });
    } catch (error) {
      console.error("❌ Error en login:", error);
      res.status(500).json({ error: "Error interno" });
    }
  };

const registerUser = async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    // Comprobar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        role: role || 'user',
      },
    });

    return res.status(201).json({ message: 'Usuario creado', user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  login,
  registerUser,
};

