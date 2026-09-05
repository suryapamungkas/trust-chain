"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, ArrowLeft, Loader2, CheckCircle, Copy, Globe } from "lucide-react";

export default function ForgotPasswordPage() {
  const { theme } = useTheme();
  const { lang, setLang } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (lang === "id" ? "Gagal mengirim permintaan" : "Failed to send request"));
        return;
      }
      setSent(true);
      if (data._demo_reset_url) {
        setResetUrl(data._demo_reset_url);
      }
    } catch {
      setError(lang === "id" ? "Gagal terhubung ke server" : "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";
  const bg = isDark ? "#000" : "#fafafa";
  const cardBg = isDark ? "#0a0a0a" : "#fff";
  const textPrimary = isDark ? "#f5f5f5" : "#0a0a0a";
  const textSecondary = isDark ? "#999" : "#555";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: bg, fontFamily: "'Inter', sans-serif", padding: 24, position: "relative"
    }}>
      <div style={{ position: "absolute", top: 20, right: 24 }}>
        <button
          onClick={() => setLang(lang === "id" ? "en" : "id")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px",
            borderRadius: 8, background: isDark ? "#111" : "#eee", border: `1px solid ${borderColor}`,
            color: textPrimary, cursor: "pointer", fontSize: 12, fontWeight: 600
          }}
        >
          <Globe size={14} /> {lang === "id" ? "EN" : "ID"}
        </button>
      </div>
      <div style={{
        width: "100%", maxWidth: 420, background: cardBg,
        border: `1px solid ${borderColor}`, borderRadius: 16, padding: 40,
      }}>
        <Link href="/login" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: textSecondary, textDecoration: "none", fontSize: 13, marginBottom: 24,
        }}>
          <ArrowLeft size={14} /> {lang === "id" ? "Kembali ke Login" : "Back to Login"}
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: textPrimary, marginBottom: 8 }}>
          {lang === "id" ? "Lupa Password" : "Forgot Password"}
        </h1>
        <p style={{ fontSize: 14, color: textSecondary, marginBottom: 28, lineHeight: 1.6 }}>
          {lang === "id"
            ? "Masukkan email Anda dan kami akan mengirimkan link untuk mereset password."
            : "Enter your registered email and we will send you a password reset link."}
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 16,
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                color: textSecondary, fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: textSecondary }}>
              Email
            </label>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: isDark ? "#111" : "#f5f5f5",
              border: `1px solid ${borderColor}`, borderRadius: 8, padding: "0 12px", marginBottom: 20,
            }}>
              <Mail size={16} color={textSecondary} />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com" required
                style={{
                  flex: 1, padding: "12px 0", background: "transparent", border: "none", outline: "none",
                  color: textPrimary, fontSize: 14,
                }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "13px", borderRadius: 8, border: "none",
                background: textPrimary, color: isDark ? "#000" : "#fff",
                fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading && <Loader2 size={16} className="tc-spin-icon" />}
              {loading ? (lang === "id" ? "Mengirim..." : "Sending...") : (lang === "id" ? "Kirim Link Reset" : "Send Reset Link")}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center" }}>
            <CheckCircle size={48} color={textPrimary} style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>
              {lang === "id" ? "Email Terkirim" : "Email Sent"}
            </h2>
            <p style={{ fontSize: 13, color: textSecondary, marginBottom: 24, lineHeight: 1.6 }}>
              {lang === "id"
                ? "Jika email terdaftar, Anda akan menerima link reset password."
                : "If this email is registered, you will receive a password reset link shortly."}
            </p>
            {resetUrl && (
              <div style={{
                background: isDark ? "#111" : "#f5f5f5",
                border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16, marginBottom: 20,
                textAlign: "left",
              }}>
                <div style={{ fontSize: 11, color: textSecondary, marginBottom: 8, fontWeight: 600 }}>
                  🧪 Demo Mode — Link Reset:
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link href={resetUrl} style={{
                    flex: 1, fontSize: 12, color: textPrimary, wordBreak: "break-all",
                  }}>
                    {resetUrl}
                  </Link>
                  <button
                    onClick={() => navigator.clipboard.writeText(window.location.origin + resetUrl)}
                    style={{
                      padding: 6, borderRadius: 6, border: `1px solid ${borderColor}`,
                      background: "transparent", cursor: "pointer", color: textSecondary,
                    }}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}
            <Link href="/login" style={{
              display: "inline-block", padding: "12px 28px", borderRadius: 8,
              background: textPrimary, color: isDark ? "#000" : "#fff",
              textDecoration: "none", fontSize: 14, fontWeight: 600,
            }}>
              {lang === "id" ? "Kembali ke Login" : "Back to Login"}
            </Link>
          </div>
        )}
      </div>
      <style>{`
        .tc-spin-icon { animation: tc-spin 0.8s linear infinite; }
        @keyframes tc-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
