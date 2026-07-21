"use client";

import { useState } from "react";

const MOCK_CERTIFICATIONS = [
  { id: "CERT-001", type: "BPOM", name: "Izin Edar BPOM TR", issuer: "Badan Pengawas Obat dan Makanan", issued: "2024-02-15", validUntil: "2029-02-15", status: "active", tx: "0x8f2...c3a" },
  { id: "CERT-002", type: "Halal", name: "Sertifikat Halal MUI", issuer: "BPJPH", issued: "2023-11-10", validUntil: "2027-11-10", status: "active", tx: "0x4e9...b1f" },
  { id: "CERT-003", type: "CPOTB", name: "Sertifikat CPOTB Tingkat 1", issuer: "Direktorat Pengawasan Obat Tradisional BPOM", issued: "2021-05-20", validUntil: "2026-05-20", status: "active", tx: "0x7a3...d9e" },
  { id: "CERT-004", type: "SNI", name: "Standar Nasional Indonesia", issuer: "Badan Standardisasi Nasional", issued: "2024-08-01", validUntil: "2028-08-01", status: "pending", tx: "0x2c5...f8b" },
];

export default function CertificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "expired" | "pending">("all");

  const filtered = MOCK_CERTIFICATIONS.filter(c => activeTab === "all" || c.status === activeTab);
  
  const activeCount = MOCK_CERTIFICATIONS.filter(c => c.status === "active").length;
  const pendingCount = MOCK_CERTIFICATIONS.filter(c => c.status === "pending").length;

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            Manajemen Sertifikasi
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Kelola dokumen legalitas dan sertifikasi UMKM Anda yang tercatat di blockchain</p>
        </div>
        <button style={{ padding: "10px 20px", borderRadius: 8, background: "var(--brand-primary)", color: "white", fontWeight: 700, border: "none", cursor: "pointer" }}>
          + Ajukan Sertifikasi Baru
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div className="stat-card">
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Total Dokumen</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--brand-primary)", margin: "8px 0" }}>{MOCK_CERTIFICATIONS.length}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Sertifikat Aktif</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "#10b981", margin: "8px 0" }}>{activeCount}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Sedang Diproses</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "#fbbf24", margin: "8px 0" }}>{pendingCount}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Kedaluwarsa</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "#f43f5e", margin: "8px 0" }}>0</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Daftar Sertifikasi</h3>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "active", "pending", "expired"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", border: "1px solid var(--border-color)",
                  background: activeTab === tab ? "rgba(16,185,129,0.15)" : "transparent",
                  color: activeTab === tab ? "var(--brand-primary)" : "var(--text-muted)",
                  borderColor: activeTab === tab ? "rgba(16,185,129,0.3)" : "var(--border-color)",
                }}>
                {tab === "all" ? "Semua" : tab === "active" ? "Aktif" : tab === "pending" ? "Proses" : "Expired"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Jenis</th>
                <th>Nama Sertifikat</th>
                <th>Lembaga Penerbit</th>
                <th>Tgl Terbit</th>
                <th>Berlaku s/d</th>
                <th>Status</th>
                <th>Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cert => (
                <tr key={cert.id}>
                  <td style={{ fontWeight: 600 }}>{cert.type}</td>
                  <td style={{ color: "var(--text-primary)" }}>{cert.name}</td>
                  <td>{cert.issuer}</td>
                  <td>{cert.issued}</td>
                  <td>{cert.validUntil}</td>
                  <td>
                    <span className={`badge ${cert.status === 'active' ? 'badge-success' : cert.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                      {cert.status === 'active' ? 'Aktif' : cert.status === 'pending' ? 'Diproses' : 'Expired'}
                    </span>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--brand-primary)" }}>{cert.tx}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Tidak ada sertifikasi dengan status tersebut.</div>
          )}
        </div>
      </div>
    </div>
  );
}
