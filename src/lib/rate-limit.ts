/**
 * PIYROX Market — In-memory Rate Limiter
 *
 * Sliding window counter: 60 requests per 60 seconds per IP.
 * Suitable for single-instance deployments. For multi-instance,
 * swap with a Redis-backed implementation.
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_REQUESTS = 60;

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - WINDOW_MS * 2;
  for (const [key, entry] of store.entries()) {
    if (entry.lastRefill < cutoff) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix ms timestamp
}

/**
 * Check rate limit for a given identifier (typically IP address).
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  cleanup();

  const now = Date.now();
  let entry = store.get(identifier);

  if (!entry) {
    entry = { tokens: MAX_REQUESTS - 1, lastRefill: now };
    store.set(identifier, entry);
    return {
      allowed: true,
      remaining: entry.tokens,
      resetAt: now + WINDOW_MS,
    };
  }

  // Token bucket refill
  const elapsed = now - entry.lastRefill;
  const refillAmount = Math.floor((elapsed / WINDOW_MS) * MAX_REQUESTS);

  if (refillAmount > 0) {
    entry.tokens = Math.min(MAX_REQUESTS, entry.tokens + refillAmount);
    entry.lastRefill = now;
  }

  if (entry.tokens <= 0) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.lastRefill + WINDOW_MS,
    };
  }

  entry.tokens -= 1;
  return {
    allowed: true,
    remaining: entry.tokens,
    resetAt: entry.lastRefill + WINDOW_MS,
  };
}

/**
 * Get rate limit headers for a response.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": MAX_REQUESTS.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetAt / 1000).toString(),
    ...(result.allowed ? {} : { "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString() }),
  };
}
