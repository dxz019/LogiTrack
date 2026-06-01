const { Queue } = require('bullmq');
const redisWrapper = require('../config/redis');

// Only create queue if Redis is available
let assignmentQueue = null;

if (redisWrapper.isRedisAvailable()) {
  assignmentQueue = new Queue('assignment', {
    connection: redisWrapper.getRedis(),
  });
  console.log('Assignment queue initialized');
} else {
  console.warn('Redis not available - Assignment queue disabled');
  // Create a mock queue for development
  assignmentQueue = {
    add: async () => {
      console.warn('Mock queue: add operation skipped (Redis unavailable)');
      return {};
    }
  };
}

module.exports = assignmentQueue;
