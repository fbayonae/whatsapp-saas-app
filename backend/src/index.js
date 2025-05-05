const express = require('express');
const helmet = require("helmet");
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
cors = require('cors');
const whatsappRoutes = require('./routes/whatsapp');
const authRoutes = require('./routes/authRoutes');
const templatesRoutes = require('./routes/templatesRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const contactRoutes = require("./routes/contactRoutes");
const chatRoutes = require("./routes/chatsRoutes");
const messageRoutes = require("./routes/messagesRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const preferenceRoutes = require("./routes/preferenceRoutes");
const userRoutes = require("./routes/userRoutes");
const fmRoutes = require("./routes/filemakerRoutes");
const rateLimiter = require("./utils/rateLimiter");

dotenv.config();
const app = express();
app.set('trust proxy', "loopback");

app.use(helmet());

// 1. HSTS – fuerza HTTPS
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  })
);

// 2. X-Frame-Options
app.use(helmet.frameguard({ action: "sameorigin" }));

// 3. X-Content-Type-Options
app.use(helmet.noSniff());

// 4. Referrer-Policy
app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));

// 5. CSP – versión básica que permite funcionamiento normal
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
    }
  })
);

// 6. Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: "https://whatsapp.technologygroup.es",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser());

// necesario para leer POST de Meta
app.use(express.json({ limit: '5mb' })); 
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/preferences', rateLimiter.apiLimiter, preferenceRoutes);
app.use('/api/users', rateLimiter.apiLimiter, userRoutes);
app.use('/api/fm', rateLimiter.apiLimiter, fmRoutes);
app.use('/api/templates', rateLimiter.apiLimiter, templatesRoutes);
app.use("/api/contacts", rateLimiter.apiLimiter, contactRoutes);
app.use("/api/chats", rateLimiter.apiLimiter, chatRoutes);
app.use("/api/messages", rateLimiter.apiLimiter, messageRoutes);
app.use("/api/media",rateLimiter.apiLimiter,  mediaRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
