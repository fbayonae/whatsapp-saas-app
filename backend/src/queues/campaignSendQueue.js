const { Queue } = require("bullmq");
const connection = require("./connection");

const sendQueue = new Queue("campaign-messages", { connection });

module.exports = sendQueue;