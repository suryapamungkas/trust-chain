"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { StatusBadge, ProgressBar } from "@/components/UIComponents";
import { mockAIInsights, mockProducts } from "@/lib/database";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell
} from "recharts";

const demandData = [
  { month: "Jan", batik: 82, kopi: 91, keramik: 65, minyak: 78 },
  { month: "Feb", batik: 85, kopi: 88, keramik: 70, minyak: 81 },
  { month: "Mar", batik: 145, kopi: 92, keramik: 72, minyak: 83 },
  { month: "Apr", batik: 178, kopi: 95, keramik: 75, minyak: 86 },
  { month: "Mei", batik: 156, kopi: 89, keramik: 68, minyak: 79 },
  { month: "Jun", batik: 134, kopi: 93, keramik: 71, minyak: 85 },
  { month: "Jul", batik: 112, kopi: 97, keramik: 74, minyak: 88 },
];

const riskData = [
  { category: "Keautentikan", risk: 12, baseline: 25 },
  { category: "Logistik", risk: 28, baseline: 35 },
  { category: "Kualitas", risk: 15, baseline: 30 },
  { category: "Regulasi", risk: 22, baseline: 40 },
  { category: "Iklim", risk: 45, baseline: 50 },
  { category: "Pasokan", risk: 31, baseline: 45 },
];

const fraudData = [
  { week: "W1", alerts: 3, resolved: 3, false_positive: 1 },
  { week: "W2", alerts: 7, resolved: 6, false_positive: 2 },
  { week: "W3", alerts: 5, resolved: 5, false_positive: 1 },
  { week: "W4", alerts: 2, resolved: 2, false_positive: 0 },
  { week: "W5", alerts: 9, resolved: 7, false_positive: 3 },
  { week: "W6", alerts: 4, resolved: 4, false_positive: 1 },
];

const radarData = [
  { subject: 'Supply Chain', A: 94, fullMark: 100 },
  { subject: 'Kualitas', A: 89, fullMark: 100 },
  { subject: 'Sertifikasi', A: 92, fullMark: 100 },
  { subject: 'Ekspor', A: 87, fullMark: 100 },
  { subject: 'Keuangan', A: 83, fullMark: 100 },
  { subject: 'Inovasi', A: 76, fullMark: 100 },
];

