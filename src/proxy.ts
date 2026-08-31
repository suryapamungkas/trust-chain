import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/api/auth/login", "/api/auth/register", "/api/auth/forgot-password", "/api/auth/reset-password"];
const ADMIN_PATHS = ["/dashboard", "/products", "/supply-chain", "/smart-contracts", "/transactions", "/certifications", "/ai-analytics", "/fraud-detection", "/demand-prediction", "/government", "/banking", "/exporters", "/traceability"];
const UMKM_PATHS = ["/umkm"];
const BUYER_PATHS = ["/buyer"];

function getJwtSecretBytes(): Uint8Array {
  const secret = process.env.JWT_SECRET || "tc-umkm-dev-only-fallback-secret-CHANGE-ME";
  return new TextEncoder().encode(secret);
}

export async function proxy(req: NextRequest) {
  return middleware(req);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p)) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|webp)$/i)) return NextResponse.next();
  if (pathname.startsWith("/images")) return NextResponse.next();
  if (pathname.startsWith("/products")) return NextResponse.next();
  if (pathname.startsWith("/marketplace")) return NextResponse.next();
  if (pathname.startsWith("/verify")) return NextResponse.next();

  // Allow public API routes (auth endpoints already in PUBLIC_PATHS above)
  const publicApiPrefixes = ["/api/auth/", "/api/marketplace", "/api/products", "/api/verify", "/api/test-db", "/api/stats", "/api/reviews"];
  if (publicApiPrefixes.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get("tc_token")?.value;

  if (!token) {
    // For API routes, return 401 instead of redirect
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verify JWT signature using jose (Edge Runtime compatible)
  let payload: { role?: string; userId?: number; email?: string } | null = null;
  try {
    const { payload: verified } = await jwtVerify(token, getJwtSecretBytes());
    payload = verified as { role?: string; userId?: number; email?: string };
  } catch {
    // Token is invalid or expired
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Token invalid or expired" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("tc_token", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Validate payload has required fields
  if (!payload || !payload.role || !payload.userId || !payload.email) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Token payload invalid" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("tc_token", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Validate role is valid
  if (!["admin", "umkm", "buyer"].includes(payload.role)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("tc_token", "", { maxAge: 0, path: "/" });
    return res;
  }

  const { role } = payload;

  // Protect admin API routes
  if (pathname.startsWith("/api/admin") && role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  // Admin routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (role !== "admin") {
      if (role === "umkm") return NextResponse.redirect(new URL("/umkm", req.url));
      if (role === "buyer") return NextResponse.redirect(new URL("/buyer", req.url));
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // UMKM routes
  if (UMKM_PATHS.some((p) => pathname.startsWith(p))) {
    if (role !== "umkm") {
      if (role === "admin") return NextResponse.redirect(new URL("/dashboard", req.url));
      if (role === "buyer") return NextResponse.redirect(new URL("/buyer", req.url));
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Buyer routes
  if (BUYER_PATHS.some((p) => pathname.startsWith(p))) {
    if (role !== "buyer") {
      if (role === "admin") return NextResponse.redirect(new URL("/dashboard", req.url));
      if (role === "umkm") return NextResponse.redirect(new URL("/umkm", req.url));
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
