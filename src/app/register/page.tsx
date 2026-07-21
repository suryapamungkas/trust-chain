"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const ROLES = [
  { value: "umkm", label: "Pelaku UMKM", icon: "◈", desc: "Daftarkan bisnis lokal Anda ke ekosistem blockchain" },
  { value: "buyer", label: "Buyer / Investor", icon: "⬢", desc: "Temukan peluang investasi UMKM terpercaya" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"umkm" | "buyer" | "">("");
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    businessName: "", companyName: "", province: "", city: "", country: "Indonesia",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const PROVINCES = ["DKI Jakarta","Jawa Barat","Jawa Tengah","Jawa Timur","Bali","Yogyakarta","Aceh","Sumatera Utara","Sumatera Barat","Sumatera Selatan","Sulawesi Selatan","Kalimantan Barat","Kalimantan Timur","Papua","NTB","NTT"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleNext = () => {
    if (!role) { setError("Pilih tipe akun terlebih dahulu."); return; }
    if (!form.name.trim()) { setError("Nama lengkap wajib diisi."); return; }
    if (!form.email.includes("@")) { setError("Format email tidak valid."); return; }
    if (form.password.length < 6) { setError("Password minimal 6 karakter."); return; }
    if (form.password !== form.confirmPassword) { setError("Password tidak cocok."); return; }
    setError(""); setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const result = await register({
      name: form.name, email: form.email, password: form.password,
      role, businessName: form.businessName, companyName: form.companyName,
      province: form.province, city: form.city, country: form.country,
    });
    if (!result.success) { setError(result.error || "Pendaftaran gagal."); setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-bg">
          <div className="auth-grid" />
          <div className="auth-noise" />
        </div>
        <div style={{ position: "relative", zIndex: 10, maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 56, minHeight: 46 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 46, height: 46 }}>
              {mounted && (
                <Image
                  src={theme === "dark" ? "/logo_putih.png" : "/logo_hitam.png"}
                  alt="TrustChain Logo"
                  width={46}
                  height={46}
                  style={{ objectFit: "contain" }}
                  priority
                />
              )}
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>TrustChain UMKM</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Blockchain Ecosystem</div>
            </div>
          </div>

          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 32, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.25, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Bergabung &<br/><span className="gradient-text">Bangun Kepercayaan</span>
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 40 }}>
            Daftarkan bisnis Anda dan dapatkan akses ke ekosistem blockchain yang transparan dan terpercaya.
          </p>

          {/* Steps indicator */}
          {[
            { n: 1, lbl: "Info Akun", desc: "Email, password, tipe akun" },
            { n: 2, lbl: "Detail Profil", desc: "Info bisnis & lokasi" },
            { n: 3, lbl: "Selesai", desc: "Akun siap digunakan" },
          ].map(s => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14, flexShrink: 0,
                background: step >= s.n ? "#ffffff" : "var(--bg-tertiary)",
                color: step >= s.n ? "#000000" : "var(--text-muted)",
                border: step >= s.n ? "none" : "1px solid var(--border-color)",
                boxShadow: step === s.n ? "0 0 16px rgba(255,255,255,0.15)" : "none",
                transition: "all 0.3s ease",
              }}>{s.n > step ? s.n : step > s.n ? "✓" : s.n}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: step >= s.n ? "var(--text-primary)" : "var(--text-muted)" }}>{s.lbl}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
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

        <div style={{ maxWidth: 400, width: "100%", margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6, letterSpacing: "-0.02em" }}>
              {step === 1 ? "Buat Akun Baru" : "Lengkapi Profil"}
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
              Sudah punya akun?{" "}
              <Link href="/login" style={{ color: "var(--text-primary)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>Masuk di sini</Link>
            </p>
          </div>

          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Role selection */}
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Daftar sebagai</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {ROLES.map(r => (
                    <button key={r.value} type="button" onClick={() => { setRole(r.value as "umkm"|"buyer"); setError(""); }}
                      style={{
                        flex: 1, padding: "14px 10px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                        background: role === r.value ? "rgba(255,255,255,0.08)" : "var(--bg-tertiary)",
                        border: `1.5px solid ${role === r.value ? "rgba(255,255,255,0.25)" : "var(--border-color)"}`,
                        transition: "all 0.3s ease",
                      }}>
                      <div style={{ fontSize: 22, marginBottom: 4, color: "var(--text-primary)" }}>{r.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: role === r.value ? "var(--text-primary)" : "var(--text-secondary)" }}>{r.label}</div>
                      <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Lengkap</label>
                <input name="name" value={form.name} onChange={handleChange} className="custom-input" placeholder="Nama lengkap Anda" id="reg-name" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="custom-input" placeholder="email@example.com" id="reg-email" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handleChange} className="custom-input" placeholder="Min. 6 karakter" id="reg-password" style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14, fontFamily: "inherit" }}>
                    {showPass ? "◌" : "◉"}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Konfirmasi Password</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="custom-input" placeholder="Ulangi password" id="reg-confirm-password" />
              </div>
              {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--text-secondary)", fontSize: 13 }}>⚠ {error}</div>}
              <button type="button" onClick={handleNext} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px 0", marginTop: 6 }}>
                Lanjutkan →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {role === "umkm" ? (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Usaha</label>
                    <input name="businessName" value={form.businessName} onChange={handleChange} className="custom-input" placeholder="Contoh: Batik Sekar Jaya" id="reg-business-name" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Provinsi</label>
                    <select name="province" value={form.province} onChange={handleChange} className="custom-select" id="reg-province">
                      <option value="">Pilih Provinsi</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Kota</label>
                    <input name="city" value={form.city} onChange={handleChange} className="custom-input" placeholder="Nama kota/kabupaten" id="reg-city" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Perusahaan</label>
                    <input name="companyName" value={form.companyName} onChange={handleChange} className="custom-input" placeholder="Contoh: PT Investasi Nusantara" id="reg-company-name" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Negara</label>
                    <input name="country" value={form.country} onChange={handleChange} className="custom-input" placeholder="Indonesia" id="reg-country" />
                  </div>
                </>
              )}

              {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--text-secondary)", fontSize: 13 }}>⚠ {error}</div>}

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>← Kembali</button>
                <button type="submit" disabled={loading} className="btn-primary" id="reg-submit" style={{ flex: 2, justifyContent: "center" }}>
                  {loading ? "Mendaftarkan..." : "Buat Akun →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
