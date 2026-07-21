import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAllUmkmProfiles, verifyUmkm } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profiles = await getAllUmkmProfiles();
    let verifiedCount = 0;

    for (const p of profiles) {
      if (p.verification_status === "pending" && p.reliability_score >= 80) {
        await verifyUmkm(p.id, "verified");
        verifiedCount++;
      }
    }

    return NextResponse.json({ success: true, verifiedCount });
  } catch (error) {
    console.error("Auto-verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
