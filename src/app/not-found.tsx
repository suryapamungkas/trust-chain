import Link from "next/link";

export default function NotFound() {
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
          fontSize: 80, fontWeight: 900, letterSpacing: "-0.04em",
          marginBottom: 8,
          background: "linear-gradient(180deg, var(--text-primary, #f5f5f5) 0%, var(--text-muted, #555) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          404
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.01em" }}>
          Halaman Tidak Ditemukan
        </h1>
        <p style={{
          fontSize: 14, color: "var(--text-secondary, #999)", lineHeight: 1.7,
          marginBottom: 32,
        }}>
          Halaman yang Anda cari tidak ada atau telah dipindahkan. Periksa kembali URL atau kembali ke beranda.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              padding: "12px 28px", borderRadius: 8,
              background: "var(--text-primary, #f5f5f5)",
              color: "var(--text-inverse, #000)",
              textDecoration: "none",
              fontSize: 14, fontWeight: 600,
            }}
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/login"
            style={{
              padding: "12px 28px", borderRadius: 8,
              background: "transparent",
              color: "var(--text-secondary, #999)",
              border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
              textDecoration: "none",
              fontSize: 14, fontWeight: 500,
            }}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
