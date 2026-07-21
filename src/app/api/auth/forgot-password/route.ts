import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createPasswordResetToken } from "@/lib/db";
import { forgotPasswordSchema, validateBody } from "@/lib/validation";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req, "auth:forgot-password", RATE_LIMITS.auth);
    if (rateLimited) return rateLimited;

    const body = await req.json();
    const validation = validateBody(forgotPasswordSchema, body);
    if (!validation.success) return validation.response;

    const { email } = validation.data;
    const user = await getUserByEmail(email.toLowerCase().trim());

    if (!user) {
      // Don't reveal whether email exists — always return success
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar, instruksi reset password akan dikirim.",
      });
    }

    const token = await createPasswordResetToken(user.id as number);

    // In production, send email with reset link. For demo, return token directly.
    return NextResponse.json({
      success: true,
      message: "Jika email terdaftar, instruksi reset password akan dikirim.",
      // Demo only — in production, remove this and send via email
      _demo_token: token,
      _demo_reset_url: `/reset-password?token=${token}`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
