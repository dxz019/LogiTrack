const { Worker } = require('bullmq');
const redisWrapper = require('../config/redis');
const notifyService = require('../services/notifyService');
const { logger } = require('../config/logger');

// Only start worker if Redis is available
if (redisWrapper.isRedisAvailable()) {
  const worker = new Worker(
    'notifications',
    async (job) => {
      logger.info(`Processing notification job ${job.id} of type ${job.name}`);
      
      try {
        switch (job.name) {
          case 'send-notification':
            const { notificationData, io } = job.data;
            await sendNotificationJob(notificationData, io);
            break;
          default:
            logger.warn(`Unknown job type: ${job.name}`);
        }
      } catch (error) {
        logger.error(`Error processing notification job ${job.id}:`, error);
        throw error;
      }
    },
    {
      connection: redisWrapper.getRedis(),
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Notification job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Notification job ${job.id} failed with error ${err.message}`);
  });

  logger.info('Notification worker started');

  async function sendNotificationJob(notificationData, io) {
    const { userId, orderId, type, title, message } = notificationData;
    
    // 1. Insert row into notifications table (if DB available)
    try {
      const pool = require('../config/db');
      const result = await pool.query(
        `INSERT INTO notifications (user_id, order_id, type, title, message)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, orderId, type, title, message]
      );
      const notification = result.rows[0];
      
      // 2. Emit notification:new via Socket.io to user room (if io available)
      if (io) {
        io.to(`user:${userId}`).emit('notification:new', notification);
      }
      
      // 3. Send FCM push if user has fcm_token (would need to check DB)
      // 4. Send email via Nodemailer for key events (would need to check DB)
      
      logger.info(`Notification sent: ${type} to user ${userId}`);
    } catch (dbError) {
      logger.warn(`Database unavailable for notification storage: ${dbError.message}`);
      // Still try to send via socket/email if possible
    }
  }
} else {
  logger.warn('Redis not available - Notification worker disabled');
}
