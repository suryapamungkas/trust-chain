"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Globe, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

interface VerificationData {
  verified: boolean;
  transaction: {
    txHash: string;
    blockNumber: number;
    timestamp: string;
    type: string;
    status: string;
    amount: number;
    currency: string;
    description: string;
    from: { name: string; wallet: string };
    to: { name: string; wallet: string };
  };
  product: { name: string; category: string; image: string; certifications: string[] } | null;
  umkm: { name: string; verificationStatus: string; certifications: string[] } | null;
  supplyChain: { id: number; status: string; location: string; txHash: string; timestamp: string; updatedBy: string }[];
  platform: { name: string; network: string; verifiedAt: string };
}

export default function VerifyPage() {
  const params = useParams();
  const txHash = params?.txHash as string;
  const { lang, setLang, t, formatCurrency, formatDate } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!txHash) return;
    fetch(`/api/verify/${txHash}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError(lang === "id" ? "Gagal memverifikasi transaksi" : "Failed to verify transaction"))
      .finally(() => setLoading(false));
  }, [txHash, lang]);

  const formatHash = (h: string) => h && h.length > 18 ? `${h.slice(0, 10)}...${h.slice(-8)}` : h;

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "var(--bg-primary, #0a0a0f)",
    color: "var(--text-primary, #e5e7eb)",
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    padding: "30px 20px 60px",
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--bg-card, rgba(255,255,255,0.04))",
    border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
    borderRadius: 18,
    padding: "26px",
    marginBottom: 20,
    backdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
  };

  if (loading) {
    return (
      <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Image src="/logo_putih.png" alt="TrustChain" width={48} height={48} style={{ objectFit: "contain", margin: "0 auto 16px", animation: "pulse 1.5s infinite" }} unoptimized />
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-secondary, #9ca3af)" }}>
            {lang === "id" ? "Memverifikasi transaksi blockchain..." : "Verifying blockchain transaction..."}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted, #6b7280)", marginTop: 8, fontFamily: "monospace" }}>{formatHash(txHash)}</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...cardStyle, maxWidth: 520, textAlign: "center", padding: "40px 24px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28, color: "#ef4444" }}>✗</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "var(--text-primary, #fff)" }}>
            {lang === "id" ? "Transaksi Tidak Ditemukan" : "Transaction Not Found"}
          </h1>
          <p style={{ color: "var(--text-secondary, #9ca3af)", marginBottom: 20, fontSize: 14 }}>
            {error || (lang === "id" ? "Hash transaksi tidak valid atau belum terdaftar di blockchain TrustChain." : "Invalid transaction hash or unrecorded on TrustChain ledger.")}
          </p>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-primary, #ffffff)", fontWeight: 600, wordBreak: "break-all", padding: "14px", background: "var(--bg-tertiary, rgba(0,0,0,0.3))", borderRadius: 10, border: "1px solid var(--border-color, rgba(255,255,255,0.15))" }}>{txHash}</div>
          <div style={{ marginTop: 24 }}>
            <Link href="/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              ← {t("verify.back_to_home")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tx = data.transaction;

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        {/* Top actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
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
            }}
          >
            <ArrowLeft size={16} /> {t("verify.back_to_home")}
          </Link>
          {mounted && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setLang(lang === "id" ? "en" : "id")}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                }}
                title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
              >
                <Globe size={16} />
              </button>
              <button onClick={toggleTheme} className="tc-theme-btn" aria-label="Toggle theme">
                {theme === "dark" ? "◐" : "◑"}
              </button>
            </div>
          )}
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 10 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <Image src="/logo_putih.png" alt="TrustChain" width={46} height={46} style={{ objectFit: "contain" }} unoptimized />
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary, #fff)" }}>TrustChain</span>
          </div>
          <h1 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted, #9ca3af)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
            {t("verify.title")}
          </h1>
        </div>

        {/* Verification Badge */}
        <div style={{
          ...cardStyle,
          textAlign: "center",
          border: "2px solid #10b981",
          background: "linear-gradient(145deg, rgba(16,185,129,0.15) 0%, rgba(6,78,59,0.3) 100%)",
          padding: "36px 24px",
          boxShadow: "0 10px 40px rgba(16,185,129,0.2)"
        }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36, fontWeight: 800, boxShadow: "0 0 28px rgba(16,185,129,0.6)" }}>✓</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#10b981", marginBottom: 8, letterSpacing: "-0.01em" }}>
            {t("verify.verified_badge")}
          </h2>
          <p style={{ color: "var(--text-primary, #ffffff)", fontSize: 15, fontWeight: 600, maxWidth: 600, margin: "0 auto" }}>
            {lang === "id" ? "Transaksi ini tercatat dan tervalidasi secara permanen pada jaringan TrustChain" : "This transaction is permanently validated and cryptographically recorded on TrustChain"}
          </p>
          <div style={{
            marginTop: 20,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13.5,
            fontWeight: 700,
            color: "var(--text-primary, #ffffff)",
            wordBreak: "break-all",
            padding: "16px 20px",
            background: "var(--bg-tertiary, rgba(0,0,0,0.4))",
            borderRadius: 14,
            border: "1.5px solid #10b981",
            boxShadow: "0 4px 20px rgba(16,185,129,0.15)"
          }}>{tx.txHash}</div>
        </div>

        {/* Transaction Details */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 10, color: "var(--text-primary, #fff)" }}>
            <span style={{ color: "#10b981", fontSize: 18 }}>◈</span> {t("verify.sec_tx_details")}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px 24px" }}>
            {[
              [t("verify.lbl_type"), tx.type === "purchase" ? (lang === "id" ? "Pembelian" : "Purchase") : tx.type],
              [t("verify.lbl_status"), tx.status === "confirmed" ? (lang === "id" ? "✓ Dikonfirmasi" : "✓ Confirmed") : tx.status],
              [t("verify.lbl_amount"), formatCurrency(tx.amount, tx.currency)],
              ["Block", `#${tx.blockNumber?.toLocaleString()}`],
              [t("verify.lbl_timestamp"), formatDate(tx.timestamp)],
              [lang === "id" ? "Mata Uang" : "Currency", tx.currency],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div style={{ fontSize: 11.5, color: "var(--text-muted, #6b7280)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary, #fff)" }}>{value}</div>
              </div>
            ))}
          </div>
          {tx.description && (
            <div style={{ marginTop: 18, padding: "14px 16px", background: "var(--bg-tertiary, rgba(0,0,0,0.25))", borderRadius: 12, border: "1px solid var(--border-subtle, rgba(255,255,255,0.05))" }}>
              <div style={{ fontSize: 11.5, color: "var(--text-muted, #6b7280)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lang === "id" ? "Deskripsi" : "Description"}</div>
              <div style={{ fontSize: 13.5, color: "var(--text-secondary, #e5e7eb)", lineHeight: 1.5 }}>{tx.description}</div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div style={{ padding: "14px 16px", background: "var(--bg-tertiary, rgba(0,0,0,0.25))", borderRadius: 12, border: "1px solid var(--border-subtle, rgba(255,255,255,0.05))" }}>
              <div style={{ fontSize: 11.5, color: "var(--text-muted, #6b7280)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("verify.lbl_from")}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #fff)" }}>{tx.from.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted, #6b7280)", fontFamily: "monospace", marginTop: 4 }}>{formatHash(tx.from.wallet)}</div>
            </div>
            <div style={{ padding: "14px 16px", background: "var(--bg-tertiary, rgba(0,0,0,0.25))", borderRadius: 12, border: "1px solid var(--border-subtle, rgba(255,255,255,0.05))" }}>
              <div style={{ fontSize: 11.5, color: "var(--text-muted, #6b7280)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("verify.lbl_to")}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #fff)" }}>{tx.to.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted, #6b7280)", fontFamily: "monospace", marginTop: 4 }}>{formatHash(tx.to.wallet)}</div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        {data.product && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 10, color: "var(--text-primary, #fff)" }}>
              <span style={{ color: "#10b981", fontSize: 18 }}>◎</span> {t("verify.sec_product_details")}
            </h3>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: "var(--text-primary, #fff)" }}>{data.product.name}</div>
            <div style={{ fontSize: 13.5, color: "var(--text-muted, #9ca3af)", marginBottom: 14 }}>{t("verify.lbl_category")}: <strong style={{ color: "var(--text-secondary, #e5e7eb)" }}>{data.product.category}</strong></div>
            {data.product.certifications.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {data.product.certifications.map((cert) => (
                  <span key={cert} style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: 11.5, fontWeight: 700 }}>{cert}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* UMKM Info */}
        {data.umkm && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 10, color: "var(--text-primary, #fff)" }}>
              <span style={{ color: "#10b981", fontSize: 18 }}>⬡</span> {t("verify.sec_umkm_details")}
            </h3>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, color: "var(--text-primary, #fff)" }}>{data.umkm.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                background: data.umkm.verificationStatus === "verified" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                border: `1px solid ${data.umkm.verificationStatus === "verified" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                color: data.umkm.verificationStatus === "verified" ? "#10b981" : "#fbbf24",
              }}>
                {data.umkm.verificationStatus === "verified" ? (lang === "id" ? "✓ Terverifikasi di TrustChain" : "✓ Verified on TrustChain") : (lang === "id" ? "Menunggu Verifikasi" : "Pending Verification")}
              </span>
            </div>
            {data.umkm.certifications.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {data.umkm.certifications.map((cert) => (
                  <span key={cert} style={{ padding: "5px 12px", borderRadius: 20, background: "var(--bg-tertiary, rgba(255,255,255,0.08))", border: "1px solid var(--border-color, rgba(255,255,255,0.1))", color: "var(--text-secondary, #d1d5db)", fontSize: 11.5, fontWeight: 600 }}>{cert}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Supply Chain Timeline */}
        {data.supplyChain.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 22, display: "flex", alignItems: "center", gap: 10, color: "var(--text-primary, #fff)" }}>
              <span style={{ color: "#10b981", fontSize: 18 }}>◉</span> {t("verify.sec_supply_chain")}
            </h3>
            <div style={{ position: "relative", paddingLeft: 28 }}>
              <div style={{ position: "absolute", left: 9, top: 6, bottom: 6, width: 2, background: "var(--border-color, rgba(255,255,255,0.1))" }} />
              {data.supplyChain.map((event, i) => (
                <div key={event.id} style={{ marginBottom: i < data.supplyChain.length - 1 ? 24 : 0, position: "relative" }}>
                  <div style={{
                    position: "absolute", left: -24, top: 2, width: 20, height: 20, borderRadius: "50%",
                    background: i === data.supplyChain.length - 1 ? "#10b981" : "var(--bg-tertiary, rgba(255,255,255,0.15))",
                    border: `2px solid ${i === data.supplyChain.length - 1 ? "#10b981" : "var(--border-color, rgba(255,255,255,0.2))"}`,
                    boxShadow: i === data.supplyChain.length - 1 ? "0 0 12px rgba(16,185,129,0.6)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {i === data.supplyChain.length - 1 && <span style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3, color: "var(--text-primary, #fff)" }}>{event.status}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary, #9ca3af)" }}>{event.location}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted, #6b7280)", marginTop: 4 }}>
                    {formatDate(event.timestamp)}
                    {event.updatedBy && <span> · {lang === "id" ? "oleh" : "by"} <strong style={{ color: "var(--text-secondary, #d1d5db)" }}>{event.updatedBy}</strong></span>}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#10b981", fontWeight: 600, fontFamily: "monospace", marginTop: 6, padding: "6px 12px", background: "var(--bg-secondary, rgba(0,0,0,0.2))", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6, display: "inline-block", wordBreak: "break-all" }}>{formatHash(event.txHash)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code */}
        <div style={{ ...cardStyle, textAlign: "center", padding: "30px 24px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "var(--text-primary, #fff)" }}>{t("verify.qr_modal_title")}</h3>
          <div style={{ display: "inline-block", padding: 18, background: "#ffffff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
            <QRCodeSVG value={typeof window !== "undefined" ? window.location.href : `/verify/${txHash}`} size={150} />
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted, #6b7280)", marginTop: 12, fontWeight: 500 }}>{t("verify.qr_modal_desc")}</div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px 0 40px", color: "var(--text-muted, #6b7280)", fontSize: 12 }}>
          <p>{t("verify.verified_by")} <strong style={{ color: "var(--text-primary, #e5e7eb)" }}>TrustChain</strong></p>
          <p style={{ marginTop: 4 }}>{data.platform.network} · {formatDate(data.platform.verifiedAt)}</p>
        </div>
      </div>
    </div>
  );
}
