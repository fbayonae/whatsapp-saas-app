const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const requestLogger = require("./core/utils/requestLogger");
const rateLimiter = require("./core/middleware/rateLimiter");

const env = require("./config/env");
const logger = require("./config/logger");

const { errorHandler } = require('./core/middleware/error');
const { auth } = require('./core/middleware/auth');
const { tenantMiddleware } = require('./core/middleware/tenant');

// Rutas
const authRoutes = require("./domains/auth/routes");
const userRoutes = require("./domains/user/routes");
const tenantRoutes = require("./domains/tenant/routes");

const templatesRoutes = require("./domains/whatsapp/templates/routes");
const webhookRoutes = require("./domains/whatsapp/webhooks/routes");
const contactRoutes = require("./domains/whatsapp/contacts/routes");
const chatRoutes = require("./domains/whatsapp/chats/routes");
const messageRoutes = require("./domains/whatsapp/messages/routes");
const mediaRoutes = require("./domains/whatsapp/media/routes");
const campaignRoutes = require("./domains/whatsapp/campaigns/routes");
const preferenceRoutes = require("./domains/whatsapp/preferences/routes");

const fmRoutes = require("./domains/integration/filemaker/routes");
const logsRoutes = require("./core/logs/routes");

const app = express();
app.set("trust proxy", "loopback");

// ----------------------
// Seguridad con Helmet
// ----------------------
app.use(helmet());
app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  })
);
app.use(helmet.frameguard({ action: "sameorigin" }));
app.use(helmet.noSniff());
app.use(
  helmet.referrerPolicy({
    policy: "strict-origin-when-cross-origin",
  })
);
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://graph.facebook.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// ----------------------
// Middleware global
// ----------------------
app.use(
  cors({
    origin: "https://whatsapp.technologygroup.es",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(requestLogger);
//app.use(rateLimiter.globalLimiter);

// Autenticación y tenant (debe ir antes de rutas protegidas)
app.use(auth);
app.use(tenantMiddleware);

// ----------------------
// Rutas
// ----------------------
app.use("/auth", authRoutes);
app.use("/tenants", tenantRoutes);

app.use("/webhook", webhookRoutes);

app.use("/api/preferences", rateLimiter.apiLimiter, preferenceRoutes);
app.use("/api/users", rateLimiter.apiLimiter, userRoutes);
app.use("/api/fm", rateLimiter.apiLimiter, fmRoutes);
app.use("/api/templates", rateLimiter.apiLimiter, templatesRoutes);
app.use("/api/contacts", rateLimiter.apiLimiter, contactRoutes);
app.use("/api/chats", rateLimiter.apiLimiter, chatRoutes);
app.use("/api/messages", rateLimiter.apiLimiter, messageRoutes);
app.use("/api/campaigns", rateLimiter.apiLimiter, campaignRoutes);
app.use("/api/media", rateLimiter.apiLimiter, mediaRoutes);
app.use("/api/logs", logsRoutes);

// ----------------------
// Manejador de errores
// ----------------------
app.use(errorHandler);

module.exports = app;
