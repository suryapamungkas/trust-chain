import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUmkmProfileByUserId, updateUmkmProfile } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token invalid" }, { status: 401 });

    const profile = await getUmkmProfileByUserId(payload.userId);
    return NextResponse.json(profile || {});
  } catch (error) {
    console.error("UMKM profile GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token invalid" }, { status: 401 });

    const profile = await getUmkmProfileByUserId(payload.userId);
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const body = await req.json();
    await updateUmkmProfile(Number(profile.id), body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UMKM profile PUT error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
