import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Per-user: 30 AI calls/day (generous demo -- using Haiku for cost efficiency)
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 d"),
  prefix: "orbit:ai",
});

// Global circuit breaker: 100 calls/day across all users
export const globalRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 d"),
  prefix: "orbit:global",
});
