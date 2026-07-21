import { NextResponse } from "next/server";
import { addTrackingEvent, getDb, RowDataPacket } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token invalid" }, { status: 401 });

    const { transactionId } = await req.json();
    if (!transactionId) return NextResponse.json({ error: "transactionId is required" }, { status: 400 });

    const pool = await getDb();
    
    // Check if tracking events already exist for this transaction to avoid duplicates
    const [existing] = await pool.query<RowDataPacket[]>("SELECT count(*) as cnt FROM supply_chain_tracking WHERE transaction_id = ?", [transactionId]);
    if (existing[0].cnt > 0) {
      return NextResponse.json({ error: "Tracking already simulated for this transaction" }, { status: 400 });
    }

    // Update transaction status to confirmed if it was pending
    await pool.query("UPDATE transactions SET status = 'confirmed' WHERE id = ?", [transactionId]);

    // Generate mock logistic events
    const events = [
      { status: "Pesanan Dibuat", location: "Sistem TrustChain" },
      { status: "Pesanan Diproses", location: "Gudang UMKM" },
      { status: "Dikemas", location: "Fasilitas Pengemasan" },
      { status: "Diserahkan ke Kurir", location: "Hub Logistik Lokal" },
      { status: "Sedang Dikirim (In Transit)", location: "Pusat Transit Utama" },
      { status: "Pesanan Diterima", location: "Alamat Pembeli" }
    ];

    for (let i = 0; i < events.length; i++) {
      // Simulate delay for created_at slightly so they order correctly
      const event = events[i];
      await addTrackingEvent(transactionId, event.status, event.location, payload.userId);
      
      // We manually adjust the timestamp in DB to simulate a timeline
      await pool.query(
        "UPDATE supply_chain_tracking SET created_at = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE transaction_id = ? AND status = ?",
        [i * 15, transactionId, event.status]
      );
    }

    return NextResponse.json({ success: true, message: "Simulated 6 tracking events" });
  } catch (error) {
    console.error("Tracking Simulate API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
