import { NextRequest, NextResponse } from "next/server";
import { hashProductData, verifySignature, getPlatformInfo, executeSmartContract } from "@/lib/blockchain";

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    switch (action) {
      case "hash_product": {
        const result = await hashProductData(data);
        return NextResponse.json({ success: true, result });
      }
      case "verify_signature": {
        const verified = verifySignature(data.message, data.signature);
        return NextResponse.json({ success: true, verified });
      }
      case "execute_contract": {
        const result = await executeSmartContract(data.contractType, data.params);
        return NextResponse.json({ success: true, result });
      }
      case "platform_info": {
        const info = getPlatformInfo();
        return NextResponse.json({ success: true, info });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Blockchain API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const info = getPlatformInfo();
    return NextResponse.json({ success: true, ...info });
  } catch (error) {
    console.error("Blockchain info error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
