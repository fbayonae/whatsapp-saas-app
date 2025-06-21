const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createOrUpdatePreferences = async (data) => {

    try {
        const existing = await prisma.preference.findFirst();
        if (existing) {
            return await prisma.preference.update({
                where: { id: existing.id },
                data
            });
        }

        return await prisma.preference.create({
            data
        });
    } catch (error) {
        console.error("❌ Error obteniendo preferencias:", error);
        throw error;
    }

};


// Obtener las preferencias
const getPreferences = async () => {
    try {
        return await prisma.preference.findFirst();
    } catch (error) {
        console.error("❌ Error obteniendo preferencias:", error);
        throw error;
    }
};

module.exports = {
    createOrUpdatePreferences,
    getPreferences
};