export default function AIAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [modelRunning, setModelRunning] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelLogs, setModelLogs] = useState<string[]>([
    "[INFO] TrustChain AI Engine v2.4.1 initialized",
    "[INFO] TensorFlow 2.14 backend loaded",
    "[INFO] 847,293 training records loaded",
    "[INFO] Model: FraudDetector-LSTM-v3 (94.2% accuracy)",
    "[INFO] Model: DemandForcast-Transformer-v2 (89.7% MAPE)",
    "[INFO] All systems operational — awaiting inference",
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const runAIModel = async () => {
    setModelRunning(true);
    setModelProgress(0);
    const logs = [
      "[RUN] Starting fraud detection scan...",
      "[PROC] Loading product embeddings from IPFS...",
      "[PROC] Running LSTM anomaly detection...",
      "[ALERT] Anomaly detected in supply chain node #A7-SBY",
      "[PROC] Cross-referencing with historical patterns...",
      "[PROC] Running demand prediction model...",
      "[INFO] Batik demand Q1 2025: +340% (Ramadan effect)",
      "[INFO] Kopi Gayo demand: Stable +12% YoY",
      "[PROC] Generating risk assessment scores...",
      "[PROC] Updating UMKM reliability scores...",
      "[SUCCESS] AI analysis complete — 3 insights generated",
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      setModelLogs((prev) => [...prev.slice(-8), logs[i]]);
      setModelProgress(((i + 1) / logs.length) * 100);
    }
    setModelRunning(false);
  };

  const unresolvedInsights = mockAIInsights.filter((i) => !i.resolved);

  return (
    <>
      <Topbar title="AI Analytics Engine" subtitle="Kecerdasan buatan untuk deteksi penipuan, prediksi permintaan & pemantauan risiko" />

      <div className="p-6 space-y-6">
        <div className="flex justify-end gap-3">
          <button
            onClick={() => window.print()}
            className="btn-secondary"
            style={{ padding: "8px 16px", borderRadius: 8, background: "#065f46", color: "#fff", border: "1px solid #10b981", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
          >
            🖨️ Export Laporan AI (PDF)
          </button>
        </div>

        {/* AI Model Status */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Model Akurasi", value: "94.2%", sub: "Fraud Detection LSTM", color: "#10b981" },
            { label: "Prediksi MAPE", value: "4.8%", sub: "Demand Forecasting", color: "#6366f1" },
            { label: "Alerts Aktif", value: `${unresolvedInsights.length}`, sub: "Perlu tindak lanjut", color: "#f43f5e" },
            { label: "Produk Dianalisis", value: `${mockProducts.length * 847}`, sub: "Total inference calls", color: "#f59e0b" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="glass-card p-4">
              <div className="text-2xl font-bold mb-1" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Demand Prediction Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">Prediksi Permintaan Produk</h3>
                <p className="text-xs text-[var(--text-muted)]">Indeks permintaan berdasarkan model Transformer (skala 0-200)</p>
              </div>
              <button
                onClick={runAIModel}
                disabled={modelRunning}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-2"
              >
                {modelRunning ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Running...
                  </>
                ) : (
                  "▶ Run Model"
                )}
              </button>
            </div>
            {mounted && (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={demandData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="batik" name="Batik" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="kopi" name="Kopi" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="keramik" name="Keramik" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="minyak" name="Minyak Kelapa" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
            <div className="flex gap-4 mt-3">
              {[
                { label: "Batik", color: "#6366f1" },
                { label: "Kopi", color: "#10b981" },
                { label: "Keramik", color: "#f59e0b" },
                { label: "Minyak Kelapa", color: "#06b6d4" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-3 h-1" style={{ background: color, borderRadius: "2px" }} />
                  <span className="text-xs text-[var(--text-muted)]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Engine Console */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #10b981" }} />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">AI Engine Console</h3>
            </div>
            {modelRunning && (
              <div className="mb-3">
                <ProgressBar value={modelProgress} color="#6366f1" label="Model Progress" />
              </div>
            )}
            <div
              className="rounded-xl p-3 h-48 overflow-auto font-mono text-xs leading-relaxed"
              style={{ background: "#020817", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              {modelLogs.map((log, i) => (
                <div key={i} style={{
                  color: log.includes("[SUCCESS]") ? "#10b981" :
                    log.includes("[ALERT]") ? "#f43f5e" :
                    log.includes("[RUN]") || log.includes("[PROC]") ? "#818cf8" : "#64748b"
                }}>
                  {log}
                </div>
              ))}
              <div className="text-indigo-400 animate-pulse">█</div>
            </div>

            {/* Radar Chart */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-[var(--text-secondary)] mb-2">UMKM Score Radar</div>
              {mounted && (
                <ResponsiveContainer width="100%" height={150}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 9 }} />
                    <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Risk & Fraud Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Monitoring */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 font-heading">Pemantauan Risiko Supply Chain</h3>
            {mounted && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={riskData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" tick={{ fill: "#94a3b8", fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "8px", fontSize: "11px" }} />
                  <Bar dataKey="baseline" name="Baseline Risk" fill="rgba(255,255,255,0.05)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="risk" name="Current Risk" radius={[0, 4, 4, 0]}>
                    {riskData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.risk < 20 ? "#10b981" : entry.risk < 35 ? "#f59e0b" : "#f43f5e"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Fraud Detection */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 font-heading">Deteksi Penipuan (6 Minggu)</h3>
            {mounted && (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={fraudData}>
                  <defs>
                    <linearGradient id="alertsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="alerts" name="Alerts" stroke="#f43f5e" fill="url(#alertsGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" fill="url(#resolvedGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass-card">
          <div className="p-6 pb-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">AI Insights & Rekomendasi</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
            {mockAIInsights.map((insight) => (
              <div key={insight.id} className={`p-6 transition-all ${insight.resolved ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: insight.type === "fraud_detection" ? "rgba(244,63,94,0.15)" :
                        insight.type === "demand_prediction" ? "rgba(16,185,129,0.15)" :
                        insight.type === "risk_monitoring" ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)",
                    }}
                  >
                    <span className="text-lg">
                      {insight.type === "fraud_detection" ? "🚨" :
                       insight.type === "demand_prediction" ? "📈" :
                       insight.type === "risk_monitoring" ? "⚠️" : "🔍"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{insight.title}</h4>
                      <StatusBadge status={insight.severity} />
                      {insight.resolved && <span className="badge badge-success">Resolved</span>}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-3">{insight.description}</p>
                    <div className="p-3 rounded-xl mb-3" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                      <div className="text-xs text-indigo-400 font-semibold mb-1">💡 Rekomendasi AI:</div>
                      <div className="text-xs text-[var(--text-secondary)]">{insight.recommendation}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">Kepercayaan:</span>
                        <div className="w-24">
                          <ProgressBar value={insight.confidence} color={insight.confidence > 80 ? "#10b981" : "#f59e0b"} showValue={false} />
                        </div>
                        <span className="text-xs font-semibold text-[var(--text-primary)]">{insight.confidence}%</span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(insight.timestamp).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                  {!insight.resolved && (
                    <div className="flex gap-2">
                      <button className="btn-secondary text-xs px-3 py-1.5">Abaikan</button>
                      <button className="btn-primary text-xs px-3 py-1.5">Tindak Lanjut</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
