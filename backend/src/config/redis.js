import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const rawRedisUrl = process.env.REDIS_URL ? process.env.REDIS_URL.trim() : "";
// Only enable Redis if explicitly configured with an external URI (e.g. Upstash, Redis Cloud, Rediss)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production");
const shouldEnableRedis =
  rawRedisUrl &&
  (rawRedisUrl.startsWith("redis://") || rawRedisUrl.startsWith("rediss://")) &&
  !(isServerless && (rawRedisUrl.includes("localhost") || rawRedisUrl.includes("127.0.0.1")));

let isRedisConnected = false;
let redis = null;

if (shouldEnableRedis) {
  try {
    redis = new Redis(rawRedisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      showFriendlyErrorStack: false,
      retryStrategy(times) {
        // In serverless / cloud, do not loop reconnecting if host is unreachable
        return null;
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redis.on("connect", () => {
      isRedisConnected = true;
      console.log("✅ Redis connected successfully");
    });

    redis.on("ready", () => {
      isRedisConnected = true;
    });

    let hasLoggedError = false;
    redis.on("error", (err) => {
      isRedisConnected = false;
      if (!hasLoggedError) {
        hasLoggedError = true;
        console.warn("⚠️ Redis client notice:", err.message || "Connection refused");
      }
    });

    redis.on("close", () => {
      isRedisConnected = false;
    });

    // Safely attempt initial connection in background
    redis.connect().catch(() => {
      isRedisConnected = false;
    });
  } catch (e) {
    console.warn("Redis initialization skipped:", e.message);
    redis = null;
    isRedisConnected = false;
  }
}

/**
 * Safe Redis Cache Get Helper with in-memory fallback
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export const getCache = async (key) => {
  try {
    if (!isRedisConnected || !redis) return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
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
    if (!isRedisConnected || !redis) return false;
    const serialized = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redis.set(key, serialized, "EX", ttlSeconds);
    } else {
      await redis.set(key, serialized);
    }
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Safe Redis Cache Invalidation Helper
 * @param {string} key
 */
export const deleteCache = async (key) => {
  try {
    if (!isRedisConnected || !redis) return false;
    await redis.del(key);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Safe Redis Cache Pattern Invalidation Helper (e.g., "packages:*")
 * @param {string} pattern
 */
export const deleteCachePattern = async (pattern) => {
  try {
    if (!isRedisConnected || !redis) return false;
    const keys = await redis.keys(pattern);
    if (keys && keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    return false;
  }
};

export default redis;
