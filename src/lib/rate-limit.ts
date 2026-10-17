import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // in seconds
}

// In-memory fallback sliding-window limiter for local development or Redis downtime
interface LocalRecord {
  timestamps: number[];
}

const localFallbackMap = new Map<string, LocalRecord>();

// Clean up stale in-memory entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of localFallbackMap.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);
      if (record.timestamps.length === 0) {
        localFallbackMap.delete(key);
      }
    }
  }, 300000);
}

function checkLocalFallbackRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  let record = localFallbackMap.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    localFallbackMap.set(identifier, record);
  }

  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      success: false,
      remaining: 0,
      reset: resetSec,
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    remaining: limit - record.timestamps.length,
    reset: Math.max(1, Math.ceil(windowMs / 1000)),
  };
}

let redisClient: Redis | null = null;
let lastConfiguredUrl: string | null = null;
const ratelimitInstances = new Map<string, Ratelimit>();
let warnedUnconfigured = false;

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    return null;
  }

  if (!redisClient || lastConfiguredUrl !== url) {
    redisClient = new Redis({ url, token });
    lastConfiguredUrl = url;
    ratelimitInstances.clear();
  }
  return redisClient;
}

function getRatelimiter(redis: Redis, limit: number, windowMs: number): Ratelimit {
  const key = `${limit}_${windowMs}`;
  let limiter = ratelimitInstances.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      analytics: false,
      prefix: "apexai_rl",
    });
    ratelimitInstances.set(key, limiter);
  }
  return limiter;
}

/**
 * Distributed rate limiter with fail-safe local fallback.
 * Checks Upstash Redis across serverless instances, falling back to local sliding window
 * limiter if Redis is unconfigured or temporarily unreachable.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 20,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  if (!redis) {
    if (!warnedUnconfigured && process.env.NODE_ENV !== "production") {
      console.warn(
        "Upstash Redis rate-limiter credentials (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN) not set. Using local in-memory fallback rate limiter."
      );
      warnedUnconfigured = true;
    }
    // Fail safely by enforcing in-memory rate limiting so requests are never completely unbounded
    return checkLocalFallbackRateLimit(identifier, limit, windowMs);
  }

  try {
    const ratelimit = getRatelimiter(redis, limit, windowMs);
    const result = await ratelimit.limit(identifier);

    return {
      success: result.success,
      remaining: Math.max(0, result.remaining),
      reset: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Upstash Redis rate limit check failed, engaging fail-safe fallback:", err.message);

    // Fail-safe protection: enforce local sliding-window limit so requests are never unlimited
    return checkLocalFallbackRateLimit(identifier, limit, windowMs);
  }
}
