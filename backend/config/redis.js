const Redis = require('ioredis');

let redis = null;
let isConnected = false;

function createRedisConnection() {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      connectTimeout: 10000, // 10 second timeout
    });

    redis.on('connect', () => {
      console.log('Connected to Redis');
      isConnected = true;
    });

    redis.on('error', (err) => {
      console.warn('Redis connection error:', err.message);
      isConnected = false;
    });

    redis.on('close', () => {
      console.warn('Redis connection closed');
      isConnected = false;
    });

    redis.on('reconnecting', () => {
      console.log('Reconnecting to Redis...');
    });

    return redis;
  } catch (error) {
    console.warn('Failed to create Redis connection:', error.message);
    return null;
  }
}

// Initialize Redis connection
redis = createRedisConnection();

// Helper to check if Redis is available
function isRedisAvailable() {
  return isConnected && redis && redis.status === 'ready';
}

module.exports = {
  getRedis: () => redis,
  isRedisAvailable: isRedisAvailable
};
