const dbService = require('../services/dbService');

const getPreferences = async (req, res) => {
    try {
        const prefs = await dbService.getPreferences();
        res.json(prefs);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las preferencias" });
    }
};

const updatePreferences = async (req, res) => {
    try {
        const updated = await dbService.createOrUpdatePreferences(req.body);
        res.json({ message: "Preferencias actualizadas", data: updated });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar preferencias" });
    }
};

module.exports = {
    getPreferences,
    updatePreferences
};