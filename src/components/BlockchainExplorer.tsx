import { useState, useEffect } from "react";
import { Activity, Box, Search, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { lang, t, formatCurrency } = useLanguage();
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

  const filteredTxs = txs.filter((t) => 
    t.tx_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.from_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.to_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="content-auto" style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-color)", overflow: "hidden", marginTop: 32 }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={20} color="#4ade80" /> {t("explorer.title")}
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            {t("explorer.subtitle")}
          </p>
        </div>
        
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            placeholder={t("explorer.search_placeholder")} 
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
              {[t("explorer.col_block"), t("explorer.col_hash"), t("explorer.col_method"), t("explorer.col_from"), "", t("explorer.col_to"), t("explorer.col_value"), t("explorer.col_age"), t("explorer.col_verify")].map((h, i) => (
                <th key={i} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--border-color)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && txs.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>{t("explorer.loading")}</td></tr>
            ) : filteredTxs.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>{t("explorer.empty")}</td></tr>
            ) : (
              filteredTxs.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s ease" }}
                    onMouseOver={e => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Box size={12} color="var(--text-muted)" /> {tx.block_number || "-"}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                    <span onClick={() => window.open(`/verify/${tx.tx_hash}`, '_blank')} style={{ color: "#3b82f6", cursor: "pointer", textDecoration: "underline" }} title={lang === "id" ? "Klik untuk verifikasi publik" : "Click for public verification"}>
                      {truncate(tx.tx_hash, 10, 8)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {tx.type.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                    {tx.from_address ? <span title={tx.from_address}>{truncate(tx.from_address)}</span> : "-"}
                  </td>
                  <td style={{ padding: "12px 4px", color: "var(--text-muted)" }}>
                    {tx.to_address ? <ArrowRight size={14} /> : ""}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                    {tx.to_address ? <span title={tx.to_address}>{truncate(tx.to_address)}</span> : "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {formatCurrency(tx.amount, tx.currency)}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 11 }}>
                    {new Date(tx.created_at).toLocaleTimeString(lang === "id" ? "id-ID" : "en-US")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => window.open(`/verify/${tx.tx_hash}`, '_blank')}
                      style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                      title={lang === "id" ? "Lihat Verifikasi & QR Code" : "View Verification & QR Code"}
                    >
                      {t("explorer.verify_btn")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "12px 24px", borderTop: "1px solid var(--border-color)", fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} /> {t("explorer.live_updates")}
      </div>
      <style>{`@keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
