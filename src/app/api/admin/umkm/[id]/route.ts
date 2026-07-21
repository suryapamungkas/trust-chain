import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { updateUmkmProfile } from "@/lib/db";
import { adminUpdateUmkmSchema, validateBody } from "@/lib/validation";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = authenticateRequest(req.cookies);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const validation = validateBody(adminUpdateUmkmSchema, body);
    if (!validation.success) return validation.response;

    await updateUmkmProfile(parseInt(id), validation.data, true);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin UMKM PUT error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
