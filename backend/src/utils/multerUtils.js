const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ruta absoluta segura dentro del contenedor
const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Extensiones permitidas por tipo MIME
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "audio/aac",
  "audio/amr",
  "audio/mp3",
  "audio/mp4",
  "audio/ogg",
  "video/3gp",
  "video/mp4",
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(`Tipo de archivo no permitido: ${file.mimetype}`),
      false
    );
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
