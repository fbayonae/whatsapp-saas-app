// src/workers/worker.js
require("dotenv").config();
const { Worker } = require("bullmq");
const connection = require("../queues/connection");
const processMessage = require("../queues/messageProcessor");

const messageWorker = new Worker(
  "messages",
  async (job) => {
    try {
        const { msg, contact_wa } = job.data;
        await processMessage(msg, contact_wa);
    } catch (err) {
      console.error("❌ Error procesando mensaje en worker:", err);
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
