// src/queues/connection.js
require('dotenv').config();

module.exports = {
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};
