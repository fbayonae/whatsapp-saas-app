const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Validar que el encabezado tenga el formato correcto
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de autorización faltante o mal formado" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; // contiene userId, email, role...
    next();
  } catch (err) {
    console.error("❌ Token inválido o expirado:", err.message);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  } else {
    return res.status(403).json({ error: "Acceso denegado: se requiere rol admin" });
  }
};

const isClient = (req, res, next) => {
  if (req.user?.role === "client") {
    return next();
  } else {
    return res.status(403).json({ error: "Acceso denegado: se requiere rol cliente" });
  }
};

module.exports = {
  auth,
  isAdmin,
  isClient
};
