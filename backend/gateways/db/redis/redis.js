import redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB, 10) || 0,
});

export default redisClient;
