"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary, #000)",
      color: "var(--text-primary, #f5f5f5)",
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
      padding: "24px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{
          width: 80, height: 80, margin: "0 auto 24px",
          borderRadius: "50%",
          border: "2px solid var(--border-color, rgba(255,255,255,0.1))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36,
        }}>
          ⚠
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
          Terjadi Kesalahan
        </h1>
        <p style={{
          fontSize: 14, color: "var(--text-secondary, #999)", lineHeight: 1.7,
          marginBottom: 32,
        }}>
          Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu dan sedang menanganinya.
        </p>
        {process.env.NODE_ENV === "development" && error?.message && (
          <pre style={{
            background: "var(--bg-tertiary, #141414)",
            border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
            borderRadius: 8, padding: 16, marginBottom: 24,
            fontSize: 12, textAlign: "left", overflow: "auto",
            color: "var(--text-secondary, #999)",
            maxHeight: 200,
          }}>
            {error.message}
          </pre>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "12px 28px", borderRadius: 8,
              background: "var(--text-primary, #f5f5f5)",
              color: "var(--text-inverse, #000)",
              border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 600,
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => { (e.target as HTMLButtonElement).style.opacity = "0.85"; }}
            onMouseOut={(e) => { (e.target as HTMLButtonElement).style.opacity = "1"; }}
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            style={{
              padding: "12px 28px", borderRadius: 8,
              background: "transparent",
              color: "var(--text-secondary, #999)",
              border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
              textDecoration: "none",
              fontSize: 14, fontWeight: 500,
              transition: "border-color 0.2s",
            }}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
