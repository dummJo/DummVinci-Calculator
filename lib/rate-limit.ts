// In-memory token-bucket rate limiter.
//
// Per Vercel serverless instance — state is NOT shared across regions/cold-starts,
// so a determined attacker could spread load across instances to bypass. That is
// acceptable for the current threat model (casual abuse / inadvertent loops).
// For production scale, migrate the bucket store to Upstash Redis or Vercel KV;
// the public API of `checkRateLimit` is designed to swap underlying storage
// without changing callers.

import { headers } from "next/headers";

type Bucket = { tokens: number; lastRefill: number };
const buckets = new Map<string, Bucket>();

let lastCleanup = Date.now();
function maybeCleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < windowMs) return;
  for (const [k, b] of buckets) {
    if (now - b.lastRefill > windowMs * 2) buckets.delete(k);
  }
  lastCleanup = now;
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;       // epoch ms
  retryAfterSec: number; // seconds until next token available
};

/**
 * Token-bucket: `max` tokens refilled over `windowMs`. Consume 1 per call.
 * If `allowed` is false, callers should return HTTP 429 with `retryAfterSec`.
 */
export function checkRateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  maybeCleanup(windowMs);
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: max, lastRefill: now };

  // Continuous refill: tokens earned proportional to elapsed time.
  const elapsed = now - b.lastRefill;
  if (elapsed > 0) {
    const refilled = (elapsed / windowMs) * max;
    b.tokens = Math.min(max, b.tokens + refilled);
    b.lastRefill = now;
  }

  if (b.tokens >= 1) {
    b.tokens -= 1;
    buckets.set(key, b);
    return {
      allowed: true,
      remaining: Math.floor(b.tokens),
      resetAt: now + windowMs,
      retryAfterSec: 0,
    };
  }

  // Empty bucket — compute when next whole token will be available.
  const msPerToken = windowMs / max;
  const retryAfterSec = Math.max(1, Math.ceil((1 - b.tokens) * msPerToken / 1000));
  buckets.set(key, b);
  return {
    allowed: false,
    remaining: 0,
    resetAt: now + retryAfterSec * 1000,
    retryAfterSec,
  };
}

/** Extract the best-effort client IP from the edge headers. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  let ip = h.get("x-forwarded-for")?.split(",")[0]?.trim()
        || h.get("x-real-ip")?.trim()
        || "anon";
  if (ip.startsWith("::ffff:")) ip = ip.substring(7);
  return ip || "anon";
}

/** Standard response headers to advertise rate limit state to clients. */
export function rateLimitHeaders(rl: RateLimitResult): Record<string, string> {
  const h: Record<string, string> = {
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset":     String(Math.floor(rl.resetAt / 1000)),
  };
  if (!rl.allowed) h["Retry-After"] = String(rl.retryAfterSec);
  return h;
}
