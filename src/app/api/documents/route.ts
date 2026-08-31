import { NextResponse } from "next/server";
import { getExportDocuments, createExportDocument, getUmkmProfileByUserId } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const token = (await cookies()).get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    let docs: unknown[] = [];
    if (payload.role === "admin") {
      docs = await getExportDocuments();
    } else if (payload.role === "umkm") {
      const profile = await getUmkmProfileByUserId(payload.userId);
      if (profile) {
        docs = await getExportDocuments(Number(profile.id));
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    return NextResponse.json(docs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "umkm") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const profile = await getUmkmProfileByUserId(payload.userId);
    if (!profile) return NextResponse.json({ error: "Profil UMKM tidak ditemukan" }, { status: 404 });

    const body = await req.json();
    const { documentType, fileUrl } = body;
    if (!documentType || !fileUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const id = await createExportDocument({
      umkm_profile_id: Number(profile.id),
      document_type: documentType,
      file_url: fileUrl
    });

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
