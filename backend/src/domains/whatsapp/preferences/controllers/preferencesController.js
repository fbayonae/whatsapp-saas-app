const preferenceService = require('../../..shared/services/preferenceService');

const getPreferences = async (req, res) => {
    try {
        const prefs = await preferenceService.getPreferences();
        res.json(prefs);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las preferencias" });
    }
};

const updatePreferences = async (req, res) => {
    try {
        const updated = await preferenceService.createOrUpdatePreferences(req.body);
        res.json({ message: "Preferencias actualizadas", data: updated });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar preferencias" });
    }
};

module.exports = {
    getPreferences,
    updatePreferences
};