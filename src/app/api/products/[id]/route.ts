import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getProductById, updateProduct, deleteProduct } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await getProductById(parseInt(id));
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token invalid" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    
    // Map camelCase to snake_case for the database update
    if (body.imageUrl !== undefined) body.image_url = body.imageUrl;
    if (body.priceIdr !== undefined) body.price_idr = body.priceIdr;
    if (body.priceUsd !== undefined) body.price_usd = body.priceUsd;

    await updateProduct(parseInt(id), body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token invalid" }, { status: 401 });

    const { id } = await params;
    if (payload.role === "admin") {
      await deleteProduct(parseInt(id));
    } else {
      await updateProduct(parseInt(id), { status: 'delete_pending' });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
