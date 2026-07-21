import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAllUmkmProfiles } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const profiles = await getAllUmkmProfiles();
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Admin UMKM GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
