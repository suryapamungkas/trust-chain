import { describe, it, expect } from "vitest";
import { checkRateLimit, RATE_LIMITS, type RateLimitConfig } from "../rate-limit";

describe("Rate Limiter", () => {
  it("should allow first request", () => {
    const result = checkRateLimit("test-first-request", { maxRequests: 5, windowMs: 60000 });
    expect(result.allowed).toBe(true);
  });

  it("should allow requests within limit", () => {
    const config: RateLimitConfig = { maxRequests: 3, windowMs: 60000 };
    const key = "test-within-limit-" + Date.now();

    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);
  });

  it("should block requests exceeding limit", () => {
    const config: RateLimitConfig = { maxRequests: 2, windowMs: 60000 };
    const key = "test-exceed-" + Date.now();

    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);

    const blocked = checkRateLimit(key, config);
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterMs).toBeGreaterThan(0);
      expect(blocked.retryAfterMs).toBeLessThanOrEqual(60000);
    }
  });

  it("should have correct preset configs", () => {
    expect(RATE_LIMITS.auth.maxRequests).toBe(5);
    expect(RATE_LIMITS.wallet.maxRequests).toBe(10);
    expect(RATE_LIMITS.general.maxRequests).toBe(60);
    expect(RATE_LIMITS.chat.maxRequests).toBe(30);
    expect(RATE_LIMITS.export.maxRequests).toBe(5);
  });

  it("should use separate windows for different keys", () => {
    const config: RateLimitConfig = { maxRequests: 1, windowMs: 60000 };
    const keyA = "test-separate-a-" + Date.now();
    const keyB = "test-separate-b-" + Date.now();

    expect(checkRateLimit(keyA, config).allowed).toBe(true);
    expect(checkRateLimit(keyB, config).allowed).toBe(true);

    // keyA exhausted
    expect(checkRateLimit(keyA, config).allowed).toBe(false);
    // keyB still separate, should also be exhausted
    expect(checkRateLimit(keyB, config).allowed).toBe(false);
  });
});
