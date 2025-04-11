const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1]; // Bearer <token>
  
    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded; // puedes usar req.user.userId, etc.
      next();
    } catch (err) {
      console.error("❌ Token inválido:", err.message);
      return res.status(403).json({ error: "Token inválido o expirado" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user?.role === "admin") next();
    else res.status(403).json({ error: "Acceso denegado" });
  };
  
const isClient = (req, res, next) => {
    if (req.user?.role === "client") next();
    else res.status(403).json({ error: "Acceso restringido a clientes" });
};

module.exports = {
    auth,
    isAdmin,
    isClient
};
