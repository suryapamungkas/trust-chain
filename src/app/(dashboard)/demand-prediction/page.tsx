"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { ProgressBar } from "@/components/UIComponents";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PredictionResult {
  productCategory: string;
  currentDemand: number;
  predictedDemand: number;
  changePercent: number;
  confidence: number;
  trend: "rising" | "stable" | "declining";
  seasonalFactors: string[];
  forecastPeriod: string;
  dataPoints: { month: string; predicted: number; lower: number; upper: number }[];
}

const CATEGORIES = [
  { label: "Batik & Tekstil", value: "Kerajinan Tekstil", icon: "🧵", color: "#6366f1" },
  { label: "Kopi Premium", value: "Produk Pertanian", icon: "☕", color: "#10b981" },
  { label: "Keramik Artisanal", value: "Kerajinan Tangan", icon: "🏺", color: "#f59e0b" },
  { label: "Industri Makanan", value: "Industri Makanan", icon: "🍜", color: "#06b6d4" },
];

const HISTORICAL_DATA = [
  { month: "Jul 2024", value: 82 },
  { month: "Agu 2024", value: 85 },
  { month: "Sep 2024", value: 91 },
  { month: "Okt 2024", value: 108 },
  { month: "Nov 2024", value: 124 },
  { month: "Des 2024", value: 135 },
  { month: "Jan 2025", value: 129 },
];

export default function DemandPredictionPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Kerajinan Tekstil");
  const [predictions, setPredictions] = useState<Record<string, PredictionResult>>({});
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const results: Record<string, PredictionResult> = {};
      for (const cat of CATEGORIES) {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "demand_prediction",
            data: {
              category: cat.value,
              historicalData: HISTORICAL_DATA,
              seasonalFactors: [],
            },
          }),
        });
        const data = await res.json();
        if (data.success) {
          results[cat.value] = data.result;
        }
      }
      setPredictions(results);
      setHasRun(true);
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentPrediction = predictions[selectedCategory];
  const historicalForChart = HISTORICAL_DATA.map(d => ({
    month: d.month,
    actual: d.value,
    predicted: null as number | null,
    lower: null as number | null,
    upper: null as number | null,
  }));
  const combinedData = currentPrediction
    ? [...historicalForChart, ...currentPrediction.dataPoints.map(d => ({
        month: d.month,
        actual: null as number | null,
        predicted: d.predicted,
        lower: d.lower,
        upper: d.upper,
      }))]
    : historicalForChart;

  return (
    <>
      <Topbar title="Prediksi Permintaan" subtitle="Forecasting pasar berbasis AI — Time Series Analysis & Seasonal Decomposition" />

      <div className="p-6 space-y-6">
        {/* Run Button */}
        <div className="glass-card p-5 flex items-center justify-between" style={{ border: "1px solid rgba(16,185,129,0.25)" }}>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">AI Demand Forecasting Engine</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Prediksi permintaan 6 bulan ke depan menggunakan linear regression + seasonal decomposition
            </p>
          </div>
          <button onClick={runPrediction} disabled={loading} className="btn-primary" style={{ padding: "12px 28px" }}>
            {loading ? (
              <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Memprediksi...</>
            ) : (
              <>{hasRun ? "🔄" : "📊"} {hasRun ? "Prediksi Ulang" : "Jalankan Prediksi AI"}</>
            )}
          </button>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => {
            const pred = predictions[cat.value];
            return (
              <div
                key={cat.value}
                className="glass-card p-4 cursor-pointer transition-all"
                onClick={() => setSelectedCategory(cat.value)}
                style={{
                  border: selectedCategory === cat.value ? `1.5px solid ${cat.color}` : undefined,
                  boxShadow: selectedCategory === cat.value ? `0 0 20px ${cat.color}30` : undefined,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{cat.label}</span>
                </div>
                {pred ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold" style={{ color: cat.color }}>
                        {pred.changePercent > 0 ? "+" : ""}{pred.changePercent}%
                      </span>
                      <span className="text-xs">{pred.trend === "rising" ? "📈" : pred.trend === "declining" ? "📉" : "➡️"}</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">{pred.forecastPeriod}</div>
                    <ProgressBar value={pred.confidence} color={cat.color} label="Confidence" />
                  </>
                ) : (
                  <div className="text-xs text-[var(--text-muted)] mt-2">Klik &ldquo;Jalankan Prediksi&rdquo; untuk melihat hasil</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Prediction Chart */}
        {hasRun && currentPrediction && (
          <div className="glass-card p-6 animate-fadeInUp">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                  Prediksi Permintaan: {CATEGORIES.find(c => c.value === selectedCategory)?.label}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Indeks permintaan · Historis + AI Forecast (confidence interval 90%)
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-indigo-500 rounded" /><span className="text-[var(--text-muted)]">Aktual</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded" style={{ background: "#10b981" }} /><span className="text-[var(--text-muted)]">Prediksi AI</span></div>
              </div>
            </div>
            {mounted && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={combinedData}>
                  <defs>
                    <linearGradient id="actualGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="predGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(value) => [value !== null && value !== undefined ? String(value) : "—", ""]}
                  />
                  <Area type="monotone" dataKey="actual" name="Aktual" stroke="#6366f1" fill="url(#actualGrad2)" strokeWidth={2} connectNulls />
                  <Area type="monotone" dataKey="predicted" name="Prediksi AI" stroke="#10b981" fill="url(#predGrad2)" strokeWidth={2} strokeDasharray="5 3" connectNulls />
                  <Area type="monotone" dataKey="upper" name="Batas Atas" stroke="rgba(16,185,129,0.3)" fill="none" strokeWidth={1} strokeDasharray="2 2" connectNulls />
                  <Area type="monotone" dataKey="lower" name="Batas Bawah" stroke="rgba(16,185,129,0.3)" fill="none" strokeWidth={1} strokeDasharray="2 2" connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* AI Insights */}
        {hasRun && currentPrediction && (
          <div className="glass-card p-6 animate-fadeInUp">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 font-heading">Analisis AI</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Tren</div>
                <div className="text-lg font-bold text-[var(--text-primary)] capitalize">{currentPrediction.trend === "rising" ? "📈 Naik" : currentPrediction.trend === "declining" ? "📉 Turun" : "➡️ Stabil"}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">Perubahan {currentPrediction.changePercent > 0 ? "+" : ""}{currentPrediction.changePercent}% dalam periode forecast</div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)" }}>
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Demand Saat Ini vs Prediksi</div>
                <div className="text-lg font-bold text-[var(--text-primary)]">{currentPrediction.currentDemand} → {currentPrediction.predictedDemand}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">Indeks permintaan rata-rata</div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Faktor Musiman</div>
                {currentPrediction.seasonalFactors.length > 0 ? (
                  <div className="space-y-1">
                    {currentPrediction.seasonalFactors.map((f, i) => (
                      <div key={i} className="text-xs text-[var(--text-secondary)]">• {f}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[var(--text-muted)]">Tidak ada faktor musiman signifikan</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
