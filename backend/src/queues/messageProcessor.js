// src/queues/messageProcessor.js
const { Worker } = require("bullmq");
const connection = require("./connection");

const whatsappService = require("../services/whatsappService");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const processMessage = async (msg, contact_wa) => {
    console.log("📥 Mensaje recibido:", msg);
    console.log("📥 Contacto recibido:", contact_wa); 
    try {
        const from = msg.from;
        const text = msg.text?.body || '';
        const contextId = msg.context?.id || '';
        const type = msg.type;
        const meta_id = msg.id;
        const name = contact_wa?.profile?.name || 'desconocido';
        const timestamp = new Date(Number(msg.timestamp) * 1000);

        // Multimedia info
        let mediaInfo = null;
        const fileSource = msg.image || msg.document || msg.audio || msg.video;
        if (fileSource?.id) {
            mediaInfo = {
                mediaId: fileSource.id,
                mimeType: fileSource.mime_type,
                sha256: fileSource.sha256,
                caption: fileSource.caption || '',
            };

            try {
                const url = await whatsappService.getMediaUrl(fileSource.id);
                const localFile = await whatsappService.downloadMediaFile(url, fileSource.id, fileSource.mime_type);
                console.log("📥 Archivo guardado en:", localFile);
            } catch (err) {
                console.error("❌ Error descargando archivo multimedia:", err.message);
            }
        }

        // Buscar o crear contacto y conversación
        let conversation = await prisma.conversation.findFirst({
            where: { contact: { phoneNumber: from } },
            include: { contact: true },
        });

        let contact;
        if (!conversation) {
            contact = await prisma.contact.upsert({
                where: { phoneNumber: from },
                update: {},
                create: { phoneNumber: from, name },
            });

            conversation = await prisma.conversation.create({
                data: {
                    contactId: contact.id,
                    lastMessageAt: timestamp,
                },
            });
        } else {
            contact = conversation.contact;
            await prisma.conversation.update({
                where: { id: conversation.id },
                data: { lastMessageAt: timestamp },
            });
        }

        const interactiveText = msg.interactive?.button_reply?.title || '';

        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                direction: 'INBOUND',
                content: text || mediaInfo?.caption || interactiveText,
                timestamp,
                type,
                id_meta: meta_id,
                contextId,
                status: 'RECEIVED',
                media_id: mediaInfo?.mediaId,
                media_mimeType: mediaInfo?.mimeType,
                media_sha256: mediaInfo?.sha256,
                interactive: msg.interactive || null,
            }
        });

        console.log(`✅ Mensaje guardado en conversación ${conversation.id}`);
    } catch (error) {
        console.error("❌ Error procesando mensaje:", error.message, error);
    }
};

module.exports = { processMessage };
