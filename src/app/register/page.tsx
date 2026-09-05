"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
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
    if (!role) { 
      setError(lang === "id" ? "Pilih tipe akun terlebih dahulu." : "Please select an account role first."); 
      return; 
    }
    if (!form.name.trim()) { 
      setError(lang === "id" ? "Nama lengkap wajib diisi." : "Full name is required."); 
      return; 
    }
    if (!form.email.includes("@")) { 
      setError(lang === "id" ? "Format email tidak valid." : "Invalid email address format."); 
      return; 
    }
    if (form.password.length < 6) { 
      setError(lang === "id" ? "Password minimal 6 karakter." : "Password must be at least 6 characters."); 
      return; 
    }
    if (form.password !== form.confirmPassword) { 
      setError(lang === "id" ? "Password tidak cocok." : "Passwords do not match."); 
      return; 
    }
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
    if (!result.success) { setError(result.error || (lang === "id" ? "Pendaftaran gagal." : "Registration failed.")); setLoading(false); }
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
            {lang === "id" ? (
              <>Bergabung &<br/><span className="gradient-text">Bangun Kepercayaan</span></>
            ) : (
              <>Join &<br/><span className="gradient-text">Build Proven Trust</span></>
            )}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 40 }}>
            {lang === "id"
              ? "Daftarkan bisnis Anda dan dapatkan akses ke ekosistem blockchain yang transparan dan terpercaya."
              : "Register your enterprise and unlock access to an immutable, globally verified trade ecosystem."}
          </p>

          {/* Steps indicator */}
          {[
            { n: 1, lbl: lang === "id" ? "Info Akun" : "Account Info", desc: lang === "id" ? "Email, password, tipe akun" : "Email, password, role" },
            { n: 2, lbl: lang === "id" ? "Detail Profil" : "Profile Details", desc: lang === "id" ? "Info bisnis & lokasi" : "Business & location" },
            { n: 3, lbl: lang === "id" ? "Selesai" : "Complete", desc: lang === "id" ? "Akun siap digunakan" : "Ready for use" },
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
              ← {t("auth.back_home")}
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
              {step === 1 ? t("auth.register_title") : (lang === "id" ? "Lengkapi Profil" : "Complete Profile")}
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
              {t("auth.has_account")}{" "}
              <Link href="/login" style={{ color: "var(--text-primary)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>{t("auth.login")}</Link>
            </p>
          </div>

          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Role selection */}
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {lang === "id" ? "Daftar sebagai" : "Register as"}
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { value: "umkm", label: t("auth.role_umkm"), icon: "◈", desc: t("auth.role_umkm_desc") },
                    { value: "buyer", label: t("auth.role_buyer"), icon: "⬢", desc: t("auth.role_buyer_desc") },
                  ].map(r => (
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
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{t("auth.name")}</label>
                <input name="name" value={form.name} onChange={handleChange} className="custom-input" placeholder={lang === "id" ? "Nama lengkap Anda" : "Your full name"} id="reg-name" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{t("auth.email")}</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="custom-input" placeholder="email@example.com" id="reg-email" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{t("auth.password")}</label>
                <div style={{ position: "relative" }}>
                  <input name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handleChange} className="custom-input" placeholder={lang === "id" ? "Min. 6 karakter" : "Min. 6 characters"} id="reg-password" style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14, fontFamily: "inherit" }}>
                    {showPass ? "◌" : "◉"}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{t("auth.confirm_password")}</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="custom-input" placeholder={lang === "id" ? "Ulangi password" : "Re-enter password"} id="reg-confirm-password" />
              </div>
              {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--text-secondary)", fontSize: 13 }}>⚠ {error}</div>}
              <button type="button" onClick={handleNext} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px 0", marginTop: 6 }}>
                {lang === "id" ? "Lanjutkan →" : "Continue →"}
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {role === "umkm" ? (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{t("auth.business_name")}</label>
                    <input name="businessName" value={form.businessName} onChange={handleChange} className="custom-input" placeholder="Contoh: Batik Sekar Jaya" id="reg-business-name" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{t("auth.province")}</label>
                    <select name="province" value={form.province} onChange={handleChange} className="custom-select" id="reg-province">
                      <option value="">{lang === "id" ? "Pilih Provinsi" : "Select Province"}</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{t("auth.city")}</label>
                    <input name="city" value={form.city} onChange={handleChange} className="custom-input" placeholder={lang === "id" ? "Nama kota/kabupaten" : "City or Regency name"} id="reg-city" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{t("auth.company_name")}</label>
                    <input name="companyName" value={form.companyName} onChange={handleChange} className="custom-input" placeholder="Contoh: PT Investasi Nusantara" id="reg-company-name" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{t("auth.country")}</label>
                    <input name="country" value={form.country} onChange={handleChange} className="custom-input" placeholder="Indonesia" id="reg-country" />
                  </div>
                </>
              )}

              {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--text-secondary)", fontSize: 13 }}>⚠ {error}</div>}

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>← {t("common.back")}</button>
                <button type="submit" disabled={loading} className="btn-primary" id="reg-submit" style={{ flex: 2, justifyContent: "center" }}>
                  {loading ? t("common.loading") : (lang === "id" ? "Buat Akun →" : "Create Account →")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
