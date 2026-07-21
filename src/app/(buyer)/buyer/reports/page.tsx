"use client";

import { formatCurrency } from "@/lib/database";

export default function BuyerReportsPage() {
  const monthlyData = [
    { month: "Jan", invested: 2500000000, roi: 8.2 },
    { month: "Feb", invested: 3200000000, roi: 10.1 },
    { month: "Mar", invested: 5000000000, roi: 12.4 },
    { month: "Apr", invested: 7800000000, roi: 15.3 },
    { month: "May", invested: 10500000000, roi: 17.5 },
    { month: "Jun", invested: 15500000000, roi: 19.8 },
  ];

  return (
    <div className="animate-fadeIn">
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Laporan</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Ringkasan performa portofolio investasi Anda</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Investasi", value: formatCurrency(15500000000), color: "#fbbf24", change: "+48%" },
          { label: "ROI Kumulatif", value: "+19.8%", color: "#34d399", change: "+2.3%" },
          { label: "UMKM Aktif", value: "3", color: "#6466f1", change: "+1" },
          { label: "Dividen Diterima", value: formatCurrency(890000000), color: "#38bdf8", change: "+12%" },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "#34d399", marginTop: 4 }}>▲ {stat.change} bulan ini</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📊 Performa Bulanan</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {monthlyData.map(d => (
            <div key={d.month} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderRadius: 10, background: "var(--bg-tertiary)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", width: 35 }}>{d.month}</div>
              <div style={{ flex: 1 }}>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${(d.invested / 15500000000) * 100}%`, background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }} />
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", minWidth: 100, textAlign: "right" }}>{formatCurrency(d.invested)}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#34d399", minWidth: 55, textAlign: "right" }}>+{d.roi}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
