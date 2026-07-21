import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { purchaseProduct } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "buyer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { productId, quantity, currency, destinationCountry } = await req.json();
    if (!productId || !quantity || !destinationCountry) return NextResponse.json({ error: "productId, quantity, dan destinationCountry wajib diisi" }, { status: 400 });

    const result = await purchaseProduct(payload.userId, productId, quantity, currency || "IDR", destinationCountry);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    console.error("Purchase error:", error);
    const message = error instanceof Error ? error.message : "Pembelian gagal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
