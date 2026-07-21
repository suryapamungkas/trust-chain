"use client";

import { useAuth } from "@/contexts/AuthContext";
import { mockCreditAssessments, formatCurrency } from "@/lib/database";
import { ScoreRing } from "@/components/UIComponents";
import { useState, useEffect } from "react";

export default function UmkmCreditPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [umkmProfile, setUmkmProfile] = useState<any>(null);

  useEffect(() => {
    fetch("/api/umkm?limit=1").then(r => r.json()).then(d => setUmkmProfile(d.data?.[0]));
  }, []);

  if (!umkmProfile) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Memuat data kredit...</div>;

  const myCreditAssessment = mockCreditAssessments.find(c => c.umkmId === umkmProfile.id) || mockCreditAssessments[0] || {
    creditScore: 80, riskLevel: "low", loanEligibility: 500000000, interestRate: 7, supplyChainScore: 85, salesHistoryScore: 80, bankPartners: ["BRI", "Mandiri"], recommendation: "Rekomendasi AI: Ajukan KUR BRI"
  };

  return (
    <div className="animate-fadeIn">
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Kredit & Pinjaman</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Penilaian kredit berdasarkan data rantai pasokan di blockchain</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Credit Score Card */}
        <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16 }}>Skor Kredit Anda</h3>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <ScoreRing score={myCreditAssessment.creditScore} size={120} strokeWidth={8} color={myCreditAssessment.creditScore >= 85 ? "#10b981" : myCreditAssessment.creditScore >= 70 ? "#f59e0b" : "#f43f5e"} />
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Risk Level:
            <span style={{ fontWeight: 700, color: myCreditAssessment.riskLevel === "low" ? "#10b981" : myCreditAssessment.riskLevel === "medium" ? "#f59e0b" : "#f43f5e", marginLeft: 6 }}>
              {myCreditAssessment.riskLevel === "low" ? "Rendah" : myCreditAssessment.riskLevel === "medium" ? "Sedang" : "Tinggi"}
            </span>
          </div>
        </div>

        {/* Loan Eligibility */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16 }}>Kelayakan Pinjaman</h3>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fbbf24", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8 }}>
            {formatCurrency(myCreditAssessment.loanEligibility)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Plafon pinjaman maksimal</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-secondary)" }}>Bunga</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{myCreditAssessment.interestRate}% /thn</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-secondary)" }}>Supply Chain Score</span>
              <span style={{ fontWeight: 700, color: "#34d399" }}>{myCreditAssessment.supplyChainScore}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-secondary)" }}>Sales History Score</span>
              <span style={{ fontWeight: 700, color: "#6466f1" }}>{myCreditAssessment.salesHistoryScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Partners */}
      <div className="glass-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🏦 Mitra Bank Tersedia</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {myCreditAssessment.bankPartners.map((bank: string) => (
            <div key={bank} style={{ padding: 14, borderRadius: 12, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🏛️</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{bank}</div>
              <button className="btn-primary" style={{ marginTop: 10, padding: "6px 14px", fontSize: 11 }}>Ajukan →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-primary)", marginBottom: 6 }}>💡 Rekomendasi AI</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{myCreditAssessment.recommendation}</div>
      </div>
    </div>
  );
}
