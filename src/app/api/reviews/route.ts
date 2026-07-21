import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { getProductReviews, createReview, getProductAverageRating } from "@/lib/db";
import { createReviewSchema, validateBody } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = parseInt(searchParams.get("productId") || "0");
    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

    const reviews = await getProductReviews(productId);
    const rating = await getProductAverageRating(productId);

    return NextResponse.json({ reviews, ...rating });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = authenticateRequest(req.cookies);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = validateBody(createReviewSchema, body);
    if (!validation.success) return validation.response;

    const { productId, rating, comment } = validation.data;

    try {
      const reviewId = await createReview(payload.userId, productId, rating, comment);
      return NextResponse.json({ success: true, reviewId });
    } catch (e) {
      return NextResponse.json({
        error: e instanceof Error ? e.message : "Gagal membuat review",
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
