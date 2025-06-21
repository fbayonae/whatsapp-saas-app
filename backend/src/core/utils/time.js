// utils/timeUtils.js
const isWithin24Hours = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMs = now - messageTime;
    return diffInMs <= 24 * 60 * 60 * 1000; // 24 horas en ms
  };
  
  module.exports = {
    isWithin24Hours
  };