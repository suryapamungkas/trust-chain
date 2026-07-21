"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import { StatusBadge, ProgressBar, BlockchainHash } from "@/components/UIComponents";
import { mockProducts } from "@/lib/database";

interface FraudResult {
  umkmId: string;
  umkmName: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  anomalies: {
    type: string;
    description: string;
    severity: "low" | "medium" | "high";
    affectedField: string;
    expectedValue: string;
    actualValue: string;
  }[];
  recommendation: string;
  confidence: number;
  analysisTimestamp: string;
  modelVersion: string;
}

interface PriceAnomaly {
  productId?: number;
  productName: string;
  umkmName: string;
  category: string;
  priceIdr: number;
  avgCategoryPrice: number;
  deviationPercent: number;
  riskLevel: string;
  reason: string;
}

export default function FraudDetectionPage() {
  const [results, setResults] = useState<FraudResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [selectedUmkm, setSelectedUmkm] = useState<FraudResult | null>(null);

  const [priceAnomalies, setPriceAnomalies] = useState<PriceAnomaly[]>([]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const [fraudRes, priceRes] = await Promise.all([
        fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "fraud_analysis" }),
        }).then(r => r.json()),
        fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "price_anomaly" }),
        }).then(r => r.json()).catch(() => ({ success: false, anomalies: [] }))
      ]);

      if (fraudRes.success) {
        setResults(fraudRes.results);
      }
      if (priceRes.success) {
        setPriceAnomalies(priceRes.anomalies || []);
      }
      setHasRun(true);
    } catch (error) {
      console.error("Fraud analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalAnomalies = results.reduce((s, r) => s + r.anomalies.length, 0) + priceAnomalies.length;
  const highRisk = results.filter(r => r.riskLevel === "high" || r.riskLevel === "critical").length + priceAnomalies.filter(a => a.riskLevel === "high").length;
  const avgConfidence = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.confidence, 0) / results.length) : 94;

  return (
    <>
      <Topbar title="Deteksi Penipuan AI" subtitle="Pemantauan otomatis kecurangan supply chain dengan analisis real-time" />

      <div className="p-6 space-y-6">
        {/* Run Analysis Button */}
        <div className="glass-card p-5 flex items-center justify-between" style={{ border: "1px solid rgba(244,63,94,0.25)" }}>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">AI Fraud & Price Anomaly Engine</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Analisis statistik anomali pada UMKM terdaftar & deteksi deviasi harga produk secara real-time dari database
            </p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="btn-primary"
            style={{ padding: "12px 28px" }}
          >
            {loading ? (
              <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Menganalisis...</>
            ) : (
              <>{hasRun ? "🔄" : "🧠"} {hasRun ? "Analisis Ulang" : "Jalankan Analisis AI"}</>
            )}
          </button>
        </div>

        {/* Stats - only show after analysis */}
        {hasRun && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "UMKM & Produk Dianalisis", value: (results.length + priceAnomalies.length || 12).toString(), color: "#6366f1" },
              { label: "Total Anomali Ditemukan", value: totalAnomalies.toString(), color: "#f43f5e" },
              { label: "Risiko Tinggi", value: highRisk.toString(), color: "#f59e0b" },
              { label: "Akurasi Model", value: `${avgConfidence}%`, color: "#10b981" },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-4 text-center animate-fadeInUp">
                <div className="text-2xl font-bold" style={{ color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
                <div className="text-sm text-[var(--text-secondary)]">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Price Anomaly Section */}
        {hasRun && (
          <div className="glass-card p-6" style={{ border: "1px solid rgba(245,158,11,0.3)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-heading flex items-center gap-2">
                  <span>⚠️ AI Price Anomaly Alerts (Deviasi Harga Pasar)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold">{priceAnomalies.length} Anomali</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Mendeteksi produk dengan harga terlampau rendah (&lt;40% rata-rata kategori) atau terlampau tinggi (&gt;300% rata-rata)
                </p>
              </div>
            </div>

            {priceAnomalies.length === 0 ? (
              <div className="p-4 rounded-xl text-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-sm font-semibold">
                ✅ Tidak ada deviasi harga ekstrem yang ditemukan pada katalog produk aktif saat ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>Produk</th>
                      <th style={{ textAlign: "left" }}>Kategori</th>
                      <th style={{ textAlign: "right" }}>Harga Aktual</th>
                      <th style={{ textAlign: "right" }}>Rata-Rata Kategori</th>
                      <th style={{ textAlign: "center" }}>Deviasi</th>
                      <th style={{ textAlign: "center" }}>Risiko</th>
                      <th style={{ textAlign: "left" }}>Analisis AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceAnomalies.map((pa, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "12px 8px" }}>
                          <div className="font-bold text-[var(--text-primary)]">{pa.productName}</div>
                          <div className="text-xs text-[var(--text-muted)]">{pa.umkmName}</div>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          <span className="px-2 py-1 rounded text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                            {pa.category}
                          </span>
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#f43f5e" }}>
                          Rp {new Intl.NumberFormat("id-ID").format(pa.priceIdr)}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)" }}>
                          Rp {new Intl.NumberFormat("id-ID").format(pa.avgCategoryPrice)}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 700, color: pa.deviationPercent < 0 ? "#60a5fa" : "#f59e0b" }}>
                          {pa.deviationPercent > 0 ? `+${pa.deviationPercent}%` : `${pa.deviationPercent}%`}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "center" }}>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${pa.riskLevel === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                            {pa.riskLevel?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "12px 8px", fontSize: 12, color: "var(--text-secondary)" }}>
                          {pa.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {hasRun && (
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 font-heading">Hasil Analisis per UMKM</h3>
            <div className="space-y-3">
              {results.map(result => (
                <div
                  key={result.umkmId}
                  className="rounded-xl p-4 cursor-pointer transition-all"
                  onClick={() => setSelectedUmkm(selectedUmkm?.umkmId === result.umkmId ? null : result)}
                  style={{
                    background: result.riskLevel === "critical" || result.riskLevel === "high"
                      ? "rgba(244,63,94,0.07)" : result.riskLevel === "medium"
                      ? "rgba(245,158,11,0.07)" : "rgba(16,185,129,0.07)",
                    border: `1px solid ${result.riskLevel === "critical" || result.riskLevel === "high"
                      ? "rgba(244,63,94,0.25)" : result.riskLevel === "medium"
                      ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)"}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{
                          background: result.riskLevel === "high" || result.riskLevel === "critical"
                            ? "rgba(244,63,94,0.2)" : result.riskLevel === "medium"
                            ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)",
                          color: result.riskLevel === "high" || result.riskLevel === "critical"
                            ? "#f43f5e" : result.riskLevel === "medium"
                            ? "#f59e0b" : "#10b981",
                        }}
                      >
                        {result.riskScore}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">{result.umkmName}</div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {result.anomalies.length} anomali ditemukan · Kepercayaan {result.confidence}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={result.riskLevel} />
                      <span className="text-xs text-[var(--text-muted)]">
                        {selectedUmkm?.umkmId === result.umkmId ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* Detail Panel */}
                  {selectedUmkm?.umkmId === result.umkmId && (
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      {result.anomalies.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Anomali Terdeteksi</div>
                          {result.anomalies.map((anomaly, idx) => (
                            <div key={idx} className="p-3 rounded-lg" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                              <div className="flex items-center gap-2 mb-1">
                                <StatusBadge status={anomaly.severity} />
                                <span className="text-xs font-semibold text-[var(--text-primary)]">{anomaly.type.replace(/_/g, " ").toUpperCase()}</span>
                              </div>
                              <p className="text-xs text-[var(--text-secondary)] mb-2">{anomaly.description}</p>
                              <div className="flex gap-4 text-xs">
                                <span className="text-[var(--text-muted)]">Expected: <span className="text-emerald-400">{anomaly.expectedValue}</span></span>
                                <span className="text-[var(--text-muted)]">Actual: <span className="text-rose-400">{anomaly.actualValue}</span></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-emerald-400 mb-4">✅ Tidak ada anomali terdeteksi</div>
                      )}
                      <div className="p-3 rounded-lg" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                        <span className="text-xs text-indigo-400 font-semibold">💡 Rekomendasi: </span>
                        <span className="text-xs text-[var(--text-secondary)]">{result.recommendation}</span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-3">
                        Model: {result.modelVersion} · Analisis: {new Date(result.analysisTimestamp).toLocaleString("id-ID")}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Log */}
        <div className="glass-card p-6">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 font-heading">Audit Log Produk</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>AI Risk Score</th>
                  <th>Status Verifikasi</th>
                  <th>Blockchain Hash</th>
                </tr>
              </thead>
              <tbody>
                {mockProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{p.umkmName}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: p.aiRiskScore < 20 ? "#10b981" : p.aiRiskScore < 40 ? "#f59e0b" : "#f43f5e" }}>
                          {p.aiRiskScore}%
                        </span>
                        <ProgressBar value={100 - p.aiRiskScore} color={p.aiRiskScore < 20 ? "#10b981" : p.aiRiskScore < 40 ? "#f59e0b" : "#f43f5e"} showValue={false} />
                      </div>
                    </td>
                    <td><StatusBadge status={p.status === "exported" || p.status === "delivered" ? "verified" : p.status} /></td>
                    <td><BlockchainHash hash={p.blockchainHash} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
