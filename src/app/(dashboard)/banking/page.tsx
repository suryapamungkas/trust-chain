"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import { StatusBadge, ScoreRing, ProgressBar, BlockchainHash } from "@/components/UIComponents";
import { mockCreditAssessments, mockUMKMProfiles, formatCurrency } from "@/lib/database";

export default function BankingPage() {
  const defaultSelected = mockCreditAssessments[0] || {
    umkmId: "1", umkmName: "UMKM Default", creditScore: 80, riskLevel: "low", loanEligibility: 100000000, interestRate: 6,
    supplyChainScore: 80, salesHistoryScore: 80, bankPartners: [], recommendation: "Aman"
  };
  const [selected, setSelected] = useState(defaultSelected);
  const umkm = mockUMKMProfiles.find((u) => u.id === selected.umkmId);

  return (
    <>
      <Topbar title="Analisis Kredit & Perbankan" subtitle="Pemberian kredit berbasis data rantai pasokan blockchain" />

      <div className="p-6 space-y-6">
        {/* Banking Banner */}
        <div
          className="relative rounded-2xl overflow-hidden p-8"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.1) 50%, rgba(99,102,241,0.2) 100%)",
            border: "1px solid rgba(16,185,129,0.25)",
          }}
        >
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2
                className="text-2xl font-bold gradient-text font-heading mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                TrustChain Credit Scoring
              </h2>
              <p className="text-sm text-[var(--text-secondary)] max-w-lg">
                Sistem penilaian kredit inovatif berbasis data blockchain. Bank dapat melihat histori
                rantai pasokan, skor penjualan, dan keandalan UMKM untuk keputusan kredit yang lebih akurat.
              </p>
              <div className="flex gap-3 mt-4">
                <span className="badge badge-success">🏦 12 Bank Partner</span>
                <span className="badge badge-info">⚡ Real-time Scoring</span>
                <span className="badge badge-primary">🔗 Blockchain Verified</span>
              </div>
            </div>
            <div className="flex gap-6">
              {[
                { label: "Total Kredit Disalurkan", value: "Rp 234 M", color: "#10b981" },
                { label: "Tingkat Default", value: "0.3%", color: "#6366f1" },
                { label: "UMKM Terbantu", value: "1,247", color: "#06b6d4" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {value}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Credit Assessment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* UMKM List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">Penilaian Kredit UMKM</h3>
            {mockCreditAssessments.map((assessment) => {
              const u = mockUMKMProfiles.find((um) => um.id === assessment.umkmId);
              return (
                <div
                  key={assessment.umkmId}
                  onClick={() => setSelected(assessment)}
                  className={`glass-card p-4 cursor-pointer transition-all border-2 ${
                    selected.umkmId === assessment.umkmId ? "border-indigo-500" : "border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white" }}
                    >
                      {assessment.umkmName.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[var(--text-primary)] truncate">{assessment.umkmName}</div>
                      <div className="text-xs text-[var(--text-muted)]">{u?.city}, {u?.province}</div>
                    </div>
                    <ScoreRing score={assessment.creditScore} size={44} strokeWidth={4} color={
                      assessment.creditScore >= 85 ? "#10b981" : assessment.creditScore >= 70 ? "#f59e0b" : "#f43f5e"
                    } />
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={assessment.riskLevel} />
                    <span className="text-sm font-bold text-emerald-400">{formatCurrency(assessment.loanEligibility)}</span>
                  </div>
                </div>
              );
            })}
            {mockCreditAssessments.length === 0 && (
              <div className="text-xs text-[var(--text-muted)] text-center p-4">Belum ada data UMKM</div>
            )}
          </div>

          {/* Credit Detail */}
          <div className="lg:col-span-2 space-y-4">
            {/* Credit Score Header */}
            <div
              className="glass-card p-6"
              style={{ border: "1px solid rgba(16,185,129,0.3)" }}
            >
              <div className="flex items-start gap-6">
                <div className="text-center">
                  <ScoreRing
                    score={selected.creditScore}
                    size={120}
                    strokeWidth={8}
                    color={selected.creditScore >= 85 ? "#10b981" : selected.creditScore >= 70 ? "#f59e0b" : "#f43f5e"}
                    label="Credit Score"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1 font-heading">
                    {selected.umkmName}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <StatusBadge status={selected.riskLevel} />
                    <span className="text-xs text-[var(--text-muted)]">Risiko {selected.riskLevel === "low" ? "Rendah" : selected.riskLevel === "medium" ? "Sedang" : "Tinggi"}</span>
                  </div>
                  <div
                    className="p-4 rounded-xl mb-4"
                    style={{
                      background: selected.creditScore >= 85 ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                      border: `1px solid ${selected.creditScore >= 85 ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
                    }}
                  >
                    <div className="text-sm font-semibold mb-1" style={{ color: selected.creditScore >= 85 ? "#10b981" : "#f59e0b" }}>
                      📋 Rekomendasi Bank:
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">{selected.recommendation}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl text-center" style={{ background: "var(--bg-tertiary)" }}>
                      <div className="text-xl font-bold text-emerald-400">{formatCurrency(selected.loanEligibility)}</div>
                      <div className="text-xs text-[var(--text-muted)]">Plafon Kredit</div>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ background: "var(--bg-tertiary)" }}>
                      <div className="text-xl font-bold text-indigo-400">{selected.interestRate}%</div>
                      <div className="text-xs text-[var(--text-muted)]">Bunga/tahun</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Komponen Skor Kredit Berbasis Blockchain</h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Supply Chain Score",
                    value: selected.supplyChainScore,
                    desc: "Histori rantai pasokan on-chain — konsistensi, ketepatan waktu, keandalan supplier",
                    color: "#6366f1",
                    icon: "⛓️",
                  },
                  {
                    label: "Sales History Score",
                    value: selected.salesHistoryScore,
                    desc: "Rekam jejak penjualan 24 bulan terakhir — volume, pertumbuhan, konsistensi",
                    color: "#10b981",
                    icon: "📈",
                  },
                  {
                    label: "Reliability Score",
                    value: selected.reliabilityScore || 80,
                    desc: "Skor keandalan UMKM oleh AI — kepatuhan, sertifikasi, respons risiko",
                    color: "#06b6d4",
                    icon: "⭐",
                  },
                ].map(({ label, value, desc, color, icon }) => (
                  <div key={label} className="p-4 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
                          <span className="text-lg font-bold" style={{ color }}>{value}/100</span>
                        </div>
                        <ProgressBar value={value} color={color} showValue={false} />
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1 ml-9">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Partners */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Bank Partner yang Merekomendasikan</h3>
              <div className="flex flex-wrap gap-3">
                {selected.bankPartners.map((bank: string) => (
                  <div
                    key={bank}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}
                  >
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                      style={{ background: "linear-gradient(135deg, #4f46e5, #06b6d4)", color: "white" }}
                    >
                      {bank.split(" ").pop()?.[0]}
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{bank}</span>
                    <StatusBadge status="verified" label="Partner" />
                  </div>
                ))}
                {selected.bankPartners.length === 0 && (
                  <div className="text-xs text-[var(--text-muted)]">Belum ada partner bank</div>
                )}
              </div>

              {/* UMKM Data from Blockchain */}
              <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <div className="text-xs font-semibold text-indigo-400 mb-3">📊 Data UMKM Dari Blockchain</div>
                {umkm && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Total Produk", value: umkm.totalProducts },
                      { label: "Total Transaksi", value: umkm.totalTransactions },
                      { label: "Karyawan", value: umkm.employees },
                      { label: "Revenue/Tahun", value: formatCurrency(umkm.annualRevenue) },
                    ].map(({ label, value }) => (
                       <div key={label} className="text-center p-2 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                        <div className="text-base font-bold text-[var(--text-primary)]">{value}</div>
                        <div className="text-xs text-[var(--text-muted)]">{label}</div>
                      </div>
                    ))}
                  </div>
                )}
                {umkm && (
                  <div className="mt-3 text-xs text-[var(--text-muted)]">
                    Wallet: <BlockchainHash hash={umkm.walletAddress} />
                  </div>
                )}
                {!umkm && (
                  <div className="text-xs text-[var(--text-muted)]">Data UMKM tidak ditemukan di database lokal.</div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button className="btn-primary flex-1 text-sm">🏦 Ajukan Kredit Sekarang</button>
                <button className="btn-secondary text-sm px-4">📄 Download Laporan</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
