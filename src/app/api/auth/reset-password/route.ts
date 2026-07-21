import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema, validateBody } from "@/lib/validation";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req, "auth:reset-password", RATE_LIMITS.auth);
    if (rateLimited) return rateLimited;

    const body = await req.json();
    const validation = validateBody(resetPasswordSchema, body);
    if (!validation.success) return validation.response;

    const { token, password } = validation.data;
    const hashedPassword = await hashPassword(password);

    try {
      await resetPassword(token, hashedPassword);
    } catch (e) {
      return NextResponse.json({
        error: (e instanceof Error ? e.message : "Token tidak valid atau sudah kedaluwarsa"),
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Password berhasil direset. Silakan login dengan password baru.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
