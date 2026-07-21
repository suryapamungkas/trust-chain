import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDb, getProductById } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { productId, status } = body;

    if (!productId || !["active", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const product = await getProductById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const pool = await getDb();
    await pool.query("UPDATE products SET status = ? WHERE id = ?", [status, productId]);

    // Add notification to UMKM
    const title = status === "active" ? "Produk Disetujui" : "Produk Ditolak";
    const message = status === "active" 
      ? `Produk ${product.name} telah disetujui dan kini tayang di Marketplace.`
      : `Produk ${product.name} ditolak oleh Admin. Silakan perbaiki detail produk Anda.`;
      
    await pool.query(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [product.umkm_user_id, title, message, status === "active" ? "success" : "error"]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin verify product error:", error);
    return NextResponse.json({ error: "Failed to verify product" }, { status: 500 });
  }
}
