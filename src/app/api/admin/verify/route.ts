import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { verifyUmkm } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { profileId, status } = await req.json();
    if (!profileId || !status) return NextResponse.json({ error: "profileId dan status wajib diisi" }, { status: 400 });

    await verifyUmkm(profileId, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
