"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Package, Shield, ArrowUpRight, Trash2, Check, X, X as XIcon, Activity, Wallet, FileText, Edit3 } from "lucide-react";
import toast from "react-hot-toast";
import BlockchainExplorer from "@/components/BlockchainExplorer";

interface Stats { totalUsers: number; totalUMKM: number; totalBuyers: number; verifiedUmkm: number; totalProducts: number; totalTransactions: number; totalVolume: number; }
interface UmkmProfile { id: number; user_name: string; business_name: string; email: string; province: string; city: string; verification_status: string; wallet_address: string; reliability_score: number; }
interface UserRow { id: number; name: string; email: string; role: string; wallet_address: string; balance_idr: number; balance_usd: number; is_active: number; created_at: string; }
interface Tx { id: number; tx_hash: string; from_name: string; to_name: string; amount: number; currency: string; type: string; status: string; product_name: string; created_at: string; }
interface ProductRow { id: number; name: string; category: string; description?: string; price_idr: number; price_usd: number; stock: number; unit: string; umkm_name?: string; status: string; image_url?: string; }
interface DocumentRow { id: number; umkm_id?: number; umkm_name?: string; business_name?: string; document_type: string; file_url?: string; status: string; notes?: string; created_at: string; }
interface WalletInfo { wallet_address: string; balance_idr: number; balance_usd: number; }
interface SupplyEvent { id: number; transaction_id: number; status: string; location: string; created_at: string; product_name?: string; tx_hash?: string; }

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t, lang, formatCurrency, formatDate } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [umkmList, setUmkmList] = useState<UmkmProfile[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [tab, setTab] = useState<"overview" | "marketplace" | "umkm" | "users" | "transactions" | "ai_agent" | "documents" | "supply_chain">("overview");
  const [loading, setLoading] = useState(true);

  // AI Agent states
  const [processingAuto, setProcessingAuto] = useState(false);
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);

  // Modals state
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editUmkm, setEditUmkm] = useState<UmkmProfile | null>(null);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);

  // Supply Chain states
  const [supplyEvents, setSupplyEvents] = useState<SupplyEvent[]>([]);
  const [updateTracking, setUpdateTracking] = useState<{ txId: number, productName: string } | null>(null);
  const [trackingForm, setTrackingForm] = useState({ status: "Pesanan Diproses", location: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u, um, t, p, d, sc, w] = await Promise.all([
        fetch("/api/stats", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/admin/users", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/admin/umkm", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/transactions?limit=20", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/products", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/documents", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/tracking", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/wallet", { cache: "no-store" }).then(r => r.json()),
      ]);
      setStats(s); setUsers(Array.isArray(u) ? u : []); setUmkmList(Array.isArray(um) ? um : []); setTxs(Array.isArray(t) ? t : []); setProducts(Array.isArray(p) ? p : []); setDocuments(Array.isArray(d) ? d : []); setSupplyEvents(Array.isArray(sc) ? sc : []); setWallet(w);
    } catch { toast.error(lang === "id" ? "Gagal memuat data" : "Failed to load data"); }
    setLoading(false);
  }, [lang]);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadData();
  }, [loadData]);

  const handleVerify = async (profileId: number, status: string) => {
    await fetch("/api/admin/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId, status }) });
    toast.success(status === "verified" ? (lang === "id" ? "UMKM diverifikasi" : "MSME verified") : (lang === "id" ? "UMKM ditolak" : "MSME rejected"));
    loadData();
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm(lang === "id" ? "Nonaktifkan user ini?" : "Deactivate this user?")) return;
    await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    toast.success(lang === "id" ? "User dinonaktifkan" : "User deactivated");
    loadData();
  };

  const handleVerifyProduct = async (productId: number, status: string) => {
    await fetch("/api/admin/products/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, status }) });
    toast.success(status === "active" ? (lang === "id" ? "Produk disetujui" : "Product approved") : (lang === "id" ? "Produk ditolak" : "Product rejected"));
    loadData();
  };

  const handleVerifyDocument = async (documentId: number, status: string) => {
    await fetch("/api/admin/documents/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId, status }) });
    toast.success(status === "approved" ? (lang === "id" ? "Berkas disetujui" : "Document approved") : (lang === "id" ? "Berkas ditolak" : "Document rejected"));
    loadData();
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    await fetch("/api/admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editUser) });
    toast.success(lang === "id" ? "User diperbarui" : "User updated");
    setEditUser(null);
    loadData();
  };

  const handleSaveUmkm = async () => {
    if (!editUmkm) return;
    await fetch(`/api/admin/umkm/${editUmkm.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editUmkm) });
    toast.success(lang === "id" ? "UMKM diperbarui" : "MSME updated");
    setEditUmkm(null);
    loadData();
  };

  const handleSaveProduct = async () => {
    if (!editProduct) return;
    await fetch(`/api/products/${editProduct.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editProduct.name, category: editProduct.category, price_idr: editProduct.price_idr, price_usd: editProduct.price_usd, stock: editProduct.stock, status: editProduct.status }) });
    toast.success(lang === "id" ? "Produk diperbarui" : "Product updated");
    setEditProduct(null);
    loadData();
  };

  const handleSaveTracking = async () => {
    if (!updateTracking || !trackingForm.location) { 
      toast.error(lang === "id" ? "Lokasi wajib diisi" : "Location is required"); 
      return; 
    }
    toast.loading(lang === "id" ? "Menyimpan ke blockchain..." : "Committing to blockchain...", { id: "saveTrack" });
    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: updateTracking.txId, status: trackingForm.status, location: trackingForm.location })
      });
      if (res.ok) {
        toast.success(lang === "id" ? "Update logistik berhasil dicatat!" : "Logistics milestone committed!", { id: "saveTrack" });
        setUpdateTracking(null);
        setTrackingForm({ status: "Pesanan Diproses", location: "" });
        loadData();
      } else {
        const data = await res.json();
        toast.error(data.error || (lang === "id" ? "Gagal" : "Failed"), { id: "saveTrack" });
      }
    } catch {
      toast.error(lang === "id" ? "Error jaringan" : "Network error", { id: "saveTrack" });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm(lang === "id" ? "Hapus produk ini?" : "Delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(lang === "id" ? "Produk dihapus" : "Product deleted");
      } else {
        toast.error(lang === "id" ? "Gagal menghapus produk (produk memiliki transaksi)" : "Failed to delete product (associated transactions exist)");
      }
      loadData();
    } catch {
      toast.error(lang === "id" ? "Error jaringan" : "Network error");
    }
  };

  const handleAutoVerify = async () => {
    if (!confirm(lang === "id" ? "Otomatis verifikasi UMKM dengan skor reliabilitas >= 80?" : "Auto-verify all MSMEs with reliability score >= 80?")) return;
    setProcessingAuto(true);
    try {
      const res = await fetch("/api/admin/auto-verify", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(lang === "id" ? `Berhasil! ${data.verifiedCount} UMKM telah otomatis diverifikasi.` : `Success! ${data.verifiedCount} MSMEs automatically verified.`);
        loadData();
      } else {
        toast.error(lang === "id" ? "Gagal menjalankan verifikasi otomatis" : "Failed to run automated verification");
      }
    } catch { toast.error(lang === "id" ? "Error jaringan" : "Network error"); }
    setProcessingAuto(false);
  };

  // Compute Anomalous Products (Price < 50% of category average)
  const anomalousProducts = (() => {
    const categories: Record<string, number[]> = {};
    products.forEach(p => {
      if (!categories[p.category]) categories[p.category] = [];
      categories[p.category].push(p.price_idr);
    });
    const avgCategory = Object.fromEntries(
      Object.entries(categories).map(([c, prices]) => [c, prices.reduce((a,b)=>a+b,0)/prices.length])
    );
    return products.filter(p => p.price_idr < avgCategory[p.category] * 0.5);
  })();

  const truncate = (s: string, n: number = 10) => s ? s.slice(0, n) + "..." + s.slice(-4) : "-";

  const statCards = stats ? [
    { label: t("dashboard.total_umkm"), value: stats.totalUMKM, icon: Users },
    { label: lang === "id" ? "Total Buyer" : "Total Buyers", value: stats.totalBuyers, icon: Wallet },
    { label: t("dashboard.verified_umkm"), value: stats.verifiedUmkm, icon: Shield },
    { label: t("dashboard.total_products"), value: stats.totalProducts, icon: Package },
    { label: t("dashboard.total_transactions"), value: stats.totalTransactions, icon: Activity },
    { label: t("dashboard.trade_volume"), value: formatCurrency(stats.totalVolume, "IDR"), icon: ArrowUpRight },
  ] : [];

  const tabStyle = (t2: string): React.CSSProperties => ({
    padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: tab === t2 ? "#000" : "transparent", color: tab === t2 ? "#fff" : "var(--text-secondary)",
    border: tab === t2 ? "1px solid #000" : "1px solid var(--border-color)", borderRadius: 8,
    transition: "all 0.2s ease",
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", color: "var(--text-secondary)" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite" }}>⟳</div><div>{t("common.loading")}</div></div>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          {t("dashboard.title")}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>{lang === "id" ? "Selamat datang," : "Welcome,"} {user?.name}</p>
      </div>

      {/* Admin Wallet Card */}
      <div style={{ background: "#000", borderRadius: 16, padding: 28, color: "#fff", position: "relative", overflow: "hidden", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Wallet size={18} /> <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>{lang === "id" ? "Crypto Wallet Pendapatan Pajak" : "Tax Revenue Crypto Wallet"}</span>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>{lang === "id" ? "Saldo IDR (Pajak PPN 11%)" : "IDR Balance (11% VAT Tax)"}</div>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatCurrency(wallet?.balance_idr || 0, "IDR")}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>{lang === "id" ? "Saldo USD" : "USD Balance"}</div>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatCurrency(wallet?.balance_usd || 0, "USD")}</div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>{lang === "id" ? "Alamat Wallet Terpusat" : "Centralized Wallet Address"}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, background: "rgba(255,255,255,0.1)", padding: "8px 12px", borderRadius: 8 }}>{wallet?.wallet_address || (lang === "id" ? "Memuat..." : "Loading...")}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            ["overview", t("dashboard.tab_overview")],
            ["marketplace", t("dashboard.tab_marketplace")],
            ["umkm", t("dashboard.tab_umkm")],
            ["documents", t("dashboard.tab_documents")],
            ["users", t("dashboard.tab_users")],
            ["transactions", t("dashboard.tab_transactions")],
            ["ai_agent", t("dashboard.tab_ai")],
            ["supply_chain", t("dashboard.tab_supply_chain")]
          ].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key as "overview" | "marketplace" | "umkm" | "users" | "transactions" | "ai_agent" | "documents" | "supply_chain")} style={tabStyle(key)}>{label}</button>
          ))}
        </div>
        <button
          onClick={() => window.print()}
          style={{ padding: "8px 16px", borderRadius: 8, background: "#065f46", color: "#fff", border: "1px solid #10b981", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
          title={t("common.export_pdf")}
        >
          🖨️ {t("common.export_pdf")}
        </button>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {statCards.map((c, i) => (
            <div key={i} style={{
              padding: 20, borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-color)",
              transition: "all 0.3s ease", cursor: "default",
            }}
              onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--text-primary)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
            >
              <c.icon size={20} style={{ color: "var(--text-secondary)", marginBottom: 12 }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {typeof c.value === "number" ? c.value.toLocaleString() : c.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, fontWeight: 500 }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Verifikasi UMKM */}
      {tab === "umkm" && (
        <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
            {lang === "id" ? "Daftar UMKM" : "MSME List"} ({umkmList.length})
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                  {(lang === "id"
                    ? ["Nama Usaha", "Pemilik", "Lokasi", "Status", "Skor", "Wallet", "Aksi"]
                    : ["Business Name", "Owner", "Location", "Status", "Score", "Wallet", "Action"]
                  ).map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {umkmList.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{u.business_name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{u.user_name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{u.city}, {u.province}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: u.verification_status === "verified" ? "var(--text-primary)" : "var(--bg-tertiary)",
                        color: u.verification_status === "verified" ? "var(--text-inverse)" : "var(--text-secondary)",
                        border: "1px solid var(--border-color)",
                      }}>
                        {u.verification_status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: 600 }}>{u.reliability_score}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{truncate(u.wallet_address, 8)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {u.verification_status !== "verified" && (
                        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                          <button onClick={() => handleVerify(u.id, "verified")} style={{ padding: "6px 10px", borderRadius: 6, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            <Check size={12} /> {lang === "id" ? "Setujui" : "Approve"}
                          </button>
                          <button onClick={() => handleVerify(u.id, "rejected")} style={{ padding: "6px 10px", borderRadius: 6, background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            <X size={12} /> {lang === "id" ? "Tolak" : "Reject"}
                          </button>
                        </div>
                      )}
                      <button onClick={() => setEditUmkm(u)} style={{ padding: "6px 10px", borderRadius: 6, background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, width: "100%", justifyContent: "center" }}>
                        <Edit3 size={12} /> {t("common.edit")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Management */}
      {tab === "users" && (
        <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
            {lang === "id" ? "Semua Pengguna" : "All Users"} ({users.length})
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                  {(lang === "id"
                    ? ["Nama", "Email", "Role", "Wallet", "Saldo IDR", "Saldo USD", "Status", "Aksi"]
                    : ["Name", "Email", "Role", "Wallet", "Balance IDR", "Balance USD", "Status", "Action"]
                  ).map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-color)", textTransform: "uppercase" }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>{truncate(u.wallet_address, 8)}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: 500 }}>{formatCurrency(u.balance_idr, "IDR")}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: 500 }}>{formatCurrency(u.balance_usd, "USD")}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, color: u.is_active ? "var(--text-primary)" : "var(--text-muted)" }}>
                        {u.is_active ? (lang === "id" ? "● Aktif" : "● Active") : (lang === "id" ? "○ Nonaktif" : "○ Inactive")}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
                        <button onClick={() => setEditUser(u)} style={{ padding: "5px 8px", borderRadius: 6, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, justifyContent: "center" }}>
                          <Edit3 size={12} /> {t("common.edit")}
                        </button>
                        {u.role !== "admin" && (
                          <button onClick={() => handleDeleteUser(u.id)} style={{ padding: "5px 8px", borderRadius: 6, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, justifyContent: "center" }}>
                            <Trash2 size={12} /> {lang === "id" ? "Nonaktifkan" : "Deactivate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions */}
      {tab === "transactions" && (
        <BlockchainExplorer />
      )}

      {/* Marketplace Product Verification */}
      {tab === "marketplace" && (
        <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
            {lang === "id" ? "Manajemen Marketplace" : "Marketplace Management"} ({products.length})
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                  {(lang === "id"
                    ? ["Produk", "UMKM", "Kategori", "Harga (IDR)", "Stok", "Status", "Aksi"]
                    : ["Product", "MSME", "Category", "Price (IDR)", "Stock", "Status", "Action"]
                  ).map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 12 }}>
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} width={32} height={32} style={{ objectFit: "cover", borderRadius: 4, background: "var(--bg-primary)" }} unoptimized />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: 4, background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={16} /></div>
                      )}
                      {p.name}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{p.umkm_name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{p.category}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: 500 }}>{formatCurrency(p.price_idr, "IDR")}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-primary)" }}>{p.stock}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: p.status === "active" ? "var(--text-primary)" : p.status === "pending" ? "#eab308" : p.status === "delete_pending" ? "#ef4444" : p.status === "inactive" ? "#6b7280" : "var(--bg-tertiary)",
                        color: p.status === "active" ? "var(--text-inverse)" : (p.status === "pending" || p.status === "delete_pending" || p.status === "inactive") ? "#fff" : "var(--text-secondary)",
                        border: "1px solid var(--border-color)",
                      }}>
                        {p.status === "inactive" ? (lang === "id" ? "INACTIVE (Dihapus)" : "INACTIVE (Deleted)") : p.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
                        {p.status === "pending" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => handleVerifyProduct(p.id, "active")} style={{ padding: "6px 10px", borderRadius: 6, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                              <Check size={12} /> {lang === "id" ? "Setujui" : "Approve"}
                            </button>
                            <button onClick={() => handleVerifyProduct(p.id, "rejected")} style={{ padding: "6px 10px", borderRadius: 6, background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                              <X size={12} /> {lang === "id" ? "Tolak" : "Reject"}
                            </button>
                          </div>
                        )}
                        {p.status === "delete_pending" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => handleDeleteProduct(p.id)} style={{ padding: "6px 10px", borderRadius: 6, background: "#ef4444", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                              <Trash2 size={12} /> {lang === "id" ? "Setujui Hapus" : "Approve Delete"}
                            </button>
                            <button onClick={() => handleVerifyProduct(p.id, "active")} style={{ padding: "6px 10px", borderRadius: 6, background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                              <X size={12} /> {lang === "id" ? "Tolak Hapus" : "Reject Delete"}
                            </button>
                          </div>
                        )}
                        {p.status === "inactive" && (
                          <button onClick={() => handleVerifyProduct(p.id, "active")} style={{ padding: "6px 10px", borderRadius: 6, background: "#10b981", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                            🔄 {lang === "id" ? "Aktifkan Kembali (Restore)" : "Reactivate (Restore)"}
                          </button>
                        )}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setEditProduct(p)} style={{ flex: 1, padding: "5px 8px", borderRadius: 6, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, justifyContent: "center" }}>
                            <Edit3 size={12} /> {t("common.edit")}
                          </button>
                          {p.status !== "delete_pending" && p.status !== "inactive" && (
                            <button onClick={() => handleDeleteProduct(p.id)} style={{ flex: 1, padding: "5px 8px", borderRadius: 6, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, justifyContent: "center" }}>
                              <Trash2 size={12} /> {lang === "id" ? "Hapus" : "Delete"}
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Verification */}
      {tab === "documents" && (
        <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
            {lang === "id" ? "Verifikasi Berkas Ekspor" : "Export Document Verification"} ({documents.length})
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                  {(lang === "id"
                    ? ["Nama UMKM", "Tipe Berkas", "Tanggal Unggah", "Status", "Berkas", "Aksi"]
                    : ["MSME Name", "Document Type", "Upload Date", "Status", "Document", "Action"]
                  ).map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {documents.map(d => (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{d.umkm_name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: 500 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}><FileText size={14} style={{ color: "var(--text-secondary)" }} /> {d.document_type}</div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 12 }}>{formatDate(d.created_at)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: d.status === "approved" ? "var(--text-primary)" : d.status === "pending" ? "#eab308" : "var(--bg-tertiary)",
                        color: d.status === "approved" ? "var(--text-inverse)" : d.status === "pending" ? "#fff" : "var(--text-secondary)",
                        border: "1px solid var(--border-color)",
                      }}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <a href={d.file_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }}>
                        {lang === "id" ? "Buka" : "Open"} <ArrowUpRight size={12} />
                      </a>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {d.status === "pending" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => handleVerifyDocument(d.id, "approved")} style={{ padding: "6px 10px", borderRadius: 6, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            <Check size={12} /> {lang === "id" ? "Setujui" : "Approve"}
                          </button>
                          <button onClick={() => handleVerifyDocument(d.id, "rejected")} style={{ padding: "6px 10px", borderRadius: 6, background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            <X size={12} /> {lang === "id" ? "Tolak" : "Reject"}
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.status === "approved" ? (lang === "id" ? "Disetujui" : "Approved") : (lang === "id" ? "Ditolak" : "Rejected")}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>{lang === "id" ? "Belum ada berkas ekspor" : "No export documents yet"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Agent Analytics */}
      {tab === "ai_agent" && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          {/* Main Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Sentiment & Supply Health */}
            <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <Activity size={20} style={{ color: "var(--text-primary)" }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Supply Chain Health Metrics</h3>
                <span style={{ marginLeft: "auto", fontSize: 11, background: "var(--text-primary)", color: "var(--text-inverse)", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>LIVE DATA</span>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
                {[{ label: "Global Demand Index", val: "+14.2%", col: "#22c55e" }, { label: "Fraud Attempt (24h)", val: "0.01%", col: "var(--text-primary)" }, { label: "Logistics Efficiency", val: "92.4%", col: "var(--text-primary)" }].map(m => (
                  <div key={m.label} style={{ padding: 16, background: "var(--bg-primary)", borderRadius: 8, border: "1px solid var(--border-color)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>{m.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: m.col }}>{m.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: 16, background: "rgba(0,0,0,0.02)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>AI Executive Summary</div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {lang === "id"
                    ? <>Neural network mendeteksi lonjakan permintaan <strong>+14.2%</strong> pada produk kategori &quot;Jamu&quot; dari buyer regional Asia Tenggara. Disarankan agar sistem mengirimkan notifikasi otomatis ke UMKM produsen jahe merah dan kunyit asam untuk meningkatkan produksi 2x lipat bulan depan.</>
                    : <>Neural network detected a <strong>+14.2%</strong> surge in demand for &quot;Jamu&quot; category goods from Southeast Asian regional buyers. Automated notifications are recommended to red ginger and turmeric MSMEs to double production output next month.</>}
                </p>
              </div>
            </div>

            {/* Smart Suggestions */}
            <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 20px 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Automated Interventions</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, border: "1px solid var(--border-color)", borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{lang === "id" ? "Verifikasi Otomatis" : "Automated Verification"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{lang === "id" ? "Verifikasi massal UMKM dengan skor reliabilitas > 80." : "Bulk verify MSMEs with reliability score > 80."}</div>
                  </div>
                  <button 
                    onClick={handleAutoVerify}
                    disabled={processingAuto}
                    style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--text-primary)", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: processingAuto ? "not-allowed" : "pointer", opacity: processingAuto ? 0.5 : 1 }}>
                    {processingAuto ? t("common.loading") : (lang === "id" ? "Jalankan Aturan" : "Execute Rule")}
                  </button>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, border: "1px solid var(--border-color)", borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{lang === "id" ? "Deteksi Harga Anomali" : "Price Anomaly Detection"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {lang === "id"
                        ? `Ada ${anomalousProducts.length} produk terdeteksi dijual di bawah harga pasar kategori.`
                        : `${anomalousProducts.length} products detected selling below category market standard.`}
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAnomalyModal(true)}
                    style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--text-primary)", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Review ({anomalousProducts.length})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Anomaly Log */}
          <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", padding: 24, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Shield size={18} style={{ color: "var(--text-primary)" }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Anomaly Detection Log</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {[
                { time: "10:42 AM", msg: lang === "id" ? "Percobaan akses kontrak #4242 ditolak (Invalid Signature)" : "Contract #4242 access attempt rejected (Invalid Signature)", type: "warn" },
                { time: "09:15 AM", msg: lang === "id" ? "Spike volume transaksi dari Buyer #4 (Global Pharma)" : "Transaction volume spike from Buyer #4 (Global Pharma)", type: "info" },
                { time: lang === "id" ? "Kemarin" : "Yesterday", msg: lang === "id" ? "Sertifikat BPOM untuk Produk #12 divalidasi dengan oracle" : "BPOM Certificate for Product #12 validated with oracle", type: "success" },
                { time: lang === "id" ? "Kemarin" : "Yesterday", msg: lang === "id" ? "Terdeteksi pola wash trading pada UMKM #8 (Flagged)" : "Wash trading pattern detected on MSME #8 (Flagged)", type: "error" },
              ].map((log, i) => (
                <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 12, borderBottom: i < 3 ? "1px solid var(--border-subtle)" : "none" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", width: 48 }}>{log.time}</div>
                  <div style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>{log.msg}</div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: log.type === "warn" ? "#f59e0b" : log.type === "error" ? "#ef4444" : log.type === "success" ? "#22c55e" : "#3b82f6", marginTop: 4 }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Supply Chain Tab */}
      {tab === "supply_chain" && (
        <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-color)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Supply Chain Monitor</h2>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {lang === "id" ? "Total Tracking:" : "Total Tracking:"} {supplyEvents.length} {lang === "id" ? "entri" : "entries"}
            </div>
          </div>
          
          <div style={{ padding: "0 24px" }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, marginTop: 24 }}>
              {lang === "id" ? "Pesanan Aktif (Butuh Update)" : "Active Orders (Pending Update)"}
            </h3>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
               {txs.filter(t => t.type === 'purchase').length === 0 && <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{lang === "id" ? "Tidak ada pesanan aktif." : "No active orders."}</div>}
               {txs.filter(t => t.type === 'purchase').map(t => (
                 <div key={t.id} style={{ background: "var(--bg-tertiary)", padding: 16, borderRadius: 12, minWidth: 250, border: "1px solid var(--border-color)", flexShrink: 0 }}>
                   <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{t.product_name}</div>
                   <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 12 }}>Trx ID: #{t.id} • Status: {t.status}</div>
                   <button onClick={() => setUpdateTracking({ txId: t.id, productName: t.product_name })} style={{ width: "100%", padding: "8px", background: "#000", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                     {lang === "id" ? "Update Tracking" : "Update Tracking"}
                   </button>
                 </div>
               ))}
            </div>
          </div>

          <div style={{ padding: 24 }}>
            <div style={{ background: "#000", color: "#fff", padding: 16, borderRadius: 12, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <Shield size={20} style={{ color: "#fff" }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Real-time Immutable Logistics</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                  {lang === "id"
                    ? "Semua pembaruan pengiriman di bawah ini dilindungi secara on-chain dan tidak dapat dimanipulasi oleh pihak mana pun."
                    : "All shipping milestone records below are immutably logged on-chain and protected from third-party tampering."}
                </div>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg-tertiary)", textAlign: "left", color: "var(--text-secondary)" }}>
                  {(lang === "id"
                    ? ["ID Transaksi", "Produk", "Waktu Update", "Status / Lokasi", "Blockchain Hash", "Aksi"]
                    : ["Transaction ID", "Product", "Updated At", "Status / Location", "Blockchain Hash", "Action"]
                  ).map(h => (
                    <th key={h} style={{ padding: "12px 16px", fontWeight: 600, borderBottom: "1px solid var(--border-color)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {supplyEvents.map((ev, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "16px", fontWeight: 600, color: "var(--text-primary)" }}>#{ev.transaction_id}</td>
                    <td style={{ padding: "16px", color: "var(--text-primary)" }}>{ev.product_name}</td>
                    <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{new Date(ev.created_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: 600, color: ev.status === "Pesanan Diterima" ? "#22c55e" : "var(--text-primary)" }}>{ev.status}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{ev.location}</div>
                    </td>
                    <td style={{ padding: "16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>
                      <span onClick={() => window.open(`/verify/${ev.tx_hash}`, '_blank')} style={{ color: "#3b82f6", cursor: "pointer", textDecoration: "underline" }} title={lang === "id" ? "Klik untuk verifikasi" : "Click to verify"}>
                        {ev.tx_hash ? ev.tx_hash.slice(0, 16) + "..." : "-"}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <button
                        onClick={() => window.open(`/verify/${ev.tx_hash}`, '_blank')}
                        style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        {lang === "id" ? "🔍 QR Verifikasi" : "🔍 Verify QR"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      
      {/* Update Tracking Modal */}
      {updateTracking && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 28, width: "100%", maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                {lang === "id" ? "Update Logistik On-Chain" : "Update On-Chain Logistics"}
              </h3>
              <button onClick={() => setUpdateTracking(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><XIcon size={20} /></button>
            </div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>
              {lang === "id" ? "Produk:" : "Product:"} <strong style={{ color: "var(--text-primary)" }}>{updateTracking.productName}</strong>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  {lang === "id" ? "Tahap Pengiriman" : "Milestone Stage"}
                </label>
                <select className="custom-select" value={trackingForm.status} onChange={e => setTrackingForm({...trackingForm, status: e.target.value})}>
                  <option value="Pesanan Diproses">{lang === "id" ? "Pesanan Diproses" : "Order Processed"}</option>
                  <option value="Dikemas">{lang === "id" ? "Dikemas" : "Packaged"}</option>
                  <option value="Diserahkan ke Kurir">{lang === "id" ? "Diserahkan ke Kurir" : "Handed over to Courier"}</option>
                  <option value="Sedang Dikirim (In Transit)">{lang === "id" ? "Sedang Dikirim (In Transit)" : "In Transit"}</option>
                  <option value="Pesanan Diterima">{lang === "id" ? "Pesanan Diterima" : "Order Delivered / Received"}</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  {lang === "id" ? "Lokasi Terkini / Keterangan" : "Current Location / Details"}
                </label>
                <input className="custom-input" value={trackingForm.location} onChange={e => setTrackingForm({...trackingForm, location: e.target.value})} placeholder={lang === "id" ? "Misal: Gudang Transit Jakarta" : "e.g. Jakarta Transit Warehouse"} />
              </div>
              <button onClick={handleSaveTracking} style={{ padding: "12px", background: "#000", color: "#fff", border: "1px solid #000", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, marginTop: 8 }}>
                {lang === "id" ? "Simpan Update (Immutable)" : "Save Milestone (Immutable)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 28, width: "100%", maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                {lang === "id" ? "Edit Pengguna" : "Edit User"}
              </h3>
              <button onClick={() => setEditUser(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><XIcon size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{t("auth.name")}</label><input className="custom-input" value={editUser.name} onChange={e => setEditUser({...editUser, name: e.target.value})} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{t("auth.email")}</label><input className="custom-input" value={editUser.email} onChange={e => setEditUser({...editUser, email: e.target.value})} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Role</label>
                <select className="custom-select" value={editUser.role} onChange={e => setEditUser({...editUser, role: e.target.value})}>
                  <option value="admin">Admin</option><option value="umkm">UMKM</option><option value="buyer">Buyer</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Saldo IDR</label><input type="number" className="custom-input" value={editUser.balance_idr} onChange={e => setEditUser({...editUser, balance_idr: Number(e.target.value)})} /></div>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Saldo USD</label><input type="number" className="custom-input" value={editUser.balance_usd} onChange={e => setEditUser({...editUser, balance_usd: Number(e.target.value)})} /></div>
              </div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Status</label>
                <select className="custom-select" value={editUser.is_active} onChange={e => setEditUser({...editUser, is_active: Number(e.target.value)})}>
                  <option value={1}>{lang === "id" ? "Aktif" : "Active"}</option><option value={0}>{lang === "id" ? "Nonaktif" : "Inactive"}</option>
                </select>
              </div>
              <button onClick={handleSaveUser} style={{ padding: "12px 0", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, marginTop: 8 }}>
                {lang === "id" ? "Simpan Perubahan" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit UMKM Modal */}
      {editUmkm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 28, width: "100%", maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                {lang === "id" ? "Edit Profil UMKM" : "Edit MSME Profile"}
              </h3>
              <button onClick={() => setEditUmkm(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><XIcon size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{t("auth.business_name")}</label><input className="custom-input" value={editUmkm.business_name} onChange={e => setEditUmkm({...editUmkm, business_name: e.target.value})} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{t("auth.province")}</label><input className="custom-input" value={editUmkm.province} onChange={e => setEditUmkm({...editUmkm, province: e.target.value})} /></div>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{t("auth.city")}</label><input className="custom-input" value={editUmkm.city} onChange={e => setEditUmkm({...editUmkm, city: e.target.value})} /></div>
              </div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Reliability Score</label><input type="number" className="custom-input" value={editUmkm.reliability_score} onChange={e => setEditUmkm({...editUmkm, reliability_score: Number(e.target.value)})} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Status</label>
                <select className="custom-select" value={editUmkm.verification_status} onChange={e => setEditUmkm({...editUmkm, verification_status: e.target.value})}>
                  <option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option>
                </select>
              </div>
              <button onClick={handleSaveUmkm} style={{ padding: "12px 0", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, marginTop: 8 }}>
                {lang === "id" ? "Simpan Perubahan" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 28, width: "100%", maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                {lang === "id" ? "Edit Produk" : "Edit Product"}
              </h3>
              <button onClick={() => setEditProduct(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><XIcon size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{lang === "id" ? "Nama Produk" : "Product Name"}</label><input className="custom-input" value={editProduct.name} onChange={e => setEditProduct({...editProduct, name: e.target.value})} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{lang === "id" ? "Kategori" : "Category"}</label><input className="custom-input" value={editProduct.category} onChange={e => setEditProduct({...editProduct, category: e.target.value})} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Harga IDR</label><input type="number" className="custom-input" value={editProduct.price_idr} onChange={e => setEditProduct({...editProduct, price_idr: Number(e.target.value)})} /></div>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Harga USD</label><input type="number" className="custom-input" value={editProduct.price_usd} onChange={e => setEditProduct({...editProduct, price_usd: Number(e.target.value)})} /></div>
              </div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{lang === "id" ? "Stok" : "Stock"}</label><input type="number" className="custom-input" value={editProduct.stock} onChange={e => setEditProduct({...editProduct, stock: Number(e.target.value)})} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Status</label>
                <select className="custom-select" value={editProduct.status} onChange={e => setEditProduct({...editProduct, status: e.target.value})}>
                  <option value="active">Active</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
                </select>
              </div>
              <button onClick={handleSaveProduct} style={{ padding: "12px 0", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, marginTop: 8 }}>
                {lang === "id" ? "Simpan Perubahan" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Review Modal */}
      {showAnomalyModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 28, width: "100%", maxWidth: 640 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Shield size={24} style={{ color: "#ef4444" }} />
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                  {lang === "id" ? "Review Produk Anomali" : "Review Anomalous Products"}
                </h3>
              </div>
              <button onClick={() => setShowAnomalyModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><XIcon size={20} /></button>
            </div>

            {anomalousProducts.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                {lang === "id" ? "Tidak ada produk terdeteksi anomali." : "No anomalous products detected."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "60vh", overflowY: "auto" }}>
                {anomalousProducts.map(p => (
                  <div key={p.id} style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {lang === "id" ? "Kategori:" : "Category:"} {p.category} | {lang === "id" ? "Oleh:" : "By:"} {p.umkm_name}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", marginTop: 8 }}>
                        {formatCurrency(p.price_idr, "IDR")} {lang === "id" ? "(Bawah standar harga rata-rata kategori)" : "(Below category average price threshold)"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                      <button onClick={() => handleDeleteProduct(p.id)} style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <Trash2 size={12} /> Takedown
                      </button>
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
