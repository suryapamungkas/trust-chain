import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { getUserById, updateUserProfile, getUmkmProfileByUserId, getBuyerProfileByUserId } from "@/lib/db";
import { updateProfileSchema, validateBody } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const payload = authenticateRequest(req.cookies);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUserById(payload.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let profile = null;
    if (user.role === "umkm") {
      profile = await getUmkmProfileByUserId(payload.userId);
    } else if (user.role === "buyer") {
      profile = await getBuyerProfileByUserId(payload.userId);
    }

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = authenticateRequest(req.cookies);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = validateBody(updateProfileSchema, body);
    if (!validation.success) return validation.response;

    await updateUserProfile(payload.userId, validation.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
