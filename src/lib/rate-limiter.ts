/**
 * Simple in-memory rate limiter
 *
 * For production, consider using Redis or a database-backed solution.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetTime: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Check if a request is within rate limits
 *
 * @param key - Unique identifier for the rate limit (e.g., userId, IP address)
 * @param config - Rate limit configuration
 * @returns true if request is allowed, throws RateLimitError if exceeded
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // First request or window has reset
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return true;
  }

  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    const resetInSeconds = Math.ceil((record.resetTime - now) / 1000);
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
      record.resetTime
    );
  }

  // Increment count
  record.count++;
  rateLimitStore.set(key, record);
  return true;
}

/**
 * Get remaining requests for a key
 */
export function getRateLimitStatus(
  key: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): {
  remaining: number;
  resetTime: number;
  total: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    return {
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
      total: config.maxRequests,
    };
  }

  return {
    remaining: Math.max(0, config.maxRequests - record.count),
    resetTime: record.resetTime,
    total: config.maxRequests,
  };
}

/**
 * Reset rate limit for a specific key (useful for testing)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  AI_CHAT: { maxRequests: 20, windowMs: 60000 }, // 20 messages per minute
  AI_INSIGHTS: { maxRequests: 5, windowMs: 300000 }, // 5 insights per 5 minutes
  AI_PROMPTS: { maxRequests: 10, windowMs: 60000 }, // 10 prompts per minute
} as const;
