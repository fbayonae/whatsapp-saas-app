// src/workers/worker.js
require("dotenv").config();
const { Worker } = require("bullmq");
const connection = require("../queues/connection");
const messageProcessor = require("../queues/messageProcessor");
const campaignSendProcessor = require("../queues/campaignSendProcessor");

const messageWorker = new Worker(
    "messages",
    async (job) => {
        try {
            const { message, contact } = job.data;
            await messageProcessor.processMessage(message, contact);
        } catch (err) {
            console.error("❌ Error procesando mensaje en worker:", err);
        }
    },
    { connection }
);

// Worker para campañas masivas
const campaignWorker = new Worker(
    "campaign-messages",
    async (job) => {
        try {
            if (job.name === "send-campaign-message") {
                await campaignSendProcessor(job.data);
            }
        } catch (err) {
            console.error("❌ Error procesando envío de campaña:", err);
        }
    },
    { connection }
);

messageWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completado`);
});

messageWorker.on("failed", (job, err) => {
    console.error(`❌ Job ${job.id} fallido:`, err.message);
});

campaignWorker.on("completed", (job) => {
    console.log(`✅ [campaign-messages] Job ${job.id} completado`);
});
campaignWorker.on("failed", (job, err) => {
    console.error(`❌ [campaign-messages] Job ${job.id} fallido:`, err.message);
});