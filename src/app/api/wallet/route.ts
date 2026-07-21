import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getWallet, topUpWallet } from "@/lib/db";

const LIMITS = {
  IDR: { min: 10000, max: 10000000000, label: "Rp" },
  USD: { min: 1, max: 100000, label: "$" },
};

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token invalid" }, { status: 401 });

    const wallet = await getWallet(payload.userId);
    return NextResponse.json(wallet);
  } catch {
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token invalid" }, { status: 401 });

    const { amount, currency } = await req.json();
    const cur = currency === "USD" ? "USD" : "IDR";
    const limit = LIMITS[cur];

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount harus lebih dari 0" }, { status: 400 });
    }
    if (amount < limit.min) {
      return NextResponse.json({ error: `Minimum top-up: ${limit.label} ${limit.min.toLocaleString()}` }, { status: 400 });
    }
    if (amount > limit.max) {
      return NextResponse.json({ error: `Maksimum top-up per transaksi: ${limit.label} ${limit.max.toLocaleString()}` }, { status: 400 });
    }

    const txHash = await topUpWallet(payload.userId, amount, cur);
    return NextResponse.json({ success: true, txHash });
  } catch {
    return NextResponse.json({ error: "Top-up gagal" }, { status: 500 });
  }
}
