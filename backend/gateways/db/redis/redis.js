import redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  retryStrategy(times) {
    const delay = Math.min(times * 500, 5000);
    return delay;
  },
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

redisClient.on("error", (err) => {
  console.warn("[ioredis] Connection error:", err.message);
});

redisClient.on("connect", () => {
  console.info("[ioredis] Connected to Redis");
});

export default redisClient;
