import { NextRequest, NextResponse } from "next/server";
import { getProducts, getAllUmkmProfiles, RowDataPacket } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid ID parameter" }, { status: 400 });
    }

    const profiles = await getAllUmkmProfiles();
    const profile = profiles.find((p: RowDataPacket) => p.id === numericId);

    if (!profile) {
      return NextResponse.json({ error: "UMKM profile not found" }, { status: 404 });
    }

    const products = await getProducts();
    const umkmProducts = products.filter((p: RowDataPacket) => p.umkm_profile_id === numericId);

    return NextResponse.json({ profile, products: umkmProducts, certifications: [] });
  } catch (error) {
    console.error("GET /api/umkm/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
