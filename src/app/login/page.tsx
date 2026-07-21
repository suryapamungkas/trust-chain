"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@trustchain.id", password: "admin123", icon: "⬡", role: "Super Admin" },
  { label: "UMKM", email: "siti@herbalindo.id", password: "umkm123", icon: "◈", role: "HERBALINDO FARMA" },
  { label: "Buyer", email: "investor@nusantarasehat.co.id", password: "buyer123", icon: "⬢", role: "PT Investasi Nusantara" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);

   
  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true); 
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Login gagal.");
      setLoading(false);
    }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  };

  return (
    <div className="auth-page">
      {/* Left Panel — Brand Hero */}
      <div className="auth-left">
        <div className="auth-left-bg">
          <div className="auth-grid" />
          <div className="auth-noise" />
        </div>
        
        <div style={{ position: "relative", zIndex: 10, maxWidth: 480 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48, minHeight: 48 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48
            }}>
              {mounted && (
                <Image
                  src={theme === "dark" ? "/logo_putih.png" : "/logo_hitam.png"}
                  alt="TrustChain Logo"
                  width={48}
                  height={48}
                  style={{ objectFit: "contain" }}
                  priority
                />
              )}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
                TrustChain
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>UMKM Ecosystem</div>
            </div>
          </div>

          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 34, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Ekosistem Blockchain<br/>
            <span className="gradient-text">Untuk UMKM Indonesia</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 48 }}>
            Transparansi rantai pasokan, sertifikasi digital, dan akses pasar global melalui teknologi AI & Blockchain.
          </p>

          
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="auth-right" style={{ position: "relative" }}>
        {/* Back button */}
        <div style={{ position: "absolute", top: 20, left: 24 }}>
          {mounted && (
            <Link
              href="/"
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
            >
              ← {lang === "id" ? "Kembali ke Beranda" : "Back to Home"}
            </Link>
          )}
        </div>

        {/* Theme & Language toggle */}
        <div style={{ position: "absolute", top: 20, right: 24, display: "flex", gap: 8 }}>
          {mounted && (
            <>
              <button
                onClick={() => setLang(lang === "id" ? "en" : "id")}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "var(--bg-tertiary)", border: "1px solid var(--border-color)",
                  color: "var(--text-primary)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
                  transition: "all 0.3s ease",
                }}
                title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
              >
                <Globe size={18} />
              </button>
              <button
                onClick={toggleTheme}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "var(--bg-tertiary)", border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  transition: "all 0.3s ease",
                }}
                aria-label="Toggle theme"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </>
          )}
        </div>

        <div style={{ maxWidth: 380, width: "100%", margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6, letterSpacing: "-0.02em" }}>
              {t("auth.login_title")}
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              {t("auth.no_account")}{" "}
              <Link href="/register" style={{ color: "var(--text-primary)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
                {t("auth.register")}
              </Link>
            </p>
          </div>

          {/* Demo Accounts */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Akun Demo
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  onClick={() => fillDemo(acc)}
                  style={{
                    flex: 1, padding: "10px 8px", borderRadius: 10, cursor: "pointer",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
                    color: "var(--text-primary)", fontSize: 12, fontWeight: 600, textAlign: "center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.20)"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.10)"; }}
                >
                  <div style={{ fontSize: 20, marginBottom: 2, color: "var(--text-secondary)" }}>{acc.icon}</div>
                  <div>{acc.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.5, marginTop: 1 }}>{acc.role}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>atau masuk manual</span>
            <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="custom-input"
                placeholder="email@example.com"
                required
                autoComplete="email"
                id="login-email"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="custom-input"
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                  id="login-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", fontSize: 14, fontFamily: "inherit",
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? "◌" : "◉"}
                </button>
              </div>
            </div>

            <div style={{ textAlign: "right", marginTop: -8 }}>
              <Link href="/forgot-password" style={{
                fontSize: 12.5, color: "var(--text-secondary)", textDecoration: "none",
                fontWeight: 500, transition: "color 0.2s",
              }}>
                Lupa password?
              </Link>
            </div>
            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 10,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
                color: "var(--text-secondary)", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              id="login-submit"
              style={{ width: "100%", justifyContent: "center", marginTop: 4, padding: "13px 0" }}
            >
              {loading ? (
                <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Memproses...</>
              ) : (
                <>Masuk ke Dashboard →</>
              )}
            </button>
          </form>

          <div style={{ marginTop: 28, padding: "16px", borderRadius: 12, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text-secondary)" }}>Password Demo:</strong><br/>
              Admin: <code style={{ color: "var(--text-primary)" }}>admin123</code> | 
              UMKM: <code style={{ color: "var(--text-primary)" }}>umkm123</code> | 
              Buyer: <code style={{ color: "var(--text-primary)" }}>buyer123</code>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
