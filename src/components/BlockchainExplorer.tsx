"use client";

import { useState, useEffect } from "react";
import { Activity, Box, Search, ArrowRight } from "lucide-react";

interface Tx {
  id: number;
  tx_hash: string;
  from_address: string;
  to_address: string;
  amount: number;
  currency: string;
  type: string;
  block_number: number;
  created_at: string;
}

export default function BlockchainExplorer() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/transactions?global=true&limit=20");
      const data = await res.json();
      if (Array.isArray(data)) setTxs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Poll every 10 seconds for "live" feel
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const truncate = (s: string, start = 6, end = 4) => 
    s ? `${s.slice(0, start)}...${s.slice(-end)}` : "-";

  const fmtCurrency = (v: number) => new Intl.NumberFormat("id-ID").format(v);

  const filteredTxs = txs.filter((t) => 
    t.tx_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.from_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.to_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-color)", overflow: "hidden", marginTop: 32 }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={20} color="#4ade80" /> Global Public Ledger
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            Semua transaksi TrustChain tercatat transparan dan tidak dapat diubah (immutable).
          </p>
        </div>
        
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            placeholder="Cari Tx Hash / Address..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom-input"
            style={{ paddingLeft: 34, fontSize: 12, width: 220, height: 36 }}
          />
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary)" }}>
              {["Block", "Tx Hash", "Method", "From", "", "To", "Value", "Age", "Verifikasi"].map((h, i) => (
                <th key={i} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--border-color)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && txs.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Memuat ledger...</td></tr>
            ) : filteredTxs.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Tidak ada transaksi</td></tr>
            ) : (
              filteredTxs.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s ease" }}
                    onMouseOver={e => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Box size={12} color="var(--text-muted)" /> {t.block_number || "-"}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                    <span onClick={() => window.open(`/verify/${t.tx_hash}`, '_blank')} style={{ color: "#3b82f6", cursor: "pointer", textDecoration: "underline" }} title="Klik untuk verifikasi publik">
                      {truncate(t.tx_hash, 10, 8)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {t.type.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                    {t.from_address ? <span title={t.from_address}>{truncate(t.from_address)}</span> : "-"}
                  </td>
                  <td style={{ padding: "12px 4px", color: "var(--text-muted)" }}>
                    {t.to_address ? <ArrowRight size={14} /> : ""}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                    {t.to_address ? <span title={t.to_address}>{truncate(t.to_address)}</span> : "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {t.currency === "USD" ? "$" : "Rp"} {fmtCurrency(t.amount)}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 11 }}>
                    {new Date(t.created_at).toLocaleTimeString("id-ID")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => window.open(`/verify/${t.tx_hash}`, '_blank')}
                      style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                      title="Lihat Verifikasi & QR Code"
                    >
                      🔍 QR / Verifikasi
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "12px 24px", borderTop: "1px solid var(--border-color)", fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} /> Live Updates
      </div>
      <style>{`@keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
