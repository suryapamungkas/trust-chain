"use client";

import { useState, useEffect } from "react";
import { formatCurrency, UMKMProfile } from "@/lib/database";

export default function OpportunitiesPage() {
  const [topUmkm, setTopUmkm] = useState<UMKMProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const json = await res.json();
        if (json.topUmkm) {
          setTopUmkm(json.topUmkm);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  let filtered = [...topUmkm];
  if (categoryFilter !== "all") {
    filtered = filtered.filter(u => u.category === categoryFilter);
  }

  if (sortBy === "revenue") {
    filtered.sort((a, b) => b.annualRevenue - a.annualRevenue);
  } else {
    filtered.sort((a, b) => b.reliabilityScore - a.reliabilityScore);
  }

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            Peluang Investasi UMKM
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>UMKM unggulan dengan rekam jejak terbaik di ekosistem TrustChain</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)", fontSize: 13 }}
          >
            <option value="all">Semua Kategori</option>
            <option value="Obat Tradisional">Obat Tradisional</option>
            <option value="Jamu">Jamu</option>
            <option value="Suplemen Herbal">Suplemen Herbal</option>
            <option value="Kosmetik Herbal">Kosmetik Herbal</option>
          </select>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)", fontSize: 13 }}
          >
            <option value="score">Urutkan: Reliability Score</option>
            <option value="revenue">Urutkan: Omzet Terbesar</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Memuat peluang investasi...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Tidak ada UMKM yang cocok dengan filter.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filtered.map((umkm, i) => (
            <div key={umkm.id} className="glass-card animate-fadeInUp" style={{ padding: 20, animationDelay: `${i * 0.05}s`, display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{umkm.businessName}</h3>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{umkm.category} • {umkm.province}</div>
                </div>
                {umkm.exportReady && (
                  <span className="badge badge-success" style={{ padding: "4px 8px" }}>Siap Ekspor</span>
                )}
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, padding: 12, borderRadius: 10, background: "rgba(52, 211, 153, 0.1)", border: "1px solid rgba(52, 211, 153, 0.2)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Reliability Score</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#34d399" }}>{umkm.reliabilityScore}</div>
                </div>
                <div style={{ flex: 1, padding: 12, borderRadius: 10, background: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.2)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Credit Score</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#fbbf24" }}>{umkm.creditScore}</div>
                </div>
              </div>

              <div style={{ marginBottom: 24, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Omzet Tahunan</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(umkm.annualRevenue)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Status Verifikasi</span>
                  <span style={{ fontSize: 12, color: umkm.verificationStatus === "verified" ? "#34d399" : "#fbbf24", fontWeight: 600 }}>
                    {umkm.verificationStatus.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Tipe Industri</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{umkm.tipeIndustri || "UMKM"}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
                <button style={{ flex: 1, padding: "10px 0", borderRadius: 8, background: "transparent", border: "1px solid #fbbf24", color: "#fbbf24", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                  Lihat Detail
                </button>
                <button style={{ flex: 1, padding: "10px 0", borderRadius: 8, background: "#fbbf24", border: "none", color: "#1e293b", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                  Hubungi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
