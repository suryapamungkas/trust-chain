"use client";

import { mockExportOpportunities, formatCurrency } from "@/lib/database";

export default function UmkmExportPage() {
  return (
    <div className="animate-fadeIn">
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Peluang Ekspor</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Temukan peluang ekspor berdasarkan kesiapan produk Anda</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {mockExportOpportunities.map(opp => (
          <div key={opp.id} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>🌍 {opp.targetCountry}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{opp.targetMarket}</div>
              </div>
              <span className={`badge ${opp.demandLevel === "high" ? "badge-success" : opp.demandLevel === "medium" ? "badge-warning" : "badge-info"}`}>
                {opp.demandLevel === "high" ? "Tinggi" : opp.demandLevel === "medium" ? "Sedang" : "Rendah"}
              </span>
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, color: "#34d399", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 12 }}>
              {formatCurrency(opp.potentialRevenue)}
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                <span>Kesiapan Ekspor</span><span style={{ fontWeight: 700 }}>{opp.readinessScore}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${opp.readinessScore}%`, background: opp.readinessScore >= 80 ? "#10b981" : "#f59e0b" }} />
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Sertifikasi Diperlukan:</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {opp.requiredCertifications.map(c => (
                  <span key={c} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "rgba(99,102,241,0.1)", color: "var(--brand-primary)", border: "1px solid rgba(99,102,241,0.2)" }}>{c}</span>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>⏱️ Estimasi: {opp.estimatedTimeline} · {opp.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
