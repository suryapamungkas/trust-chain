"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { StatusBadge, ScoreRing, ProgressBar } from "@/components/UIComponents";
import {
  mockNationalStats,
  mockExportOpportunities,
  formatCurrency,
  formatNumber,
} from "@/lib/database";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

const PROVINCE_COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

// Indonesia province coordinates (simplified for visual map)
const provincePositions: Record<string, { x: number; y: number }> = {
  "Aceh": { x: 8, y: 18 },
  "Sumatera Barat": { x: 16, y: 42 },
  "Jawa Tengah": { x: 45, y: 58 },
  "Jawa Barat": { x: 40, y: 56 },
  "Yogyakarta": { x: 47, y: 60 },
  "Bali": { x: 58, y: 62 },
  "Sulawesi Selatan": { x: 68, y: 52 },
};

export default function GovernmentPage() {
  const [mounted, setMounted] = useState(false);
  const [activeProvince, setActiveProvince] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setMounted(true);
  }, []);

  const stats = mockNationalStats;

  return (
    <>
      <Topbar title="Dasbor Pemerintah" subtitle="Monitoring nasional UMKM Indonesia — Data real-time dari blockchain" />

      <div className="p-6 space-y-6">
        {/* National KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total UMKM Aktif",
              value: formatNumber(stats.totalUMKM),
              change: "+1.2K bulan ini",
              color: "#6366f1",
              icon: "🏭",
              sub: "Terdaftar di blockchain",
            },
            {
              label: "Nilai Ekspor Nasional",
              value: formatCurrency(stats.totalExportValue),
              change: "+28.7% YoY",
              color: "#10b981",
              icon: "✈️",
              sub: "UMKM bersertifikat",
            },
            {
              label: "Rantai Pasokan Aktif",
              value: formatNumber(stats.activeSupplyChains),
              change: "Live monitoring",
              color: "#06b6d4",
              icon: "⛓️",
              sub: "Real-time on-chain",
            },
            {
              label: "Sertifikasi Terverifikasi",
              value: formatNumber(stats.verifiedCertifications),
              change: "+234 bulan ini",
              color: "#f59e0b",
              icon: "📜",
              sub: "Valid & on-chain",
            },
          ].map(({ label, value, change, color, icon, sub }) => (
            <div key={label} className="glass-card p-5">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-2xl font-bold mb-1 font-heading" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>
                {value}
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</div>
              <div className="text-xs mt-2 font-medium" style={{ color }}>{change}</div>
            </div>
          ))}
        </div>

        {/* Map + Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* National Map Visualization */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">Peta Sebaran UMKM Indonesia</h3>
                <p className="text-xs text-[var(--text-muted)]">Klik provinsi untuk detail</p>
              </div>
              <div className="flex gap-2">
                <span className="badge badge-success">Export Ready</span>
                <span className="badge badge-warning">Berkembang</span>
              </div>
            </div>

            {/* Simplified Indonesia Map SVG */}
            <div
              className="map-container"
              style={{ height: "280px", position: "relative", overflow: "hidden" }}
            >
              <svg
                viewBox="0 0 100 80"
                width="100%"
                height="100%"
                style={{ position: "absolute", inset: 0 }}
              >
                {/* Background */}
                <rect width="100" height="80" fill="#1e293b" />

                {/* Grid lines */}
                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
                  <line key={x} x1={x} y1={0} x2={x} y2={80} stroke="rgba(99,102,241,0.08)" strokeWidth="0.3" />
                ))}
                {[10, 20, 30, 40, 50, 60, 70].map((y) => (
                  <line key={y} x1={0} y1={y} x2={100} y2={y} stroke="rgba(99,102,241,0.08)" strokeWidth="0.3" />
                ))}

                {/* Simplified island shapes */}
                {/* Sumatera */}
                <ellipse cx="18" cy="38" rx="14" ry="28" fill="rgba(30,41,59,0.8)" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" transform="rotate(-15, 18, 38)" />
                {/* Jawa */}
                <ellipse cx="47" cy="60" rx="18" ry="5" fill="rgba(30,41,59,0.8)" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" />
                {/* Bali */}
                <ellipse cx="62" cy="61" rx="3" ry="3" fill="rgba(30,41,59,0.8)" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" />
                {/* Kalimantan */}
                <ellipse cx="60" cy="35" rx="14" ry="18" fill="rgba(30,41,59,0.8)" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" />
                {/* Sulawesi */}
                <ellipse cx="74" cy="42" rx="6" ry="20" fill="rgba(30,41,59,0.8)" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" transform="rotate(-20, 74, 42)" />
                {/* Papua */}
                <ellipse cx="92" cy="38" rx="8" ry="14" fill="rgba(30,41,59,0.8)" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" />

                {/* Province dots */}
                {stats.topProvinces.map((prov, idx) => {
                  const pos = provincePositions[prov.province] || { x: 50, y: 50 };
                  const isActive = activeProvince === prov.province;
                  const size = Math.max(2, (prov.umkmCount / 2000) * 6);
                  return (
                    <g
                      key={prov.province}
                      onClick={() => setActiveProvince(isActive ? null : prov.province)}
                      style={{ cursor: "pointer" }}
                    >
                      <circle cx={pos.x} cy={pos.y} r={size + 2} fill={`${PROVINCE_COLORS[idx]}30`} />
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={size}
                        fill={PROVINCE_COLORS[idx]}
                        opacity={isActive ? 1 : 0.7}
                        style={{ filter: isActive ? `drop-shadow(0 0 4px ${PROVINCE_COLORS[idx]})` : "none" }}
                      />
                      <text x={pos.x} y={pos.y - size - 2} textAnchor="middle" fontSize="3" fill="#94a3b8">
                        {prov.province.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}

                {/* Legend */}
                <text x="2" y="76" fontSize="2.5" fill="#475569">© TrustChain UMKM Geospatial Engine</text>
              </svg>

              {/* Province Detail Popup */}
              {activeProvince && (
                <div
                  className="absolute top-4 right-4 p-4 rounded-xl text-sm"
                  style={{
                    background: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    backdropFilter: "blur(12px)",
                    minWidth: "180px",
                  }}
                >
                  <div className="font-bold text-[var(--text-primary)] mb-2">{activeProvince}</div>
                  {stats.topProvinces.filter((p) => p.province === activeProvince).map((prov) => (
                    <div key={prov.province} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-muted)]">UMKM</span>
                        <span className="font-bold text-indigo-400">{formatNumber(prov.umkmCount)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-muted)]">Ekspor</span>
                        <span className="font-bold text-emerald-400">{formatCurrency(prov.exportValue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Province Rankings */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 font-heading">Ranking Provinsi Ekspor</h3>
            <div className="space-y-3">
              {stats.topProvinces.map((prov, idx) => (
                <div key={prov.province}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: `${PROVINCE_COLORS[idx]}30`, color: PROVINCE_COLORS[idx] }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-[var(--text-primary)]">{prov.province}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: PROVINCE_COLORS[idx] }}>
                      {formatCurrency(prov.exportValue)}
                    </span>
                  </div>
                  <ProgressBar
                    value={(prov.exportValue / stats.topProvinces[0].exportValue) * 100}
                    color={PROVINCE_COLORS[idx]}
                    showValue={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Opportunities */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">Peluang Ekspor Teridentifikasi</h3>
              <p className="text-xs text-[var(--text-muted)]">Analisis pasar global berdasarkan AI matching UMKM</p>
            </div>
            <button className="btn-primary text-xs px-4 py-2">📊 Export Report PDF</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pt-0">
            {mockExportOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-5 rounded-xl"
                style={{
                  background: "var(--bg-tertiary)",
                  border: `1px solid ${opp.demandLevel === "high" ? "rgba(16,185,129,0.3)" : opp.demandLevel === "medium" ? "rgba(245,158,11,0.3)" : "rgba(99,102,241,0.3)"}`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-base font-bold text-[var(--text-primary)]">🌍 {opp.targetCountry}</div>
                    <div className="text-xs text-[var(--text-muted)]">{opp.targetMarket}</div>
                  </div>
                  <StatusBadge status={opp.demandLevel} label={opp.demandLevel === "high" ? "Tinggi" : opp.demandLevel === "medium" ? "Sedang" : "Rendah"} />
                </div>

                <div className="mb-3">
                  <ScoreRing score={opp.readinessScore} size={56} strokeWidth={5} color={opp.readinessScore > 80 ? "#10b981" : "#f59e0b"} label="Kesiapan" />
                </div>

                <div className="text-lg font-bold text-emerald-400 mb-1">
                  {formatCurrency(opp.potentialRevenue)}
                </div>
                <div className="text-xs text-[var(--text-muted)] mb-3">Potensi Revenue · {opp.estimatedTimeline}</div>

                <div className="mb-3">
                  <div className="text-xs text-[var(--text-muted)] mb-1">Sertifikasi Diperlukan:</div>
                  <div className="flex flex-wrap gap-1">
                    {opp.requiredCertifications.map((cert) => (
                      <span key={cert} className="badge badge-info" style={{ fontSize: "9px" }}>{cert}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[var(--text-muted)] mb-1">Hambatan:</div>
                  {opp.barriers.map((barrier) => (
                    <div key={barrier} className="flex items-center gap-1 text-xs text-amber-400 mb-0.5">
                      <span>⚠</span> {barrier}
                    </div>
                  ))}
                </div>

                <button className="btn-primary w-full text-xs mt-4">
                  Lihat Detail & Matching UMKM
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Growth */}
        <div className="glass-card p-6">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 font-heading">Pertumbuhan Registrasi UMKM Bulanan</h3>
          {mounted && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="newUMKM" name="UMKM Baru" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  {stats.monthlyGrowth.map((_, idx) => (
                    <Cell key={idx} fill={`hsl(${234 + idx * 5}, 89%, ${60 + idx * 2}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}
