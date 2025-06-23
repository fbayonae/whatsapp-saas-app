const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Cargar .env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const requiredVars = [
    "DATABASE_URL",
    "API_HOST",
    "API_PORT",
    "JWT_SECRET_KEY",
    "JWT_REFRESH_SECRET_KEY",
    "JWT_SECRET_EXPIRES_IN",
    "JWT_REFRESH_SECRET_EXPIRES_IN",
    "REDIS_HOST",
    "REDIS_PORT"
];

// Validar presencia de variables requeridas
for (const variable of requiredVars) {
    if (!process.env[variable]) {
        throw new Error(`⛔️ La variable de entorno ${variable} es obligatoria pero no está definida.`);
    }
}

// Exportar configuración
module.exports = {
    api: {
        host: process.env.API_HOST,
        port: process.env.API_PORT,
    },
    jwt: {
        secret: process.env.JWT_SECRET_KEY,
        refreshSecret: process.env.JWT_REFRESH_SECRET_KEY,
        algorithm: process.env.JWT_ALGORITHM || "HS256",
        expiresIn: parseInt(process.env.JWT_SECRET_EXPIRES_IN),
        refreshExpiresIn: parseInt(process.env.JWT_REFRESH_SECRET_EXPIRES_IN),
    },
    db: {
        url: process.env.DATABASE_URL,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
    },
};
