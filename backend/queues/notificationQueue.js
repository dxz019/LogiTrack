const { Queue } = require('bullmq');
const redisWrapper = require('../config/redis');

// Only create queue if Redis is available
let notificationQueue = null;

if (redisWrapper.isRedisAvailable()) {
  notificationQueue = new Queue('notifications', {
    connection: redisWrapper.getRedis(),
  });
  console.log('Notification queue initialized');
} else {
  console.warn('Redis not available - Notification queue disabled');
  // Create a mock queue for development
  notificationQueue = {
    add: async () => {
      console.warn('Mock queue: add operation skipped (Redis unavailable)');
      return {};
    }
  };
}

module.exports = notificationQueue;
