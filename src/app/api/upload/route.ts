import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const ext = file.name.split('.').pop();
    const filename = `${crypto.randomBytes(8).toString("hex")}.${ext}`;
    const publicDir = path.join(process.cwd(), "public", "uploads");

    // Ensure directory exists
    await fs.mkdir(publicDir, { recursive: true });

    // Write file
    const filePath = path.join(publicDir, filename);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, url: `/api/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
