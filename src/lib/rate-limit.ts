// src/lib/rate-limit.ts — Rate limiting via Upstash Redis + Ratelimit

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only create Redis client if env vars are set (skip in development if not configured)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Auth rate limiter: 5 requests per minute per IP.
 * Protects login/signup from brute force.
 */
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "rl:auth",
    })
  : null;

/**
 * Email rate limiter: 3 emails per 5 minutes per address.
 * Prevents inbox flooding via magic links or verification emails.
 */
export const emailRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "5 m"),
      prefix: "rl:email",
    })
  : null;

/**
 * Mutation rate limiter: 30 requests per minute per user.
 * Protects Server Actions (block CRUD, page updates, theme changes).
 */
export const mutationRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "rl:mutation",
    })
  : null;

/**
 * Check rate limit. Returns { success: true } if allowed, or { success: false } if blocked.
 * When Redis is not configured (local dev), always allows.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<{ success: boolean; remaining?: number }> {
  if (!limiter) {
    return { success: true };
  }

  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}
