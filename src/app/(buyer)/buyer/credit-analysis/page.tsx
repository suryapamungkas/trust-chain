"use client";

import { mockCreditAssessments, formatCurrency } from "@/lib/database";
import { ScoreRing } from "@/components/UIComponents";

export default function BuyerCreditAnalysisPage() {
  return (
    <div className="animate-fadeIn">
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Analisis Kredit</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Penilaian kredit UMKM berdasarkan data blockchain dan AI</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {mockCreditAssessments.map(ca => (
          <div key={ca.umkmId} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              <ScoreRing score={ca.creditScore} size={64} strokeWidth={5} color={ca.creditScore >= 85 ? "#10b981" : ca.creditScore >= 70 ? "#f59e0b" : "#f43f5e"} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{ca.umkmName}</div>
                <span className={`badge ${ca.riskLevel === "low" ? "badge-success" : ca.riskLevel === "medium" ? "badge-warning" : "badge-danger"}`}>
                  Risiko {ca.riskLevel === "low" ? "Rendah" : ca.riskLevel === "medium" ? "Sedang" : "Tinggi"}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 12 }}>
              <div style={{ color: "var(--text-secondary)" }}>Plafon: <strong style={{ color: "#fbbf24" }}>{formatCurrency(ca.loanEligibility)}</strong></div>
              <div style={{ color: "var(--text-secondary)" }}>Bunga: <strong>{ca.interestRate}%</strong></div>
              <div style={{ color: "var(--text-secondary)" }}>Supply Chain: <strong style={{ color: "#34d399" }}>{ca.supplyChainScore}</strong></div>
              <div style={{ color: "var(--text-secondary)" }}>Sales History: <strong style={{ color: "#6466f1" }}>{ca.salesHistoryScore}</strong></div>
            </div>

            <div style={{ padding: 10, borderRadius: 8, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", fontSize: 12, color: "var(--text-secondary)" }}>
              💡 {ca.recommendation.split("—")[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
