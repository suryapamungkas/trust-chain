"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/database";

const INVESTMENT_PORTFOLIO = [
  { id: "INV-001", umkm: "Batik Sekar Jaya", amount: 2500000000, status: "active", date: "2024-03-15", notes: "Pembayaran tahap 1 selesai" },
  { id: "INV-002", umkm: "Kopi Arabika Gayo Premium", amount: 5000000000, status: "completed", date: "2023-11-10", notes: "ROI 18.7% tercapai" },
  { id: "INV-003", umkm: "Tenun Gringsing Bali", amount: 8000000000, status: "active", date: "2024-05-02", notes: "Menunggu laporan Q2" },
  { id: "INV-004", umkm: "UD Minyak Kelapa Murni", amount: 1500000000, status: "pending", date: "2024-06-20", notes: "Menunggu verifikasi escrow" },
  { id: "INV-005", umkm: "Rendang Minang Authentic", amount: 750000000, status: "completed", date: "2023-08-05", notes: "ROI 12.4% tercapai" },
];

export default function InvestmentsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "pending">("all");

  const totalInvested = INVESTMENT_PORTFOLIO.reduce((s, i) => s + i.amount, 0);
  const activeCount = INVESTMENT_PORTFOLIO.filter(i => i.status === "active").length;
  const completedCount = INVESTMENT_PORTFOLIO.filter(i => i.status === "completed").length;

  const filteredPortfolio = INVESTMENT_PORTFOLIO.filter(i => activeTab === "all" || i.status === activeTab);

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            Investasi Saya
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Kelola portofolio investasi Anda di UMKM</p>
        </div>
        <button style={{ padding: "10px 20px", borderRadius: 8, background: "#fbbf24", color: "#1e293b", fontWeight: 700, border: "none", cursor: "pointer" }}>
          + Investasi Baru
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div className="stat-card">
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Total Investasi</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "#fbbf24", margin: "8px 0" }}>{formatCurrency(totalInvested)}</div>
          <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Dari 5 proyek</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Investasi Aktif</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "#34d399", margin: "8px 0" }}>{activeCount}</div>
          <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Proyek sedang berjalan</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Selesai</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "#60a5fa", margin: "8px 0" }}>{completedCount}</div>
          <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Proyek mengembalikan hasil</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Estimasi ROI Rata-rata</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "#a78bfa", margin: "8px 0" }}>16.2%</div>
          <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Berdasarkan portofolio historis</div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Riwayat Investasi</h3>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "active", "completed", "pending"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", border: "1px solid var(--border-color)",
                  background: activeTab === tab ? "rgba(251,191,36,0.15)" : "transparent",
                  color: activeTab === tab ? "#fbbf24" : "var(--text-muted)",
                  borderColor: activeTab === tab ? "rgba(251,191,36,0.3)" : "var(--border-color)",
                }}>
                {tab === "all" ? "Semua" : tab === "active" ? "Aktif" : tab === "completed" ? "Selesai" : "Pending"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Investasi</th>
                <th>Nama UMKM</th>
                <th>Tanggal</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {filteredPortfolio.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontSize: 12, fontFamily: "monospace" }}>{inv.id}</td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{inv.umkm}</td>
                  <td>{inv.date}</td>
                  <td style={{ fontWeight: 700, color: "#fbbf24" }}>{formatCurrency(inv.amount)}</td>
                  <td>
                    <span className={`badge ${inv.status === "active" ? "badge-success" : inv.status === "completed" ? "badge-primary" : "badge-warning"}`}>
                      {inv.status === "active" ? "Aktif" : inv.status === "completed" ? "Selesai" : "Pending"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{inv.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPortfolio.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Tidak ada investasi dengan status tersebut.</div>
          )}
        </div>
      </div>
    </div>
  );
}
