const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUsersFromDB = async () => {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

const updateUserFromDB = async (id, data) => {
    try {
        const updateData = {
            name: data.name,
            role: data.role,
        };

        if (data.passwordHash) {
            updateData.passwordHash = data.passwordHash;
        }

        const updated = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        return updated;
    } catch (error) {
        console.error("❌ Error actualizando usuario:", error);
        throw error;
    }
};

const createUserFromDB = async ({ name, email, passwordHash, role }) => {
    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role,
            },
        });
        return user;
    } catch (error) {
        console.error("❌ Error creando usuario:", error);
        throw error;
    }
}

const deleteUserFromDB = async (userId) => {
    return await prisma.$transaction(async (tx) => {
        await tx.session.deleteMany({ where: { userId } });
        await tx.refreshToken.deleteMany({ where: { userId } });
        await tx.loginAttempt.deleteMany({ where: { userId } });

        return await tx.user.delete({ where: { id: userId } });
    });
};

const getUserByEmailFromDB = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        return user;
    } catch (error) {
        console.error("❌ Error obteniendo usuario por email:", error);
        throw error;
    }
};

/*******************************************************
 * SESSIONS
 *******************************************************/

// Buscar sesion activa
const getActiveSessionsByUser = async (userId) => {
    return await prisma.session.findMany({
        where: {
            userId,
            expiresAt: {
                gt: new Date()
            }
        },
        orderBy: { createdAt: "desc" }
    });
};

const getSessionsUserFromDB = async (id) => {
    return await prisma.session.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' }
    });
};

module.exports = {
    getUsersFromDB,
    updateUserFromDB,
    createUserFromDB,
    deleteUserFromDB,
    getUserByEmailFromDB,
    getActiveSessionsByUser,
    getSessionsUserFromDB
};