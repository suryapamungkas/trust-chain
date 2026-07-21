import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  createProductSchema,
  topUpSchema,
  purchaseSchema,
  createReviewSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  validateBody,
} from "../validation";

describe("Validation — Login Schema", () => {
  it("should accept valid login data", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("should reject empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid email format", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("should reject empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("Validation — Register Schema", () => {
  it("should accept valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "umkm",
    });
    expect(result.success).toBe(true);
  });

  it("should reject password shorter than 8 chars", () => {
    const result = registerSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      password: "short",
      role: "umkm",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid role", () => {
    const result = registerSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      password: "password123",
      role: "admin", // admin not allowed via registration
    });
    expect(result.success).toBe(false);
  });

  it("should accept optional business fields", () => {
    const result = registerSchema.safeParse({
      name: "UMKM Owner",
      email: "umkm@example.com",
      password: "password123",
      role: "umkm",
      businessName: "My UMKM",
      province: "Jawa Tengah",
      city: "Semarang",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.businessName).toBe("My UMKM");
    }
  });
});

describe("Validation — Product Schema", () => {
  it("should accept valid product data", () => {
    const result = createProductSchema.safeParse({
      name: "Kunyit Asam",
      category: "Jamu Tradisional",
      priceIdr: 25000,
      priceUsd: 1.5,
      stock: 100,
    });
    expect(result.success).toBe(true);
  });

  it("should reject negative price", () => {
    const result = createProductSchema.safeParse({
      name: "Test",
      category: "Test",
      priceIdr: -1000,
      priceUsd: 1,
      stock: 10,
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer stock", () => {
    const result = createProductSchema.safeParse({
      name: "Test",
      category: "Test",
      priceIdr: 1000,
      priceUsd: 1,
      stock: 10.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("Validation — Top-Up Schema", () => {
  it("should accept valid top-up", () => {
    const result = topUpSchema.safeParse({ amount: 100000, currency: "IDR" });
    expect(result.success).toBe(true);
  });

  it("should reject zero amount", () => {
    const result = topUpSchema.safeParse({ amount: 0, currency: "IDR" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid currency", () => {
    const result = topUpSchema.safeParse({ amount: 100, currency: "EUR" });
    expect(result.success).toBe(false);
  });
});

describe("Validation — Purchase Schema", () => {
  it("should accept valid purchase", () => {
    const result = purchaseSchema.safeParse({ productId: 1, quantity: 2 });
    expect(result.success).toBe(true);
  });

  it("should reject quantity 0", () => {
    const result = purchaseSchema.safeParse({ productId: 1, quantity: 0 });
    expect(result.success).toBe(false);
  });
});

describe("Validation — Review Schema", () => {
  it("should accept valid review", () => {
    const result = createReviewSchema.safeParse({
      productId: 1,
      rating: 5,
      comment: "Produk bagus sekali!",
    });
    expect(result.success).toBe(true);
  });

  it("should reject rating above 5", () => {
    const result = createReviewSchema.safeParse({ productId: 1, rating: 6 });
    expect(result.success).toBe(false);
  });

  it("should reject rating below 1", () => {
    const result = createReviewSchema.safeParse({ productId: 1, rating: 0 });
    expect(result.success).toBe(false);
  });
});

describe("Validation — Password Reset Schemas", () => {
  it("should accept valid forgot password request", () => {
    const result = forgotPasswordSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("should accept valid reset password request", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123def456",
      password: "newPassword123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject short reset password", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("Validation — Profile Schema", () => {
  it("should accept partial profile update", () => {
    const result = updateProfileSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("should accept UMKM-specific fields", () => {
    const result = updateProfileSchema.safeParse({
      businessName: "New Business",
      province: "DKI Jakarta",
    });
    expect(result.success).toBe(true);
  });
});

describe("Validation — validateBody helper", () => {
  it("should return success for valid data", () => {
    const result = validateBody(loginSchema, { email: "test@example.com", password: "pass123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });

  it("should return response with 400 for invalid data", () => {
    const result = validateBody(loginSchema, { email: "invalid", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(400);
    }
  });
});
