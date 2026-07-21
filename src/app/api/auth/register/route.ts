import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser, createUmkmProfile, createBuyerProfile } from "@/lib/db";
import { hashPassword, signToken, getRoleRedirect } from "@/lib/auth";
import { registerSchema, validateBody } from "@/lib/validation";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimited = applyRateLimit(req, "auth:register", RATE_LIMITS.auth);
    if (rateLimited) return rateLimited;

    const body = await req.json();
    const validation = validateBody(registerSchema, body);
    if (!validation.success) return validation.response;

    const { name, email, password, role, businessName, companyName, province, city, country } = validation.data;

    const existing = await getUserByEmail(email.toLowerCase().trim());
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const userId = await createUser(name, email.toLowerCase().trim(), hashedPassword, role);

    if (role === "umkm") {
      await createUmkmProfile(userId, { businessName: businessName || name, province, city });
    } else if (role === "buyer") {
      await createBuyerProfile(userId, { companyName: companyName || name, country: country || "Indonesia" });
    }

    const token = signToken({ userId, email: email.toLowerCase().trim(), role, name });
    const redirect = getRoleRedirect(role);

    const response = NextResponse.json({
      success: true,
      user: { id: userId, name, email, role },
      redirect,
    });

    response.cookies.set("tc_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
