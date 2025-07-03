const fs = require("fs");
const path = require("path");

const getLogs = async (req, res) => {
  try {
    const logPath = path.join(__dirname, "..", "..", "logs", "combined.log");
    const content = fs.readFileSync(logPath, "utf8");

    const lines = content.trim().split("\n").filter(Boolean);
    const logs = lines.map(line => {
      // Intentamos extraer info: timestamp, level y mensaje
      const match = line.match(/^(\d{4}-\d{2}-\d{2}T[^\s]+) \[([a-z]+)\]: (.*)$/);
      if (match) {
        return {
          timestamp: match[1],
          level: match[2],
          message: match[3]
        };
      }
      return { timestamp: "", level: "info", message: line };
    });

    res.json(logs.reverse()); // Mostrar los más recientes primero
  } catch (error) {
    console.error("❌ Error leyendo logs:", error);
    res.status(500).json({ error: "Error al leer los logs del sistema" });
  }
};

module.exports = { getLogs };
