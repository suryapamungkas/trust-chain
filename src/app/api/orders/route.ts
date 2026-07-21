import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { getOrders, updateOrderStatus } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const payload = authenticateRequest(req.cookies);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    let orders;
    if (payload.role === "admin") {
      orders = await getOrders({ status });
    } else if (payload.role === "umkm") {
      orders = await getOrders({ sellerUserId: payload.userId, status });
    } else {
      orders = await getOrders({ buyerUserId: payload.userId, status });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = authenticateRequest(req.cookies);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId dan status wajib diisi" }, { status: 400 });
    }

    try {
      await updateOrderStatus(orderId, status, payload.userId);
      return NextResponse.json({ success: true });
    } catch (e) {
      return NextResponse.json({
        error: e instanceof Error ? e.message : "Gagal update status pesanan",
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
