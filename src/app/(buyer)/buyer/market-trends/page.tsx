"use client";

import { mockNationalStats, formatCurrency } from "@/lib/database";

export default function BuyerMarketTrendsPage() {
  const stats = mockNationalStats;

  return (
    <div className="animate-fadeIn">
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Tren Pasar</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Analisis tren pasar dan peluang ekspor Indonesia</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total UMKM", value: stats.totalUMKM.toLocaleString("id-ID"), color: "#6466f1" },
          { label: "Produk On-Chain", value: stats.totalProducts.toLocaleString("id-ID"), color: "#06b6d4" },
          { label: "Total Ekspor", value: "Rp 4,25 T", color: "#10b981" },
          { label: "Sertifikasi Aktif", value: stats.verifiedCertifications.toLocaleString("id-ID"), color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top Provinces */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📊 Top Provinsi</h3>
          {stats.topProvinces.map((prov, idx) => (
            <div key={prov.province} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: idx < stats.topProvinces.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-muted)", width: 22 }}>#{idx + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{prov.province}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{prov.umkmCount.toLocaleString("id-ID")} UMKM</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6466f1" }}>{formatCurrency(prov.exportValue)}</div>
            </div>
          ))}
        </div>

        {/* Category Distribution */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🏷️ Distribusi Kategori</h3>
          {stats.categoryDistribution.map((cat, idx) => {
            const colors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];
            return (
              <div key={cat.category} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--text-secondary)" }}>{cat.category}</span>
                  <span style={{ fontWeight: 700, color: colors[idx % colors.length] }}>{cat.percentage}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${cat.percentage}%`, background: colors[idx % colors.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
