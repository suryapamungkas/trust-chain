import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { getExportData } from "@/lib/db";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req, "export", RATE_LIMITS.export);
    if (rateLimited) return rateLimited;

    const payload = authenticateRequest(req.cookies);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "transactions";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const data = await getExportData(type, { startDate, endDate });

    if (data.length === 0) {
      return NextResponse.json({ error: "Tidak ada data untuk di-export" }, { status: 404 });
    }

    // Convert to CSV
    const headers = Object.keys(data[0] as Record<string, unknown>);
    const csvRows = [
      headers.join(","),
      ...data.map((row: Record<string, unknown>) =>
        headers.map((h) => {
          const val = row[h];
          const str = val === null || val === undefined ? "" : String(val);
          // Escape commas and quotes
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(",")
      ),
    ];

    const csv = csvRows.join("\n");
    const filename = `trustchain_${type}_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
