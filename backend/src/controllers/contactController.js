const prisma = require("../prisma/client");

const getAllContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(contacts);
  } catch (error) {
    console.error("❌ Error al obtener contactos:", error);
    res.status(500).json({ error: "Error al obtener contactos" });
  }
};

module.exports = { getAllContacts };
