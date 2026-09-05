import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const resolvedParams = await params;
    const filePath = path.join(process.cwd(), "public", "uploads", resolvedParams.filename);
    const data = await fs.readFile(filePath);
    
    const ext = resolvedParams.filename.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'gif') mimeType = 'image/gif';
    else if (ext === 'webp') mimeType = 'image/webp';
    else if (ext === 'svg') mimeType = 'image/svg+xml';
    else if (ext === 'pdf') mimeType = 'application/pdf';

    return new NextResponse(data, {
      headers: { 'Content-Type': mimeType },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
