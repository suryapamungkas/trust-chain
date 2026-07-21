import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getTransactions } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    const payload = token ? verifyToken(token) : null;

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const global = url.searchParams.get("global") === "true";

    // Admin sees all transactions, global query sees all, other roles see only their own
    const userId = (payload?.role === "admin" || global) ? undefined : payload?.userId;

    const transactions = await getTransactions({
      userId,
      limit,
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
