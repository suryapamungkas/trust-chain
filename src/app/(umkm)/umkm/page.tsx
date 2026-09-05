"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { QRCodeSVG } from "qrcode.react";
import { Package, Plus, Edit3, Trash2, Copy, Wallet, X as XIcon, ArrowUpRight, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import BlockchainExplorer from "@/components/BlockchainExplorer";

interface Product { id: number; name: string; category: string; description: string; price_idr: number; price_usd: number; stock: number; unit: string; status: string; blockchain_hash: string; image_url: string; created_at: string; }
interface Profile { id: number; business_name: string; verification_status: string; wallet_address: string; balance_idr: number; balance_usd: number; total_products: number; reliability_score: number; }
interface Tx { id: number; tx_hash: string; from_name: string; to_name: string; amount: number; currency: string; type: string; product_name: string; created_at: string; status?: string; tracking_status?: string; }
interface DocumentItem { id: number; document_type: string; file_url?: string; status: string; notes?: string; created_at: string; }
interface TrackingEvent { id: number; transaction_id: number; status: string; location: string; created_at: string; tx_hash?: string; }

const emptyProduct = { name: "", category: "Jamu", description: "", priceIdr: 0, priceUsd: 0, stock: 0, unit: "pcs", imageUrl: "" };

export default function UmkmDashboard() {
  const { user } = useAuth();
  const { t, lang, formatCurrency, formatDate } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [docForm, setDocForm] = useState({ type: "NIB", url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tracking Modal
  const [showTracking, setShowTracking] = useState(false);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, pr, t, d] = await Promise.all([
        fetch("/api/umkm/profile", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/products", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/transactions", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/documents", { cache: "no-store" }).then(r => r.json()),
      ]);
      setProfile(p); setProducts(Array.isArray(pr) ? pr : []); setTxs(Array.isArray(t) ? t : []); setDocuments(Array.isArray(d) ? d : []);
    } catch { toast.error(lang === "id" ? "Gagal memuat data" : "Failed to load data"); }
    setLoading(false);
  }, [lang]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const copyAddress = () => {
    if (profile?.wallet_address) { 
      navigator.clipboard.writeText(profile.wallet_address); 
      toast.success(lang === "id" ? "Alamat wallet disalin" : "Wallet address copied"); 
    }
  };

  const openTracking = async (txId: number) => {
    setShowTracking(true);
    setTrackingLoading(true);
    try {
      const res = await fetch(`/api/tracking?transactionId=${txId}`);
      const data = await res.json();
      setTrackingEvents(Array.isArray(data) ? data : []);
    } catch {
      toast.error(lang === "id" ? "Gagal memuat tracking" : "Failed to load tracking");
    }
    setTrackingLoading(false);
  };

  const openCreate = () => { setForm(emptyProduct); setEditId(null); setShowModal(true); };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, category: p.category, description: p.description, priceIdr: p.price_idr, priceUsd: p.price_usd, stock: p.stock, unit: p.unit, imageUrl: p.image_url || "" });
    setEditId(p.id); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { 
      toast.error(lang === "id" ? "Nama produk wajib diisi" : "Product name is required"); 
      return; 
    }
    setSaving(true);
    try {
      if (editId) {
        await fetch(`/api/products/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, category: form.category, description: form.description, price_idr: form.priceIdr, price_usd: form.priceUsd, stock: form.stock, unit: form.unit, imageUrl: form.imageUrl }) });
        toast.success(lang === "id" ? "Produk diperbarui" : "Product updated");
      } else {
        await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success(lang === "id" ? "Produk ditambahkan" : "Product added");
      }
      setShowModal(false); loadData();
    } catch { toast.error(lang === "id" ? "Gagal menyimpan" : "Failed to save"); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(lang === "id" ? "Ajukan penghapusan produk ini ke Admin?" : "Submit product deletion request to Admin?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(lang === "id" ? "Pengajuan hapus dikirim ke Admin" : "Deletion request submitted to Admin");
      } else {
        toast.error(lang === "id" ? "Gagal mengajukan penghapusan" : "Failed to submit deletion request");
      }
      loadData();
    } catch {
      toast.error(lang === "id" ? "Error jaringan" : "Network error");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    toast.loading(lang === "id" ? "Mengunggah gambar..." : "Uploading image...", { id: "upload" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      
      if (data.url) {
        setForm(prev => ({ ...prev, imageUrl: data.url }));
        toast.success(lang === "id" ? "Gambar berhasil diunggah" : "Image uploaded successfully", { id: "upload" });
      } else {
        throw new Error(data.error);
      }
    } catch {
      toast.error(lang === "id" ? "Gagal mengunggah gambar" : "Failed to upload image", { id: "upload" });
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.loading(lang === "id" ? "Mengunggah berkas..." : "Uploading document...", { id: "doc-upload" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setDocForm(prev => ({ ...prev, url: data.url }));
        toast.success(lang === "id" ? "Berkas berhasil diunggah" : "Document uploaded successfully", { id: "doc-upload" });
      } else throw new Error(data.error);
    } catch { toast.error(lang === "id" ? "Gagal mengunggah berkas" : "Failed to upload document", { id: "doc-upload" }); }
  };

  const handleSaveDoc = async () => {
    if (!docForm.url) { 
      toast.error(lang === "id" ? "Harap unggah file terlebih dahulu" : "Please upload a file first"); 
      return; 
    }
    setSaving(true);
    try {
      const res = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentType: docForm.type, fileUrl: docForm.url }) });
      if (res.ok) { 
        toast.success(lang === "id" ? "Berkas dikirim untuk diverifikasi" : "Document submitted for verification"); 
        setShowDocModal(false); 
        loadData(); 
      }
      else { toast.error(lang === "id" ? "Gagal mengirim berkas" : "Failed to submit document"); }
    } catch { toast.error(lang === "id" ? "Gagal mengirim berkas" : "Failed to submit document"); }
    setSaving(false);
  };

  const handleDeleteDoc = async (id: number) => {
    if (!confirm(lang === "id" ? "Hapus berkas ini?" : "Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    toast.success(lang === "id" ? "Berkas dihapus" : "Document deleted"); 
    loadData();
  };

  const truncate = (s: string, n: number = 12) => s ? s.slice(0, n) + "..." + s.slice(-4) : "-";

  const handleUpdateTracking = async (id: number, status: string, location: string) => {
    toast.loading(lang === "id" ? "Memperbarui status..." : "Updating status...", { id: "track" });
    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id, status, location })
      });
      if (res.ok) {
        toast.success(lang === "id" ? `Status diperbarui menjadi ${status}` : `Status updated to ${status}`, { id: "track" });
        loadData();
      } else {
        const data = await res.json();
        toast.error(data.error || (lang === "id" ? "Gagal" : "Failed"), { id: "track" });
      }
    } catch {
      toast.error(lang === "id" ? "Error jaringan" : "Network error", { id: "track" });
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", color: "var(--text-secondary)" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite" }}>⟳</div><div>{t("common.loading")}</div></div>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          {t("umkm.title")}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>{profile?.business_name || user?.name} — {profile?.verification_status === "verified" ? `✓ ${t("common.verified")}` : `⏳ ${t("common.pending")}`}</p>
      </div>

      {/* Wallet Card */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div style={{ background: "#000", borderRadius: 16, padding: 28, color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Wallet size={18} /> <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>Crypto Wallet</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, opacity: 0.8 }}>{truncate(profile?.wallet_address || "", 14)}</span>
            <button onClick={copyAddress} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center" }}>
              <Copy size={12} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>{lang === "id" ? "Saldo IDR" : "IDR Balance"}</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatCurrency(profile?.balance_idr || 0, "IDR")}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>{lang === "id" ? "Saldo USD" : "USD Balance"}</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatCurrency(profile?.balance_usd || 0, "USD")}</div>
            </div>
          </div>
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 28, border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>{lang === "id" ? "Scan untuk Menerima Pembayaran" : "Scan to Receive Payment"}</div>
          {profile?.wallet_address && <QRCodeSVG value={profile.wallet_address} size={140} bgColor="transparent" fgColor="var(--text-primary)" />}
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", wordBreak: "break-all", textAlign: "center", maxWidth: 200 }}>{profile?.wallet_address}</div>
        </div>
      </div>

      {/* Products CRUD */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{t("umkm.my_products")} ({products.length})</h2>
          <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <Plus size={16} /> {t("umkm.add_product")}
          </button>
        </div>

        {products.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
            <Package size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div>{lang === "id" ? 'Belum ada produk. Klik "Tambah Produk" untuk memulai.' : 'No products yet. Click "Add Product" to get started.'}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {products.map(p => (
              <div key={p.id} style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", padding: 20, transition: "all 0.2s ease" }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--text-primary)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} width={48} height={48} style={{ objectFit: "cover", borderRadius: 8, background: "var(--bg-primary)" }} unoptimized />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={24} /></div>
                    )}
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{p.name}</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "var(--bg-tertiary)", color: "var(--text-secondary)", fontWeight: 600, border: "1px solid var(--border-color)" }}>{p.category}</span>
                        {p.status === "pending" && (
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#eab308", color: "#fff", fontWeight: 600 }}>Pending</span>
                        )}
                        {p.status === "rejected" && (
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "var(--bg-tertiary)", color: "var(--text-secondary)", fontWeight: 600, border: "1px solid var(--border-color)" }}>{lang === "id" ? "Ditolak" : "Rejected"}</span>
                        )}
                        {p.status === "delete_pending" && (
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#ef4444", color: "#fff", fontWeight: 600 }}>{lang === "id" ? "Menunggu Hapus" : "Pending Deletion"}</span>
                        )}
                        {p.status === "inactive" && (
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#6b7280", color: "#fff", fontWeight: 600 }}>{lang === "id" ? "Dihapus (Inactive)" : "Deleted (Inactive)"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(p)} style={{ padding: 6, borderRadius: 6, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", cursor: "pointer", color: "var(--text-secondary)" }}><Edit3 size={14} /></button>
                    {p.status !== "delete_pending" && p.status !== "inactive" && (
                      <button onClick={() => handleDelete(p.id)} style={{ padding: 6, borderRadius: 6, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", cursor: "pointer", color: "var(--text-secondary)" }}><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>{p.description?.slice(0, 80)}{p.description?.length > 80 ? "..." : ""}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{formatCurrency(p.price_idr, "IDR")}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatCurrency(p.price_usd, "USD")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{p.stock} {p.unit}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{lang === "id" ? "stok tersedia" : "in stock"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pesanan Masuk (Incoming Orders) */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
            {lang === "id" ? "Pesanan Masuk" : "Incoming Orders"}
          </h2>
        </div>

        {txs.filter(t => t.type === 'purchase' && t.to_name === user?.name).length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
            <div>{lang === "id" ? "Belum ada pesanan masuk." : "No incoming orders yet."}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {txs.filter(t => t.type === 'purchase' && t.to_name === user?.name).map(order => (
              <div key={order.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{order.product_name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{lang === "id" ? "Dari:" : "From:"} {order.from_name} • {formatDate(order.created_at)}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8, color: "var(--text-primary)" }}>
                    {order.currency === 'IDR' ? formatCurrency(order.amount, 'IDR') : formatCurrency(order.amount, 'USD')}
                  </div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                   <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                     <span style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, fontWeight: 700, background: order.tracking_status === "Pesanan Dibuat" ? "#eab308" : (order.tracking_status === "Pesanan Diterima" ? "#22c55e" : "#475569"), color: "#ffffff" }}>
                       {order.tracking_status === "Pesanan Dibuat" ? (lang === "id" ? "Menunggu Diproses" : "Awaiting Processing") : (order.tracking_status || order.status)}
                     </span>
                     <button onClick={() => (window as unknown as { openTrustChainChat?: (id: number) => void }).openTrustChainChat?.(3)} style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                       {lang === "id" ? "💬 Chat Pembeli" : "💬 Chat Buyer"}
                     </button>
                     <button onClick={() => openTracking(order.id)} style={{ padding: "4px 8px", borderRadius: 6, background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                       <Package size={12} /> {lang === "id" ? "Lacak" : "Track"}
                     </button>
                   </div>
                   {order.tracking_status === "Pesanan Dibuat" && (
                     <button onClick={() => handleUpdateTracking(order.id, "Pesanan Diproses", "Gudang UMKM")} style={{ padding: "8px 16px", borderRadius: 8, background: "#000", color: "#fff", border: "1px solid #000", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                       {lang === "id" ? "Konfirmasi Pesanan" : "Confirm Order"}
                     </button>
                   )}
                   {order.tracking_status === "Pesanan Diproses" && (
                     <button onClick={() => handleUpdateTracking(order.id, "Dikemas", "Fasilitas Pengemasan UMKM")} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", color: "#000", border: "1px solid #000", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                       {lang === "id" ? "Pesanan Dipacking" : "Pack Order"}
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Documents */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{t("umkm.documents")} ({documents.length})</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, background: "#065f46", color: "#fff", border: "1px solid #10b981", cursor: "pointer", fontSize: 13, fontWeight: 600 }} title={t("common.export_pdf")}>
              🖨️ {t("common.export_pdf")}
            </button>
            <button onClick={() => { setDocForm({ type: "NIB", url: "" }); setShowDocModal(true); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              <Plus size={16} /> {t("umkm.upload_doc")}
            </button>
          </div>
        </div>

        {documents.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
            <FileText size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div>{lang === "id" ? "Belum ada berkas. Unggah dokumen pendukung untuk diverifikasi." : "No documents yet. Upload verification documents."}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {documents.map(d => (
              <div key={d.id} style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{d.document_type}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{formatDate(d.created_at)}</div>
                    </div>
                  </div>
                  {d.status === 'pending' && <button onClick={() => handleDeleteDoc(d.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><Trash2 size={16} /></button>}
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
                  <a href={d.file_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                    {lang === "id" ? "Lihat Berkas" : "View Document"} <ArrowUpRight size={12} />
                  </a>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: d.status === "approved" ? "#34d399" : d.status === "rejected" ? "#ef4444" : "#fbbf24" }}>
                    {d.status === "approved" && <CheckCircle size={14} />}
                    {d.status === "rejected" && <XCircle size={14} />}
                    {d.status === "pending" && <Clock size={14} />}
                    {d.status.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
          {lang === "id" ? "Riwayat Transaksi" : "Transaction History"}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                {(lang === "id"
                  ? ["Tx Hash", "Dari", "Ke", "Produk", "Jumlah", "Tipe", "Tanggal", "Aksi"]
                  : ["Tx Hash", "From", "To", "Product", "Amount", "Type", "Date", "Action"]
                ).map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txs.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-primary)" }}>
                    <span onClick={() => window.open(`/verify/${t.tx_hash}`, '_blank')} style={{ color: "#3b82f6", cursor: "pointer", textDecoration: "underline" }}>
                      {truncate(t.tx_hash, 8)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{t.from_name || "-"}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{t.to_name || "-"}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: 500 }}>{t.product_name || "-"}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {t.currency === "USD" ? formatCurrency(t.amount, "USD") : formatCurrency(t.amount, "IDR")}
                  </td>
                  <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", textTransform: "uppercase" }}>{t.type}</span></td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 12 }}>{t.created_at ? formatDate(t.created_at) : "-"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => window.open(`/verify/${t.tx_hash}`, '_blank')}
                      style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      {lang === "id" ? "🔍 QR Verifikasi" : "🔍 Verify QR"}
                    </button>
                  </td>
                </tr>
              ))}
              {txs.length === 0 && <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>{lang === "id" ? "Belum ada transaksi" : "No transactions yet"}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Global Transparent Ledger */}
      <div style={{ marginBottom: 40 }}>
        <BlockchainExplorer />
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 28, width: "100%", maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                {editId ? (lang === "id" ? "Edit Produk" : "Edit Product") : (lang === "id" ? "Tambah Produk Baru" : "Add New Product")}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><XIcon size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: lang === "id" ? "Nama Produk" : "Product Name", key: "name", type: "text", placeholder: lang === "id" ? "Contoh: Jamu Kunyit Asam" : "e.g. Turmeric Jamu" },
                { label: lang === "id" ? "Kategori" : "Category", key: "category", type: "text", placeholder: lang === "id" ? "Jamu, Suplemen, Obat Luar..." : "Herbal, Supplement, Tonic..." },
                { label: lang === "id" ? "Deskripsi" : "Description", key: "description", type: "text", placeholder: lang === "id" ? "Deskripsi produk..." : "Product description..." },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{f.label}</label>
                  <input value={(form as Record<string, string | number>)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} className="custom-input" placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  {lang === "id" ? "Gambar Produk" : "Product Image"}
                </label>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {form.imageUrl && <Image src={form.imageUrl} alt="Preview" width={40} height={40} style={{ borderRadius: 6, objectFit: "cover" }} unoptimized />}
                  <input type="file" accept="image/*" onChange={handleUpload} style={{ fontSize: 13 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    {lang === "id" ? "Harga IDR" : "Price IDR"}
                  </label>
                  <input type="number" value={form.priceIdr} onChange={e => setForm(prev => ({ ...prev, priceIdr: Number(e.target.value) }))} className="custom-input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    {lang === "id" ? "Harga USD" : "Price USD"}
                  </label>
                  <input type="number" value={form.priceUsd} onChange={e => setForm(prev => ({ ...prev, priceUsd: Number(e.target.value) }))} className="custom-input" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    {lang === "id" ? "Stok" : "Stock"}
                  </label>
                  <input type="number" value={form.stock} onChange={e => setForm(prev => ({ ...prev, stock: Number(e.target.value) }))} className="custom-input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    {lang === "id" ? "Satuan" : "Unit"}
                  </label>
                  <input value={form.unit} onChange={e => setForm(prev => ({ ...prev, unit: e.target.value }))} className="custom-input" placeholder="pcs, botol, kg..." />
                </div>
              </div>
              <button onClick={handleSave} disabled={saving} style={{ padding: "12px 0", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, marginTop: 8, transition: "all 0.2s ease" }}>
                {saving ? t("common.loading") : editId ? (lang === "id" ? "Simpan Perubahan" : "Save Changes") : (lang === "id" ? "Tambahkan Produk" : "Add Product")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showDocModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 28, width: "100%", maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                {lang === "id" ? "Unggah Berkas Ekspor" : "Upload Export Document"}
              </h3>
              <button onClick={() => setShowDocModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><XIcon size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  {lang === "id" ? "Tipe Dokumen" : "Document Type"}
                </label>
                <select value={docForm.type} onChange={e => setDocForm(prev => ({ ...prev, type: e.target.value }))} className="custom-select">
                  <option value="NIB">{lang === "id" ? "Nomor Induk Berusaha (NIB)" : "Business ID Number (NIB)"}</option>
                  <option value="BPOM">{lang === "id" ? "Sertifikat BPOM" : "BPOM Certificate"}</option>
                  <option value="Halal">{lang === "id" ? "Sertifikat Halal" : "Halal Certificate"}</option>
                  <option value="Izin Ekspor">{lang === "id" ? "Izin Ekspor / COO" : "Export License / COO"}</option>
                  <option value="KTP/NPWP">{lang === "id" ? "KTP / NPWP Pemilik" : "Owner ID / Tax Number"}</option>
                  <option value="Lainnya">{lang === "id" ? "Lainnya" : "Other"}</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  {lang === "id" ? "Pilih Berkas" : "Select File"}
                </label>
                <input type="file" onChange={handleDocUpload} style={{ fontSize: 13, display: "block", width: "100%", padding: 10, background: "var(--bg-tertiary)", borderRadius: 8, border: "1px dashed var(--border-color)" }} />
                {docForm.url && <div style={{ marginTop: 8, fontSize: 12, color: "#34d399", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={14} /> {lang === "id" ? "Berkas siap dikirim" : "File ready to upload"}</div>}
              </div>
              <button onClick={handleSaveDoc} disabled={saving || !docForm.url} style={{ padding: "12px 0", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: docForm.url ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 700, marginTop: 8, transition: "all 0.2s ease", opacity: docForm.url ? 1 : 0.5 }}>
                {saving ? t("common.loading") : (lang === "id" ? "Kirim untuk Verifikasi" : "Submit for Verification")}
              </button>
            </div>
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
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                  {lang === "id" ? "Lacak Pesanan" : "Track Order"}
                </h3>
              </div>
              <button onClick={() => setShowTracking(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><XIcon size={20} /></button>
            </div>

            {trackingLoading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                {lang === "id" ? "Memuat data blockchain..." : "Loading blockchain data..."}
              </div>
            ) : trackingEvents.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                {lang === "id" ? "Belum ada log pelacakan." : "No tracking logs yet."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
                <div style={{ position: "absolute", left: 15, top: 20, bottom: 20, width: 2, background: "var(--border-color)", zIndex: 0 }}></div>
                {trackingEvents.map((ev, i) => (
                  <div key={ev.id} style={{ display: "flex", gap: 16, padding: "16px 0", position: "relative", zIndex: 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: i === trackingEvents.length - 1 ? "#22c55e" : "var(--bg-tertiary)", border: i === trackingEvents.length - 1 ? "none" : "2px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: i === trackingEvents.length - 1 ? "#fff" : "var(--text-secondary)" }}>
                      {i === trackingEvents.length - 1 ? <CheckCircle size={16} /> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor" }} />}
                    </div>
                    <div style={{ flex: 1, background: "var(--bg-card)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{ev.status}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(ev.created_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</div>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                        {lang === "id" ? "Lokasi:" : "Location:"} <strong>{ev.location}</strong>
                      </div>
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
