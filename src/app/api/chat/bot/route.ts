import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Fitur chatbot telah dinonaktifkan." }, { status: 404 });
}
