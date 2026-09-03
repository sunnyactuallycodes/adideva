import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
let isRedisConnected = false;

// Initialize Redis Client with lazy connect and reconnection limits
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      // Stop retrying after 3 attempts in local dev to prevent log spam
      return null;
    }
    return Math.min(times * 100, 2000);
  },
  lazyConnect: true,
  enableOfflineQueue: false,
});

redis.on("connect", () => {
  isRedisConnected = true;
  console.log(" Redis connected successfully");
});

redis.on("ready", () => {
  isRedisConnected = true;
  console.log(" Redis is ready to accept commands");
});

redis.on("error", (err) => {
  isRedisConnected = false;
  // Log once gracefully without throwing fatal exception
  if (err.code === "ECONNREFUSED") {
    // Suppress repeated ECONNREFUSED in development
  } else {
    console.warn(" Redis client error:", err.message);
  }
});

redis.on("close", () => {
  isRedisConnected = false;
});

// Attempt initial connection safely
const connectRedis = async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.warn(" Redis connection not available (running in memory/direct DB mode)");
  }
};

connectRedis();

/**
 * Safe Redis Cache Get Helper with in-memory fallback
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export const getCache = async (key) => {
  try {
    if (!isRedisConnected) return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`Redis getCache error for key ${key}:`, error.message);
    return null;
  }
};

/**
 * Safe Redis Cache Set Helper
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds
 */
export const setCache = async (key, value, ttlSeconds = 3600) => {
  try {
    if (!isRedisConnected) return false;
    const serialized = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redis.set(key, serialized, "EX", ttlSeconds);
    } else {
      await redis.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.warn(`Redis setCache error for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Safe Redis Cache Invalidation Helper
 * @param {string} key
 */
export const deleteCache = async (key) => {
  try {
    if (!isRedisConnected) return false;
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn(`Redis deleteCache error for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Safe Redis Cache Pattern Invalidation Helper (e.g., "packages:*")
 * @param {string} pattern
 */
export const deleteCachePattern = async (pattern) => {
  try {
    if (!isRedisConnected) return false;
    const keys = await redis.keys(pattern);
    if (keys && keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    console.warn(`Redis deleteCachePattern error for pattern ${pattern}:`, error.message);
    return false;
  }
};

export default redis;
