const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/:mediaId", async (req, res) => {
  const mediaId = req.params.mediaId;
  const downloadDir = path.join(__dirname, "../downloads");
  const filePath = fs.readdirSync(downloadDir).find(file => file.startsWith(mediaId));

  if (!filePath) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }

  res.sendFile(path.join(downloadDir, filePath));
});

module.exports = router;
