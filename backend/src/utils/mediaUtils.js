const path = require("path");

const MAX_SIZES_MB = {
  image: 5,
  audio: 16,
  video: 16,
  document: 100,
};

const EXTENSIONS = {
  image: ["jpg", "jpeg", "png"],
  audio: ["aac", "amr", "mp3", "mp4", "ogg"],
  document: ["txt", "xls", "xlsx", "doc", "docx", "ppt", "pptx", "pdf"],
  video: ["mp4", "3gp"],
};

// Detecta si el archivo es válido para Meta
const validateMediaFile = (file) => {
  const ext = path.extname(file.originalname).replace(".", "").toLowerCase();
  const sizeMB = file.size / (1024 * 1024); // tamaño en MB

  // Detectar tipo
  const type = detectMediaType(file.mimetype);

  if (!EXTENSIONS[type]?.includes(ext)) {
    return {
      valid: false,
      reason: `Extensión .${ext} no permitida para ${type}`,
    };
  }

  if (sizeMB > MAX_SIZES_MB[type]) {
    return {
      valid: false,
      reason: `El archivo excede el tamaño máximo permitido para ${type}: ${MAX_SIZES_MB[type]}MB`,
    };
  }

  return { valid: true, type };
};

const detectMediaType = (mimetype) => {
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype.startsWith("audio/")) return "audio";
    if (mimetype.startsWith("audio/")) return "video";
    return "document"; // fallback general
};
  
  module.exports = { 
    detectMediaType,
    validateMediaFile 
};
  