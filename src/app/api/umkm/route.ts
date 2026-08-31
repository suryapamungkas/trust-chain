import { NextRequest, NextResponse } from "next/server";
import { getAllUmkmProfiles, RowDataPacket } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.toLowerCase() || "";
    const province = searchParams.get("province") || "";
    const category = searchParams.get("category") || "";
    const verification = searchParams.get("verification") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    let profiles = await getAllUmkmProfiles();

    // In-memory filter
    if (search) profiles = profiles.filter((p: RowDataPacket) => String(p.business_name || "").toLowerCase().includes(search) || String(p.user_name || "").toLowerCase().includes(search));
    if (province) profiles = profiles.filter((p: RowDataPacket) => p.province === province);
    if (category) profiles = profiles.filter((p: RowDataPacket) => p.category === category);
    if (verification) profiles = profiles.filter((p: RowDataPacket) => p.verification_status === verification);

    const total = profiles.length;
    const totalPages = Math.ceil(total / limit);
    const data = profiles.slice(offset, offset + limit);

    return NextResponse.json({ data, total, page, totalPages });
  } catch (error) {
    console.error("GET /api/umkm error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
