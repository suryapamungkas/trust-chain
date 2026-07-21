"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Password tidak cocok");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mereset password");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Gagal terhubung ke server");
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
  const inputBg = isDark ? "#111" : "#f5f5f5";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: bg, fontFamily: "'Inter', sans-serif", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 420, background: cardBg,
        border: `1px solid ${borderColor}`, borderRadius: 16, padding: 40,
      }}>
        <Link href="/login" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: textSecondary, textDecoration: "none", fontSize: 13, marginBottom: 24,
        }}>
          <ArrowLeft size={14} /> Kembali ke Login
        </Link>

        {!token ? (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: textPrimary, marginBottom: 12 }}>
              Token Tidak Valid
            </h1>
            <p style={{ fontSize: 14, color: textSecondary, marginBottom: 24 }}>
              Link reset password tidak valid atau sudah kedaluwarsa.
            </p>
            <Link href="/forgot-password" style={{
              display: "inline-block", padding: "12px 28px", borderRadius: 8,
              background: textPrimary, color: isDark ? "#000" : "#fff",
              textDecoration: "none", fontSize: 14, fontWeight: 600,
            }}>
              Minta Link Baru
            </Link>
          </div>
        ) : success ? (
          <div style={{ textAlign: "center" }}>
            <CheckCircle size={48} color={textPrimary} style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>
              Password Berhasil Direset
            </h2>
            <p style={{ fontSize: 13, color: textSecondary, marginBottom: 24 }}>
              Silakan login dengan password baru Anda.
            </p>
            <Link href="/login" style={{
              display: "inline-block", padding: "12px 28px", borderRadius: 8,
              background: textPrimary, color: isDark ? "#000" : "#fff",
              textDecoration: "none", fontSize: 14, fontWeight: 600,
            }}>
              Login
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: textPrimary, marginBottom: 8 }}>
              Reset Password
            </h1>
            <p style={{ fontSize: 14, color: textSecondary, marginBottom: 28 }}>
              Masukkan password baru Anda.
            </p>
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
                Password Baru
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: inputBg, border: `1px solid ${borderColor}`, borderRadius: 8,
                padding: "0 12px", marginBottom: 16,
              }}>
                <Lock size={16} color={textSecondary} />
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter" required minLength={8}
                  style={{
                    flex: 1, padding: "12px 0", background: "transparent", border: "none",
                    outline: "none", color: textPrimary, fontSize: 14,
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  background: "none", border: "none", cursor: "pointer", color: textSecondary, padding: 4,
                }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: textSecondary }}>
                Konfirmasi Password
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: inputBg, border: `1px solid ${borderColor}`, borderRadius: 8,
                padding: "0 12px", marginBottom: 24,
              }}>
                <Lock size={16} color={textSecondary} />
                <input
                  type={showPassword ? "text" : "password"} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Ulangi password baru" required minLength={8}
                  style={{
                    flex: 1, padding: "12px 0", background: "transparent", border: "none",
                    outline: "none", color: textPrimary, fontSize: 14,
                  }}
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "13px", borderRadius: 8, border: "none",
                background: textPrimary, color: isDark ? "#000" : "#fff",
                fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {loading && <Loader2 size={16} className="tc-spin-icon" />}
                {loading ? "Mereset..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`
        .tc-spin-icon { animation: tc-spin 0.8s linear infinite; }
        @keyframes tc-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-primary, #000)" }} />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
