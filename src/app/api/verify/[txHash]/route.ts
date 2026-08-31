import { NextRequest, NextResponse } from "next/server";
import { getTransactionByHash, getTrackingEvents, RowDataPacket } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ txHash: string }> }
) {
  try {
    const { txHash } = await params;
    if (!txHash || txHash.length < 10) {
      return NextResponse.json({ error: "Invalid transaction hash" }, { status: 400 });
    }

    const transaction = await getTransactionByHash(txHash);
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Get supply chain tracking events
    let trackingEvents: RowDataPacket[] = [];
    try {
      trackingEvents = (await getTrackingEvents(Number(transaction.id))) as RowDataPacket[];
    } catch {
      trackingEvents = [];
    }

    // Parse certifications safely
    let productCerts: string[] = [];
    try { productCerts = JSON.parse(String(transaction.product_certifications || "[]")); } catch { productCerts = []; }
    let umkmCerts: string[] = [];
    try { umkmCerts = JSON.parse(String(transaction.umkm_certifications || "[]")); } catch { umkmCerts = []; }

    return NextResponse.json({
      verified: true,
      transaction: {
        txHash: txHash || transaction.tx_hash,
        blockNumber: transaction.block_number,
        timestamp: transaction.created_at,
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        from: {
          name: transaction.from_name,
          wallet: transaction.from_wallet,
        },
        to: {
          name: transaction.to_name,
          wallet: transaction.to_wallet,
        },
      },
      product: transaction.product_name ? {
        name: transaction.product_name,
        category: transaction.product_category,
        image: transaction.product_image,
        certifications: productCerts,
      } : null,
      umkm: transaction.umkm_name ? {
        name: transaction.umkm_name,
        verificationStatus: transaction.umkm_status,
        certifications: umkmCerts,
      } : null,
      supplyChain: trackingEvents.map((e) => ({
        id: e.id,
        status: e.status,
        location: e.location,
        txHash: e.tx_hash,
        timestamp: e.created_at,
        updatedBy: e.updated_by_name,
      })),
      platform: {
        name: "TrustChain UMKM",
        network: "Local Ledger",
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
