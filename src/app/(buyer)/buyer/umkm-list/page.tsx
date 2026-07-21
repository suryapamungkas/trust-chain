"use client";

import { useState, useEffect, useCallback } from "react";
import { UMKMProfile, formatCurrency } from "@/lib/database";

export default function UmkmListPage() {
  const [data, setData] = useState<UMKMProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [category, setCategory] = useState("");
  const [verification, setVerification] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(search && { search }),
        ...(province && { province }),
        ...(category && { category }),
        ...(verification && { verification }),
      });
      const res = await fetch(`/api/umkm?${query}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
        setTotalPages(json.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [page, search, province, category, verification]);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    fetchData();
  };

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            Daftar UMKM
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Eksplorasi UMKM Obat Tradisional potensial</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <input 
              type="text" 
              placeholder="Cari nama UMKM..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            />
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <select 
              value={province} 
              onChange={e => { setLoading(true); setProvince(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            >
              <option value="">Semua Provinsi</option>
              <option value="DKI Jakarta">DKI Jakarta</option>
              <option value="Jawa Barat">Jawa Barat</option>
              <option value="Jawa Tengah">Jawa Tengah</option>
              <option value="Jawa Timur">Jawa Timur</option>
              <option value="Banten">Banten</option>
            </select>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <select 
              value={category} 
              onChange={e => { setLoading(true); setCategory(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            >
              <option value="">Semua Kategori</option>
              <option value="Obat Tradisional">Obat Tradisional</option>
              <option value="Jamu">Jamu</option>
              <option value="Suplemen Herbal">Suplemen Herbal</option>
              <option value="Kosmetik Herbal">Kosmetik Herbal</option>
            </select>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <select 
              value={verification} 
              onChange={e => { setLoading(true); setVerification(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            >
              <option value="">Semua Status</option>
              <option value="verified">Terverifikasi</option>
              <option value="pending">Menunggu</option>
              <option value="unverified">Belum Verifikasi</option>
            </select>
          </div>
          <button type="submit" style={{ padding: "0 20px", borderRadius: 8, background: "#fbbf24", color: "#1e293b", fontWeight: 700, border: "none", cursor: "pointer" }}>
            Cari
          </button>
        </form>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Memuat data...</div>
      ) : data.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Tidak ada UMKM yang ditemukan.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {data.map((umkm, i) => (
            <div key={umkm.id} className="glass-card animate-fadeInUp" style={{ padding: 16, animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `hsl(${Number(umkm.id) % 360}, 70%, 50%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "white", fontWeight: 700 }}>
                  {umkm.businessName?.charAt(0) || "U"}
                </div>
                <span className={`badge ${umkm.verificationStatus === 'verified' ? 'badge-success' : umkm.verificationStatus === 'pending' ? 'badge-warning' : 'badge-primary'}`}>
                  {umkm.verificationStatus === 'verified' ? 'Terverifikasi' : umkm.verificationStatus === 'pending' ? 'Menunggu' : 'Belum Verifikasi'}
                </span>
              </div>
              
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {umkm.businessName}
              </h3>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
                {umkm.category} • {umkm.province}
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                  <span>Reliability Score</span>
                  <span style={{ color: umkm.reliabilityScore >= 80 ? "#34d399" : "#fbbf24", fontWeight: 700 }}>{umkm.reliabilityScore}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${umkm.reliabilityScore}%`, background: umkm.reliabilityScore >= 80 ? "#34d399" : "#fbbf24" }} />
                </div>
              </div>

              <div style={{ padding: "10px", borderRadius: 8, background: "var(--bg-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Omzet Tahunan</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(umkm.annualRevenue)}</div>
                </div>
                {Boolean(umkm.exportReady) && (
                  <span style={{ fontSize: 16 }} title="Siap Ekspor">🌍</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            style={{ padding: "6px 12px", borderRadius: 6, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)", cursor: page === 1 ? "not-allowed" : "pointer" }}
          >
            ←
          </button>
          <span style={{ padding: "6px 12px", color: "var(--text-muted)" }}>Hal {page} dari {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            style={{ padding: "6px 12px", borderRadius: 6, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)", cursor: page === totalPages ? "not-allowed" : "pointer" }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
