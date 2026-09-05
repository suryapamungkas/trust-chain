import { NextResponse } from "next/server";
import { deleteExportDocument } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = (await cookies()).get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "umkm") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await deleteExportDocument(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
