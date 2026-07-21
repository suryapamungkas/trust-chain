// =====================================================================
// TrustChain UMKM — Rate Limiter (In-Memory)
// Simple Map-based rate limiter suitable for demo/hackathon
// =====================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;   // Max requests per window
  windowMs: number;      // Time window in milliseconds
}

// Preset configs
export const RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 60 * 1000 } as RateLimitConfig,       // 5 req/min
  wallet: { maxRequests: 10, windowMs: 60 * 1000 } as RateLimitConfig,    // 10 req/min
  general: { maxRequests: 60, windowMs: 60 * 1000 } as RateLimitConfig,   // 60 req/min
  chat: { maxRequests: 30, windowMs: 60 * 1000 } as RateLimitConfig,      // 30 req/min
  export: { maxRequests: 5, windowMs: 60 * 1000 } as RateLimitConfig,     // 5 req/min
} as const;

/**
 * Check rate limit for a given identifier (usually IP + endpoint).
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}

/**
 * Helper to get a rate limit key from request
 */
export function getRateLimitKey(req: Request, endpoint: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `${ip}:${endpoint}`;
}

import { NextResponse } from "next/server";

/**
 * Apply rate limiting to an API route. Returns null if allowed,
 * or a 429 NextResponse if rate limited.
 */
export function applyRateLimit(
  req: Request,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMITS.general
): NextResponse | null {
  const key = getRateLimitKey(req, endpoint);
  const result = checkRateLimit(key, config);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
        retryAfterMs: result.retryAfterMs,
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(result.retryAfterMs / 1000).toString(),
        },
      }
    );
  }

  return null;
}
