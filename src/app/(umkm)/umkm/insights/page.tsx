"use client";

import { mockExportOpportunities, mockNationalStats, formatCurrency } from "@/lib/database";

export default function UmkmInsightsPage() {
  const stats = mockNationalStats;

  return (
    <div className="animate-fadeIn">
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Market Insights</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Tren pasar dan peluang ekspor untuk UMKM</p>

      {/* Top Markets */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🌍 Top Pasar Ekspor</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {mockExportOpportunities.map(opp => (
            <div key={opp.id} style={{ padding: 14, borderRadius: 12, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{opp.targetCountry}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#34d399", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatCurrency(opp.potentialRevenue)}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Permintaan: {opp.demandLevel === "high" ? "🔥 Tinggi" : opp.demandLevel === "medium" ? "⚡ Sedang" : "📊 Rendah"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Provinces */}
      <div className="glass-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📊 Top Provinsi UMKM</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stats.topProvinces.map((prov, idx) => (
            <div key={prov.province} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderRadius: 10, background: "var(--bg-tertiary)" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-muted)", width: 26, textAlign: "center" }}>#{idx + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{prov.province}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{prov.umkmCount.toLocaleString("id-ID")} UMKM</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#6466f1" }}>{formatCurrency(prov.exportValue)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
