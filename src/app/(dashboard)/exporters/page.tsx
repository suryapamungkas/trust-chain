"use client";

import Topbar from "@/components/Topbar";
import { StatusBadge, ScoreRing } from "@/components/UIComponents";
import { mockExportOpportunities, formatCurrency } from "@/lib/database";

export default function ExportersPage() {
  return (
    <>
      <Topbar title="Peluang Ekspor" subtitle="Koneksi produk UMKM Indonesia dengan pasar global" />

      <div className="p-6 space-y-6">
        {/* Hero Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Negara Tujuan", value: "47", color: "#6366f1" },
            { label: "Potensi Revenue", value: "Rp 193T", color: "#10b981" },
            { label: "UMKM Export-Ready", value: "3,421", color: "#06b6d4" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-5 text-center">
              <div className="text-3xl font-bold mb-1" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
              <div className="text-sm text-[var(--text-secondary)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockExportOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="glass-card p-6"
              style={{
                border: `1px solid ${opp.demandLevel === "high" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">🌏 {opp.targetCountry}</div>
                  <div className="text-sm text-[var(--text-secondary)]">{opp.targetMarket}</div>
                </div>
                <StatusBadge status={opp.demandLevel} label={opp.demandLevel === "high" ? "Tinggi" : opp.demandLevel === "medium" ? "Sedang" : "Rendah"} />
              </div>
              <ScoreRing score={opp.readinessScore} size={72} strokeWidth={6} color={opp.readinessScore > 80 ? "#10b981" : "#f59e0b"} label="Kesiapan Ekspor" />
              <div className="mt-4">
                <div className="text-2xl font-bold text-emerald-400">{formatCurrency(opp.potentialRevenue)}</div>
                <div className="text-xs text-[var(--text-muted)]">Potensi Revenue · {opp.estimatedTimeline}</div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-[var(--text-muted)] mb-1">Sertifikasi Diperlukan:</div>
                <div className="flex flex-wrap gap-1">
                  {opp.requiredCertifications.map((c) => (
                    <span key={c} className="badge badge-info" style={{ fontSize: "9px" }}>{c}</span>
                  ))}
                </div>
              </div>
              <button className="btn-primary w-full text-sm mt-4">Explore Opportunity</button>
            </div>
          ))}
        </div>

        {/* Export Process Steps */}
        <div className="glass-card p-6">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-6 font-heading">Proses Ekspor dengan TrustChain</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: 1, title: "Registrasi Digital", desc: "Daftarkan produk ke blockchain dengan digital identity", icon: "🔐" },
              { step: 2, title: "Verifikasi Sertifikasi", desc: "Smart contract otomatis cek semua sertifikasi ekspor", icon: "✅" },
              { step: 3, title: "AI Matching", desc: "AI mencocokkan produk UMKM dengan buyer internasional", icon: "🤖" },
              { step: 4, title: "Ekspor & Tracking", desc: "Lacak pengiriman real-time on-chain sampai tujuan", icon: "✈️" },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="text-center p-4 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                <div className="text-3xl mb-3">{icon}</div>
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-sm flex items-center justify-center mx-auto mb-2">{step}</div>
                <div className="text-sm font-bold text-[var(--text-primary)] mb-1">{title}</div>
                <div className="text-xs text-[var(--text-secondary)]">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
