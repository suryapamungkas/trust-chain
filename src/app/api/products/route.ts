import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getProducts, createProduct, getUmkmProfileByUserId } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const umkmProfileId = url.searchParams.get("umkmProfileId");
    const limit = parseInt(url.searchParams.get("limit") || "100");

    let status = url.searchParams.get("status") || undefined;

    const token = req.cookies.get("tc_token")?.value;
    const payload = token ? verifyToken(token) : null;

    const global = url.searchParams.get("global") === "true";

    let finalUmkmProfileId = umkmProfileId ? parseInt(umkmProfileId) : undefined;

    if (payload?.role === "admin") {
      // Admin sees all unless specified
    } else if (payload?.role === "umkm" && !global) {
      // UMKM sees their own products (all statuses) unless global is set
      if (!finalUmkmProfileId) {
        const umkmProfile = await getUmkmProfileByUserId(payload.userId);
        if (umkmProfile) finalUmkmProfileId = umkmProfile.id;
      }
    } else {
      // Public / buyers only see active products
      status = "active";
    }

    const products = await getProducts({
      category,
      search,
      status,
      umkmProfileId: finalUmkmProfileId,
      limit,
    });

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "umkm") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const profile = await getUmkmProfileByUserId(payload.userId);
    if (!profile) return NextResponse.json({ error: "UMKM profile not found" }, { status: 404 });

    const body = await req.json();
    const id = await createProduct({
      umkmProfileId: profile.id,
      name: body.name,
      category: body.category || "Jamu",
      description: body.description || "",
      priceIdr: body.priceIdr || 0,
      priceUsd: body.priceUsd || 0,
      stock: body.stock || 0,
      unit: body.unit || "pcs",
      imageUrl: body.imageUrl,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
