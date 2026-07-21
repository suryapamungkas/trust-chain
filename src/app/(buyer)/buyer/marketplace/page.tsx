"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, Search, X as XIcon, CheckCircle, FileText, QrCode, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";

interface Product { id: number; name: string; category: string; description: string; price_idr: number; price_usd: number; stock: number; unit: string; umkm_name: string; umkm_wallet: string; status: string; image_url?: string; }

export default function BuyerMarketplace() {
  const { user, refreshUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Purchase modal
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [buyQty, setBuyQty] = useState(1);
  const [buyCurrency, setBuyCurrency] = useState("IDR");
  const [buying, setBuying] = useState(false);
  const [buyStep, setBuyStep] = useState(1);
  const [qrisExpiry, setQrisExpiry] = useState(180); // 3 minutes
  const [invoiceId, setInvoiceId] = useState("");
  const [buyKota, setBuyKota] = useState("");
  const [buyProvinsi, setBuyProvinsi] = useState("");
  const [buyNegara, setBuyNegara] = useState("");
  const [buyKodePos, setBuyKodePos] = useState("");

  const loadData = async () => {
    try {
      const p = await fetch("/api/products").then(r => r.json());
      setProducts(Array.isArray(p) ? p : []);
    } catch { toast.error("Gagal memuat data"); }
    setLoading(false);
  };

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { loadData(); }, []);

  // Timer for QRIS
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (buyStep === 3 && qrisExpiry > 0) {
      timer = setInterval(() => setQrisExpiry(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [buyStep, qrisExpiry]);

  const handlePurchase = async () => {
    if (!buyProduct) return;
    setBuying(true);
    try {
      const destination = `${buyKota}, ${buyProvinsi}, ${buyNegara} ${buyKodePos}`;
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: buyProduct.id, quantity: buyQty, currency: buyCurrency, destinationCountry: destination }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Pembelian gagal"); setBuying(false); return; }
      
      // Move to success step
      setBuyStep(4);
      loadData(); refreshUser();
    } catch { toast.error("Pembelian gagal"); }
    setBuying(false);
  };

  const closePurchaseModal = () => {
    setBuyProduct(null);
    setBuyStep(1);
    setBuyKota(""); setBuyProvinsi(""); setBuyNegara(""); setBuyKodePos("");
  };

  const proceedToInvoice = () => {
    if (!buyKota.trim() || !buyProvinsi.trim() || !buyNegara.trim() || !buyKodePos.trim()) { toast.error("Semua kolom alamat pengiriman wajib diisi"); return; }
    setInvoiceId(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
    setBuyStep(2);
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || p.category === catFilter;
    return matchSearch && matchCat && p.stock > 0;
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const fmtCurrency = (v: number) => new Intl.NumberFormat("id-ID").format(v);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", color: "var(--text-secondary)" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite" }}>⟳</div><div>Memuat marketplace...</div></div>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Marketplace Buyer</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Beli suplai bahan baku atau produk yang telah terverifikasi on-chain.</p>
      </div>

      {/* Marketplace */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
            <ShoppingCart size={20} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />Semua Produk ({filteredProducts.length})
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." className="custom-input" style={{ paddingLeft: 36, width: 220 }} />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="custom-select" style={{ minWidth: 140 }}>
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
            <ShoppingCart size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div>Tidak ada produk ditemukan</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filteredProducts.map(p => (
              <div key={p.id} style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", transition: "all 0.2s ease", display: "flex", flexDirection: "column", overflow: "hidden" }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--text-primary)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
              >
                {p.image_url ? (
                  <div style={{ width: "100%", height: 180, background: `url(${p.image_url}) center/cover no-repeat`, borderBottom: "1px solid var(--border-color)" }} />
                ) : (
                  <div style={{ width: "100%", height: 180, background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--border-color)" }}>
                    <ShoppingCart size={40} style={{ opacity: 0.2 }} />
                  </div>
                )}
                <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{p.name}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "var(--bg-tertiary)", color: "var(--text-secondary)", fontWeight: 600, border: "1px solid var(--border-color)" }}>{p.category}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>oleh {p.umkm_name}</span>
                    </div>
                  </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5, flex: 1 }}>{p.description?.slice(0, 80)}{p.description?.length > 80 ? "..." : ""}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Rp {fmtCurrency(p.price_idr)}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>$ {p.price_usd}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "right" }}>
                    <div style={{ fontWeight: 600 }}>{p.stock} {p.unit}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>tersedia</div>
                  </div>
                </div>
                <button onClick={() => { setBuyProduct(p); setBuyQty(1); setBuyCurrency("IDR"); setBuyStep(1); setQrisExpiry(180); }} style={{ width: "100%", padding: "10px 0", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s ease" }}>
                  <ShoppingCart size={14} /> Beli Sekarang
                </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4-Step Purchase Modal */}
      {buyProduct && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 28, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", maxHeight: "90vh", overflowY: "auto" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                {buyStep === 1 && "Tahap 1: Ringkasan Pesanan"}
                {buyStep === 2 && "Tahap 2: Invoice"}
                {buyStep === 3 && "Tahap 3: Pembayaran QRIS"}
                {buyStep === 4 && "Tahap 4: Pembayaran Berhasil"}
              </h3>
              {buyStep !== 4 && (
                <button onClick={closePurchaseModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><XIcon size={20} /></button>
              )}
            </div>

            {/* Stepper Progress */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {[1, 2, 3, 4].map((step) => (
                <div key={step} style={{ height: 4, flex: 1, borderRadius: 2, background: step <= buyStep ? "var(--text-primary)" : "var(--bg-tertiary)" }} />
              ))}
            </div>

            {/* Step 1: Order Summary */}
            {buyStep === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ padding: 16, borderRadius: 10, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{buyProduct.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>oleh {buyProduct.umkm_name}</div>
                  <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                    Rp {fmtCurrency(buyProduct.price_idr)} / {buyProduct.price_usd} USDT per {buyProduct.unit}
                  </div>
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Kuantitas Pembelian ({buyProduct.unit})</label>
                  <input type="number" min={1} max={buyProduct.stock} value={buyQty} onChange={e => setBuyQty(Number(e.target.value))} className="custom-input" style={{ width: "100%" }} />
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Sisa stok: {buyProduct.stock}</div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Mata Uang Pembayaran</label>
                  <select value={buyCurrency} onChange={e => setBuyCurrency(e.target.value)} className="custom-select" style={{ width: "100%" }}>
                    <option value="IDR">IDR (QRIS)</option>
                    <option value="USDT">USDT (Crypto Wallet)</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Kota</label>
                    <input type="text" value={buyKota} onChange={e => setBuyKota(e.target.value)} className="custom-input" style={{ width: "100%" }} placeholder="Contoh: Jakarta" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Provinsi</label>
                    <input type="text" value={buyProvinsi} onChange={e => setBuyProvinsi(e.target.value)} className="custom-input" style={{ width: "100%" }} placeholder="Contoh: DKI Jakarta" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Negara</label>
                    <input type="text" value={buyNegara} onChange={e => setBuyNegara(e.target.value)} className="custom-input" style={{ width: "100%" }} placeholder="Contoh: Indonesia" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Kode Pos</label>
                    <input type="text" value={buyKodePos} onChange={e => setBuyKodePos(e.target.value)} className="custom-input" style={{ width: "100%" }} placeholder="Contoh: 12345" />
                  </div>
                </div>

                <div style={{ padding: 16, borderRadius: 10, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Subtotal</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{buyCurrency === "USDT" ? `${buyProduct.price_usd * buyQty} USDT` : `Rp ${fmtCurrency(buyProduct.price_idr * buyQty)}`}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>PPN (11%)</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{buyCurrency === "USDT" ? `${(buyProduct.price_usd * buyQty * 0.11).toFixed(2)} USDT` : `Rp ${fmtCurrency(buyProduct.price_idr * buyQty * 0.11)}`}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border-color)", paddingTop: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Total Tagihan</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{buyCurrency === "USDT" ? `${(buyProduct.price_usd * buyQty * 1.11).toFixed(2)} USDT` : `Rp ${fmtCurrency(buyProduct.price_idr * buyQty * 1.11)}`}</span>
                  </div>
                </div>

                <button onClick={proceedToInvoice} style={{ padding: "12px 0", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "all 0.2s ease", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  Buat Invoice <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Step 2: Invoice */}
            {buyStep === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ padding: 20, borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-color)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.05 }}><FileText size={100} /></div>
                  
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 4 }}>INVOICE TAGIHAN</div>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", marginBottom: 16 }}>{invoiceId}</div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>PENJUAL (UMKM)</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{buyProduct.umkm_name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>PEMBELI</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 12, marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span>{buyProduct.name} x {buyQty}</span>
                      <span style={{ fontWeight: 600 }}>{buyCurrency === "USDT" ? `${buyProduct.price_usd * buyQty} USDT` : `Rp ${fmtCurrency(buyProduct.price_idr * buyQty)}`}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "var(--text-secondary)" }}>PPN 11%</span>
                      <span style={{ fontWeight: 600 }}>{buyCurrency === "USDT" ? `${(buyProduct.price_usd * buyQty * 0.11).toFixed(2)} USDT` : `Rp ${fmtCurrency(buyProduct.price_idr * buyQty * 0.11)}`}</span>
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-tertiary)", padding: 12, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>TOTAL BAYAR</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{buyCurrency === "USDT" ? `${(buyProduct.price_usd * buyQty * 1.11).toFixed(2)} USDT` : `Rp ${fmtCurrency(buyProduct.price_idr * buyQty * 1.11)}`}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button onClick={() => setBuyStep(1)} style={{ padding: "12px", borderRadius: 8, background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 14, fontWeight: 700, flex: 1 }}>
                    Kembali
                  </button>
                  <button onClick={() => { setBuyStep(3); setQrisExpiry(180); }} style={{ padding: "12px", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {buyCurrency === "USDT" ? "Bayar via Crypto Wallet" : "Bayar via QRIS"} <QrCode size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {buyStep === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", textAlign: "center", marginBottom: 8 }}>
                  {buyCurrency === "USDT" 
                    ? `Scan barcode berikut untuk mengirim USDT ke jaringan terverifikasi. Dana akan masuk ke wallet UMKM: ${buyProduct.umkm_wallet.slice(0,6)}...${buyProduct.umkm_wallet.slice(-4)}`
                    : `Scan QRIS berikut menggunakan aplikasi M-Banking atau E-Wallet Anda. Dana akan masuk ke UMKM.`}
                </div>

                <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "2px solid #e5e7eb", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                    {buyCurrency === "USDT" 
                      ? <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981", letterSpacing: "0.05em" }}>TETHER (USDT) NETWORK</div>
                      : <Image src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" alt="QRIS" width={60} height={24} unoptimized />
                    }
                  </div>
                  {qrisExpiry > 0 ? (
                    <QRCodeSVG 
                      value={buyCurrency === "USDT" ? `ethereum:${buyProduct.umkm_wallet}?amount=${(buyProduct.price_usd * buyQty * 1.11).toFixed(2)}` : `qris://pay?amount=${buyProduct.price_idr * buyQty * 1.11}&to=${buyProduct.umkm_wallet}`} 
                      size={200} 
                    />
                  ) : (
                    <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", color: "#ef4444", fontWeight: 700, textAlign: "center", borderRadius: 8 }}>
                      Sesi Kedaluwarsa
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {buyCurrency === "USDT" ? `${(buyProduct.price_usd * buyQty * 1.11).toFixed(2)} USDT` : `Rp ${fmtCurrency(buyProduct.price_idr * buyQty * 1.11)}`}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: qrisExpiry > 0 ? "#eab308" : "#ef4444", background: qrisExpiry > 0 ? "rgba(234,179,8,0.1)" : "rgba(239,68,68,0.1)", padding: "8px 16px", borderRadius: 20 }}>
                  Waktu tersisa: {Math.floor(qrisExpiry / 60)}:{(qrisExpiry % 60).toString().padStart(2, "0")}
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 12, width: "100%" }}>
                  <button onClick={() => setBuyStep(2)} style={{ padding: "12px", borderRadius: 8, background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 14, fontWeight: 700, flex: 1 }}>
                    Batal
                  </button>
                  <button 
                    onClick={handlePurchase} 
                    disabled={buying || qrisExpiry <= 0} 
                    style={{ padding: "12px", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: (buying || qrisExpiry <= 0) ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, flex: 2, opacity: (buying || qrisExpiry <= 0) ? 0.5 : 1 }}
                  >
                    {buying ? "Memproses..." : (buyCurrency === "USDT" ? "Simulasi Transfer USDT" : "Simulasi Bayar QRIS")}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {buyStep === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", textAlign: "center", padding: "12px 0" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pembayaran Berhasil!</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Transaksi Anda telah dicatat secara permanen di blockchain dan dana telah diteruskan ke pihak UMKM.
                </p>
                <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 12, width: "100%", marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Produk</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{buyProduct.name} x {buyQty}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Bayar (termasuk PPN)</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{buyCurrency === "USDT" ? `${(buyProduct.price_usd * buyQty * 1.11).toFixed(2)} USDT` : `Rp ${fmtCurrency(buyProduct.price_idr * buyQty * 1.11)}`}</div>
                </div>
                <button onClick={closePurchaseModal} style={{ width: "100%", padding: "12px", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, marginTop: 12 }}>
                  Kembali ke Marketplace
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
