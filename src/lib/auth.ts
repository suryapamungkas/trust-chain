// =====================================================================
// TrustChain UMKM — Auth Utilities
// =====================================================================

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("🚨 JWT_SECRET environment variable is not set! Using fallback for development only.");
    return "tc-umkm-dev-only-fallback-secret-CHANGE-ME";
  }
  return secret;
}

const JWT_EXPIRES = "7d";

export interface JWTPayload {
  userId: number;
  email: string;
  role: "admin" | "umkm" | "buyer";
  name: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getRoleRedirect(role: string): string {
  switch (role) {
    case "admin": return "/dashboard";
    case "umkm": return "/umkm";
    case "buyer": return "/buyer";
    default: return "/login";
  }
}

/**
 * Extract token from request cookies
 */
export function extractToken(cookies: { get: (name: string) => { value: string } | undefined }): string | null {
  return cookies.get("tc_token")?.value || null;
}

/**
 * Authenticate request — returns payload or null
 */
export function authenticateRequest(cookies: { get: (name: string) => { value: string } | undefined }): JWTPayload | null {
  const token = extractToken(cookies);
  if (!token) return null;
  return verifyToken(token);
}
