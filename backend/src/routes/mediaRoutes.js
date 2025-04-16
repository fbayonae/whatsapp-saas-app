const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const validate = require("../utils/validators");

router.get("/:mediaId",
  [
    param("mediaId")
      .notEmpty()
      .withMessage("El mediaId es requerido")
      .isLength({ min: 6 })
      .withMessage("El mediaId debe tener al menos 6 caracteres")
      .matches(/^[a-zA-Z0-9\-_.]+$/)
      .withMessage("El mediaId contiene caracteres no válidos"),
  ],
  validate,
  async (req, res) => {
    const mediaId = req.params.mediaId;
    const downloadDir = path.join(__dirname, "../downloads");
    const filePath = fs.readdirSync(downloadDir).find(file => file.startsWith(mediaId));

    if (!filePath) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    res.sendFile(path.join(downloadDir, filePath));
  });

module.exports = router;
