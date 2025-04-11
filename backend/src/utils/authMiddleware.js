const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });
  console.log("Token: ", token);
  console.log("Secret: ", process.env.JWT_SECRET_KEY);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded: ", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido o expirado" });
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
