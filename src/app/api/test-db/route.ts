import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "trustchain_umkm",
    });

    const [rows] = await connection.query("SHOW TABLES;");
    await connection.end();

    return NextResponse.json({
      success: true,
      env: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        db: process.env.DB_NAME,
        hasPassword: !!process.env.DB_PASSWORD,
      },
      tables: rows,
    });
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    return NextResponse.json({
      success: false,
      error: err.message || "Unknown error",
      code: err.code,
      env: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        db: process.env.DB_NAME,
        hasPassword: !!process.env.DB_PASSWORD,
      }
    }, { status: 500 });
  }
}
