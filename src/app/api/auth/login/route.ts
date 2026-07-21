import { NextRequest, NextResponse } from "next/server";
import { getUserByEmailForAuth, updateLastLogin } from "@/lib/db";
import { comparePassword, signToken, getRoleRedirect } from "@/lib/auth";
import { loginSchema, validateBody } from "@/lib/validation";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimited = applyRateLimit(req, "auth:login", RATE_LIMITS.auth);
    if (rateLimited) return rateLimited;

    const body = await req.json();
    const validation = validateBody(loginSchema, body);
    if (!validation.success) return validation.response;

    const { email, password } = validation.data;

    // getUserByEmailForAuth returns password_hash (for auth only)
    const user = await getUserByEmailForAuth(email.toLowerCase().trim());
    if (!user) {
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password_hash as string);
    if (!valid) {
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    }

    await updateLastLogin(user.id as number);

    const token = signToken({
      userId: user.id as number,
      email: user.email as string,
      role: user.role as "admin" | "umkm" | "buyer",
      name: user.name as string,
    });

    const redirect = getRoleRedirect(user.role as string);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      redirect,
    });

    response.cookies.set("tc_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
