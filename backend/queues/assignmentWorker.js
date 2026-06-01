const { Worker } = require('bullmq');
const redisWrapper = require('../config/redis');
const AssignmentEngine = require('../services/assignmentEngine');
const { logger } = require('../config/logger');

// Only start worker if Redis is available
if (redisWrapper.isRedisAvailable()) {
  const worker = new Worker(
    'assignment',
    async (job) => {
      logger.info(`Processing assignment job ${job.id} of type ${job.name}`);
      
      try {
        switch (job.name) {
          case 'assignment-timeout':
            const { orderId, driverId } = job.data;
            // Handle assignment timeout logic
            logger.info(`Assignment timeout for order ${orderId}, driver ${driverId}`);
            // TODO: Implement timeout reassignment logic
            break;
          default:
            logger.warn(`Unknown job type: ${job.name}`);
        }
      } catch (error) {
        logger.error(`Error processing job ${job.id}:`, error);
        throw error;
      }
    },
    {
      connection: redisWrapper.getRedis(),
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed with error ${err.message}`);
  });

  logger.info('Assignment worker started');
} else {
  logger.warn('Redis not available - Assignment worker disabled');
}
