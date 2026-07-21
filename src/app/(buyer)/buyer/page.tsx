"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { QRCodeSVG } from "qrcode.react";
import { Wallet, Copy, ArrowUpRight, X as XIcon, Plus, Activity, Package, ArrowRight, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import BlockchainExplorer from "@/components/BlockchainExplorer";

interface WalletData { wallet_address: string; balance_idr: number; balance_usd: number; }
interface Tx { id: number; tx_hash: string; from_name: string; to_name: string; amount: number; currency: string; type: string; product_name: string; created_at: string; status?: string; tracking_status?: string; }
interface TrackingEvent { id: number; status: string; location: string; created_at: string; }

export default function BuyerDashboard() {
  const { user, refreshUser } = useAuth();
  const { t, lang } = useLanguage();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-up modal
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [topUpCurrency, setTopUpCurrency] = useState("IDR");
  const [toppingUp, setToppingUp] = useState(false);
  const [qrisStep, setQrisStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(180);

  // Tracking Modal
  const [showTracking, setShowTracking] = useState(false);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const loadData = async () => {
    try {
      const [w, t] = await Promise.all([
        fetch("/api/wallet").then(r => r.json()),
        fetch("/api/transactions").then(r => r.json()),
      ]);
      setWallet(w); setTxs(Array.isArray(t) ? t : []);
    } catch { toast.error("Gagal memuat data"); }
    setLoading(false);
  };

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (showTopUp && qrisStep === 2 && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showTopUp, qrisStep, timeLeft]);

  const copyAddress = () => {
    if (wallet?.wallet_address) { navigator.clipboard.writeText(wallet.wallet_address); toast.success("Alamat wallet disalin"); }
  };

  const handleTopUp = async () => {
    if (topUpAmount <= 0) { toast.error("Jumlah harus lebih dari 0"); return; }
    setToppingUp(true);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: topUpAmount, currency: topUpCurrency }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Top-up gagal"); setToppingUp(false); return; }
      toast.success("Top-up berhasil!");
      closeTopUp();
      loadData(); refreshUser();
    } catch { toast.error("Top-up gagal"); }
    setToppingUp(false);
  };

  const closeTopUp = () => {
    setShowTopUp(false);
    setQrisStep(1);
    setTimeLeft(180);
    setTopUpAmount(0);
  };

  const openTracking = async (txId: number) => {
    setShowTracking(true);
    setTrackingLoading(true);
    try {
      const res = await fetch(`/api/tracking?transactionId=${txId}`);
      const data = await res.json();
      setTrackingEvents(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Gagal memuat tracking");
    }
    setTrackingLoading(false);
  };

  const fmtCurrency = (v: number) => new Intl.NumberFormat("id-ID").format(v);
  const truncate = (s: string, n: number = 12) => s ? s.slice(0, n) + "..." + s.slice(-4) : "-";
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  const handleUpdateTracking = async (id: number, status: string, location: string) => {
    toast.loading("Mengonfirmasi pesanan...", { id: "track" });
    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id, status, location })
      });
      if (res.ok) {
        toast.success(`Berhasil dikonfirmasi!`, { id: "track" });
        loadData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal", { id: "track" });
      }
    } catch {
      toast.error("Error jaringan", { id: "track" });
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", color: "var(--text-secondary)" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite" }}>⟳</div><div>Memuat marketplace...</div></div>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{t("buyer.title")}</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>{lang === "id" ? "Selamat datang," : "Welcome,"} {user?.name}</p>
      </div>

      {/* Wallet Section */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 28 }}>
        <div style={{ background: "#000", borderRadius: 16, padding: 28, color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Wallet size={18} /> <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>Crypto Wallet</span>
            </div>
            <button onClick={() => { setShowTopUp(true); setQrisStep(1); setTimeLeft(180); setTopUpAmount(0); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s ease" }}>
              <Plus size={14} /> {t("buyer.top_up")}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, opacity: 0.8 }}>{truncate(wallet?.wallet_address || "", 14)}</span>
            <button onClick={copyAddress} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center" }}><Copy size={12} /></button>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>{t("buyer.balance_idr")}</div>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Rp {fmtCurrency(wallet?.balance_idr || 0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>{t("buyer.balance_usd")}</div>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$ {fmtCurrency(wallet?.balance_usd || 0)}</div>
            </div>
          </div>
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>QR Wallet</div>
          {wallet?.wallet_address && <QRCodeSVG value={wallet.wallet_address} size={120} bgColor="transparent" fgColor="var(--text-primary)" />}
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-muted)", wordBreak: "break-all", textAlign: "center", maxWidth: 180 }}>{wallet?.wallet_address}</div>
        </div>
      </div>
      
      {/* Overview & Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <Activity size={16} /> {t("dashboard.total_transactions")}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{txs.length}</div>
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <Package size={16} /> {lang === "id" ? "Total Pembelian (IDR)" : "Total Purchases (IDR)"}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            Rp {fmtCurrency(txs.filter(t => t.type === 'purchase').reduce((acc, curr) => acc + curr.amount, 0))}
          </div>
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowUpRight size={16} /> {lang === "id" ? "Akses Cepat" : "Quick Access"}
          </div>
          <a href="/buyer/marketplace" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg-tertiary)", borderRadius: 8, color: "var(--text-primary)", textDecoration: "none", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            {t("buyer.marketplace")} <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* Riwayat Pesanan Saya */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>{t("buyer.my_orders")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {txs.filter(t => t.type === 'purchase' && t.from_name === user?.name).length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>{lang === "id" ? "Belum ada pembelian." : "No purchases yet."}</div>
          ) : (
            txs.filter(t => t.type === 'purchase' && t.from_name === user?.name).map(tx => (
              <div key={tx.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{tx.product_name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                    Tx Hash: <span onClick={() => window.open(`/verify/${tx.tx_hash}`, '_blank')} style={{ fontFamily: "'JetBrains Mono', monospace", color: "#3b82f6", cursor: "pointer", textDecoration: "underline" }}>{truncate(tx.tx_hash)}</span> • {fmtDate(tx.created_at)}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, display: "inline-block", padding: "2px 6px", borderRadius: 4, background: tx.tracking_status === "Pesanan Diterima" ? "#22c55e" : "var(--bg-tertiary)", color: tx.tracking_status === "Pesanan Diterima" ? "#fff" : "var(--text-secondary)" }}>Status: {tx.tracking_status || tx.status}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => (window as unknown as { openTrustChainChat?: (id: number) => void }).openTrustChainChat?.(2)} style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      💬 Chat Penjual
                    </button>
                    <button onClick={() => openTracking(tx.id)} style={{ padding: "8px 14px", borderRadius: 8, background: "transparent", color: "var(--text-primary)", border: "1px solid var(--text-primary)", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      <Package size={14} /> Lacak Pesanan
                    </button>
                    <button onClick={() => window.open(`/verify/${tx.tx_hash}`, '_blank')} style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      🔍 QR Verifikasi
                    </button>
                  </div>
                  {tx.tracking_status && tx.tracking_status !== "Pesanan Diterima" && tx.tracking_status !== "Pesanan Dibuat" && (
                    <button onClick={() => handleUpdateTracking(tx.id, "Pesanan Diterima", "Alamat Pembeli")} style={{ padding: "8px 16px", borderRadius: 8, background: "#000", color: "#fff", border: "1px solid #000", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      Konfirmasi Diterima
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Global Transparent Ledger */}
      <div style={{ marginBottom: 40 }}>
        <BlockchainExplorer />
      </div>

      {/* Top-Up Modal */}
      {showTopUp && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 28, width: "100%", maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Top Up via QRIS</h3>
              <button onClick={closeTopUp} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><XIcon size={20} /></button>
            </div>
            
            {qrisStep === 1 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nominal (IDR)</label>
                  <input type="number" min={10000} value={topUpAmount} onChange={e => setTopUpAmount(Number(e.target.value))} className="custom-input" placeholder="Minimal Rp 10.000" />
                </div>
                <button onClick={() => setQrisStep(2)} disabled={topUpAmount < 10000} style={{ padding: "12px 0", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: topUpAmount >= 10000 ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 700, marginTop: 8 }}>
                  Lanjut Buat QRIS
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "var(--bg-primary)", padding: 20, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid var(--border-color)", gap: 12, opacity: timeLeft === 0 ? 0.5 : 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>QRIS TrustChain</div>
                  <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
                    <QRCodeSVG value={`qris://topup?amount=${topUpAmount}&wallet=${wallet?.wallet_address}`} size={160} />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: timeLeft <= 30 ? "#ff4444" : "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center" }}>
                    Scan menggunakan aplikasi Mobile Banking atau e-Wallet favorit Anda
                  </div>
                </div>

                {timeLeft > 0 ? (
                  <button onClick={() => { setTopUpCurrency("IDR"); handleTopUp(); }} disabled={toppingUp} style={{ padding: "12px 0", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, marginTop: 8 }}>
                    {toppingUp ? "Memproses..." : "Simulasi Bayar QRIS"}
                  </button>
                ) : (
                  <button onClick={() => { setQrisStep(1); setTimeLeft(180); }} style={{ padding: "12px 0", borderRadius: 8, background: "rgba(255,0,0,0.1)", color: "#ff4444", border: "1px solid rgba(255,0,0,0.2)", cursor: "pointer", fontSize: 14, fontWeight: 700, marginTop: 8 }}>
                    QRIS Kadaluarsa - Buat Ulang
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTracking && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 28, width: "100%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Package size={24} style={{ color: "var(--text-primary)" }} />
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Lacak Pesanan</h3>
              </div>
              <button onClick={() => setShowTracking(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><XIcon size={20} /></button>
            </div>

            {trackingLoading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Memuat data blockchain...</div>
            ) : trackingEvents.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Pesanan ini belum diproses oleh UMKM.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
                {/* Vertical Line */}
                <div style={{ position: "absolute", left: 15, top: 20, bottom: 20, width: 2, background: "var(--border-color)", zIndex: 0 }}></div>
                
                {trackingEvents.map((ev, i) => (
                  <div key={ev.id} style={{ display: "flex", gap: 16, padding: "16px 0", position: "relative", zIndex: 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: i === trackingEvents.length - 1 ? "#22c55e" : "var(--bg-tertiary)", border: i === trackingEvents.length - 1 ? "none" : "2px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: i === trackingEvents.length - 1 ? "#fff" : "var(--text-secondary)" }}>
                      {i === trackingEvents.length - 1 ? <CheckCircle size={16} /> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor" }} />}
                    </div>
                    <div style={{ flex: 1, background: "var(--bg-card)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{ev.status}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(ev.created_at).toLocaleString('id-ID')}</div>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>Lokasi: <strong>{ev.location}</strong></div>
                      <div style={{ fontSize: 10, background: "rgba(0,0,0,0.03)", padding: "6px 8px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", border: "1px solid var(--border-subtle)" }}>
                        <span>Hash: {ev.tx_hash ? ev.tx_hash.slice(0, 20) + "..." : "-"}</span>
                        <a href={`/verify/${ev.tx_hash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#10b981", textDecoration: "none", fontWeight: 600 }}>🔍 Verify On-Chain & QR</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
