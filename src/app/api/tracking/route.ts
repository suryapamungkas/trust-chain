import { NextResponse } from "next/server";
import { addTrackingEvent, getDb, getTrackingEvents, calculateReliabilityScore, RowDataPacket } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txId = searchParams.get("transactionId");
    
    if (!txId) {
      const allEvents = await getTrackingEvents();
      return NextResponse.json(allEvents);
    }

    const events = await getTrackingEvents(Number(txId));
    return NextResponse.json(events);
  } catch (error) {
    console.error("Tracking API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token invalid" }, { status: 401 });

    const { transactionId, status, location } = await req.json();
    if (!transactionId || !status || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Role-based validation
    if (payload.role === "umkm") {
      if (status !== "Pesanan Diproses" && status !== "Dikemas") {
        return NextResponse.json({ error: "UMKM hanya dapat melakukan aksi Pesanan Diproses atau Dikemas" }, { status: 403 });
      }
    } else if (payload.role === "buyer") {
      if (status !== "Pesanan Diterima") {
        return NextResponse.json({ error: "Buyer hanya dapat menekan Pesanan Diterima" }, { status: 403 });
      }
    }

    const pool = await getDb();
    
    // Check if this is the first update
    const [existing] = await pool.query<RowDataPacket[]>("SELECT count(*) as cnt FROM supply_chain_tracking WHERE transaction_id = ?", [transactionId]);
    
    if (existing[0].cnt === 0) {
      // First update, set transaction status to confirmed
      await pool.query("UPDATE transactions SET status = 'confirmed' WHERE id = ?", [transactionId]);
    }

    const result = await addTrackingEvent(transactionId, status, location, payload.userId);

    // Update dynamic reliability score asynchronously
    try {
      const [txInfo] = await pool.query<RowDataPacket[]>(
        "SELECT p.umkm_profile_id FROM transactions t JOIN products p ON t.product_id = p.id WHERE t.id = ?",
        [transactionId]
      );
      if (txInfo && txInfo[0]?.umkm_profile_id) {
        calculateReliabilityScore(txInfo[0].umkm_profile_id).catch(() => {});
      }
    } catch {}

    return NextResponse.json({ success: true, tracking: result });
  } catch (error) {
    console.error("Tracking API POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
