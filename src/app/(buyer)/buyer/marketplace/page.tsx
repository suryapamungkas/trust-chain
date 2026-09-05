"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ShoppingCart,
  Search,
  X as XIcon,
  CheckCircle,
  FileText,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Eye,
  Award,
  Sparkles,
  ExternalLink,
  Package,
  SlidersHorizontal,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { parseCertifications, FALLBACK_PRODUCT_IMAGE } from "@/lib/product-utils";

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price_idr: number;
  price_usd: number;
  stock: number;
  unit: string;
  umkm_name: string;
  umkm_wallet: string;
  status: string;
  image_url?: string;
  certifications?: string;
  blockchain_tx_hash?: string;
}

export default function BuyerMarketplace() {
  const { user, refreshUser } = useAuth();
  const { t, lang, formatCurrency } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  // Quick View Detail Modal
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

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
      const p = await fetch("/api/products", { cache: "no-store" }).then((r) => r.json());
      setProducts(Array.isArray(p) ? p : []);
    } catch {
      toast.error(lang === "id" ? "Gagal memuat katalog produk" : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer for QRIS
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (buyStep === 3 && qrisExpiry > 0) {
      timer = setInterval(() => setQrisExpiry((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [buyStep, qrisExpiry]);

  const handlePurchase = async () => {
    if (!buyProduct) return;
    setBuying(true);
    try {
      const destination = `${buyKota}, ${buyProvinsi}, ${buyNegara} ${buyKodePos}`;
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: buyProduct.id,
          quantity: buyQty,
          currency: buyCurrency,
          destinationCountry: destination,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || (lang === "id" ? "Pembelian gagal" : "Purchase failed"));
        setBuying(false);
        return;
      }

      setBuyStep(4);
      loadData();
      refreshUser();
    } catch {
      toast.error(lang === "id" ? "Terjadi kesalahan saat memproses transaksi" : "Error processing transaction");
    } finally {
      setBuying(false);
    }
  };

  const closePurchaseModal = () => {
    setBuyProduct(null);
    setBuyStep(1);
    setBuyKota("");
    setBuyProvinsi("");
    setBuyNegara("");
    setBuyKodePos("");
  };

  const proceedToInvoice = () => {
    if (!buyKota.trim() || !buyProvinsi.trim() || !buyNegara.trim() || !buyKodePos.trim()) {
      toast.error(
        lang === "id"
          ? "Semua kolom alamat pengiriman wajib diisi"
          : "All shipping address fields are required"
      );
      return;
    }
    setInvoiceId(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
    setBuyStep(2);
  };

  // Categories definition
  const categories = useMemo(() => [
    { key: "all", label: t("marketplace.all_categories") },
    { key: "Jamu Tradisional", label: t("marketplace.cat_jamu") },
    { key: "Ekstrak Herbal", label: t("marketplace.cat_ekstrak") },
    { key: "Minyak Atsiri", label: t("marketplace.cat_minyak") },
    { key: "Teh & Seduhan", label: t("marketplace.cat_teh") },
    { key: "Perawatan Tubuh", label: t("marketplace.cat_perawatan") },
  ], [t]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.umkm_name?.toLowerCase().includes(q);

      const matchCat = catFilter === "all" || p.category === catFilter;
      return matchSearch && matchCat && p.stock > 0;
    });
  }, [products, search, catFilter]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price_asc") list.sort((a, b) => a.price_idr - b.price_idr);
    else if (sortBy === "price_desc") list.sort((a, b) => b.price_idr - a.price_idr);
    else if (sortBy === "stock_desc") list.sort((a, b) => b.stock - a.stock);
    return list;
  }, [filteredProducts, sortBy]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh", color: "var(--text-secondary)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 16, animation: "spin 1s linear infinite" }}>⟳</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{lang === "id" ? "Memuat katalog jamu nusantara..." : "Loading herbal catalog..."}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* HEADER SECTION */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)",
        border: "1px solid var(--border-color)",
        borderRadius: 20,
        padding: "36px 32px",
        marginBottom: 32,
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 20,
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          color: "#10b981",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.03em",
          marginBottom: 12
        }}>
          <Sparkles size={14} />
          <span>{lang === "id" ? "EKSKLUSIF BUYER · TERVERIFIKASI ON-CHAIN" : "BUYER EXCLUSIVE · ON-CHAIN VERIFIED"}</span>
        </div>

        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 32,
          fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
          lineHeight: 1.25,
          marginBottom: 8
        }}>
          {t("marketplace.title")}
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 780, lineHeight: 1.6 }}>
          {t("marketplace.subtitle")}
        </p>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: 16,
        padding: "18px 20px",
        marginBottom: 32,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)"
      }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search Box */}
          <div style={{ position: "relative", flex: "1 1 300px" }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder={t("marketplace.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="custom-input"
              style={{
                width: "100%",
                paddingLeft: 42,
                paddingRight: search ? 36 : 14,
                paddingTop: 12,
                paddingBottom: 12,
                fontSize: 14,
                borderRadius: 10
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 4
                }}
              >
                <XIcon size={16} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SlidersHorizontal size={16} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="custom-select"
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                minWidth: 190
              }}
            >
              <option value="default">{lang === "id" ? "Urutkan: Rekomendasi" : "Sort: Featured"}</option>
              <option value="price_asc">{lang === "id" ? "Harga: Rendah ke Tinggi" : "Price: Low to High"}</option>
              <option value="price_desc">{lang === "id" ? "Harga: Tinggi ke Rendah" : "Price: High to Low"}</option>
              <option value="stock_desc">{lang === "id" ? "Stok: Terbanyak" : "Stock: Highest"}</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingTop: 12,
          borderTop: "1px solid var(--border-subtle)",
          scrollbarWidth: "none"
        }}>
          {categories.map((cat) => {
            const isActive = catFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setCatFilter(cat.key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  border: isActive ? "1px solid var(--text-primary)" : "1px solid var(--border-color)",
                  background: isActive ? "var(--text-primary)" : "var(--bg-tertiary)",
                  color: isActive ? "var(--bg-primary)" : "var(--text-secondary)"
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRODUCT GRID */}
      {sortedProducts.length === 0 ? (
        <div style={{
          padding: "64px 24px",
          textAlign: "center",
          background: "var(--bg-card)",
          borderRadius: 16,
          border: "1px solid var(--border-color)",
          color: "var(--text-muted)"
        }}>
          <ShoppingCart size={48} style={{ opacity: 0.25, marginBottom: 16, margin: "0 auto" }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
            {t("marketplace.empty_title")}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {t("marketplace.empty_desc")}
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 26
        }}>
          {sortedProducts.map((p) => {
            const hasImgError = imgErrors[p.id];
            const certList = parseCertifications(p.certifications);

            return (
              <div
                key={p.id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 16,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--text-primary)";
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 14px 32px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.03)";
                }}
              >
                {/* 4:3 Luxury Image Box */}
                <div style={{
                  position: "relative",
                  aspectRatio: "4 / 3",
                  background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)",
                  overflow: "hidden",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {p.image_url && !hasImgError ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                      onError={() => setImgErrors((prev) => ({ ...prev, [p.id]: true }))}
                      unoptimized
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: 20 }}>
                      <Package size={44} style={{ color: "var(--text-muted)", opacity: 0.6, marginBottom: 8 }} />
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.category}</div>
                    </div>
                  )}

                  {/* Gradient Overlay for Text Readability */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%)",
                    pointerEvents: "none"
                  }} />

                  {/* Category Pill Top-Left */}
                  <div style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    background: "rgba(0, 0, 0, 0.72)",
                    backdropFilter: "blur(8px)",
                    color: "#f4f4f5",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 20,
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    letterSpacing: "0.02em"
                  }}>
                    {p.category}
                  </div>

                  {/* Verified On-Chain Badge Top-Right */}
                  <div style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: "rgba(16, 185, 129, 0.9)",
                    backdropFilter: "blur(6px)",
                    color: "#ffffff",
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "4px 9px",
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)"
                  }}>
                    <ShieldCheck size={12} />
                    <span>Verified</span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* UMKM Seller */}
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <span style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#10b981"
                    }} />
                    <span>{p.umkm_name || "UMKM Mitra"}</span>
                  </div>

                  {/* Product Title */}
                  <h3 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 1.35,
                    marginBottom: 8,
                    minHeight: 46
                  }}>
                    {p.name}
                  </h3>

                  {/* Description Excerpt */}
                  <p style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    marginBottom: 14,
                    flex: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {p.description}
                  </p>

                  {/* Certifications Row */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                    {certList.slice(0, 3).map((c, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 6,
                          background: "var(--bg-tertiary)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-subtle)",
                          letterSpacing: "0.02em"
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Stock Status */}
                  <div style={{
                    fontSize: 11.5,
                    color: "var(--text-muted)",
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span>{t("marketplace.stock_available")}:</span>
                    <strong style={{ color: "var(--text-primary)" }}>
                      {p.stock} {p.unit}
                    </strong>
                  </div>

                  {/* Price & Action Row */}
                  <div style={{
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: 16,
                    marginTop: "auto"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
                      <div>
                        <div style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: 20,
                          fontWeight: 800,
                          color: "var(--text-primary)"
                        }}>
                          {formatCurrency(p.price_idr, "IDR")}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                          {formatCurrency(p.price_usd, "USD")}
                        </div>
                      </div>

                      <button
                        onClick={() => setDetailProduct(p)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#3b82f6",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 8px",
                          borderRadius: 6
                        }}
                      >
                        <Eye size={14} />
                        <span>{t("marketplace.view_details")}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setBuyProduct(p);
                        setBuyQty(1);
                        setBuyCurrency("IDR");
                        setBuyStep(1);
                        setQrisExpiry(180);
                      }}
                      style={{
                        width: "100%",
                        padding: "11px 0",
                        borderRadius: 10,
                        background: "var(--text-primary)",
                        color: "var(--bg-primary)",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.2s ease"
                      }}
                    >
                      <ShoppingCart size={15} />
                      <span>{t("marketplace.buy_now")}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK VIEW DETAIL MODAL */}
      {detailProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            padding: 20
          }}
          onClick={() => setDetailProduct(null)}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: 20,
              maxWidth: 720,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 48px rgba(0,0,0,0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Banner */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#09090b" }}>
              <Image
                src={detailProduct.image_url || FALLBACK_PRODUCT_IMAGE}
                alt={detailProduct.name}
                fill
                style={{ objectFit: "cover" }}
                unoptimized
              />
              <button
                onClick={() => setDetailProduct(null)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "rgba(0,0,0,0.6)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(4px)"
                }}
              >
                <XIcon size={20} />
              </button>
              <div style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                background: "rgba(16, 185, 129, 0.95)",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <ShieldCheck size={16} />
                <span>Terverifikasi On-Chain TrustChain</span>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 28 }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 4 }}>
                {detailProduct.category} · Oleh {detailProduct.umkm_name}
              </div>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 24,
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: 16
              }}>
                {detailProduct.name}
              </h2>

              <div style={{
                background: "var(--bg-tertiary)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12
              }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Harga Resmi
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
                    {formatCurrency(detailProduct.price_idr, "IDR")}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {formatCurrency(detailProduct.price_usd, "USD")} / unit ({detailProduct.unit})
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Stok Tersedia
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>
                    {detailProduct.stock} {detailProduct.unit}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                  {t("marketplace.modal_composition")}
                </h4>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {detailProduct.description}
                </p>
              </div>

              {/* Certifications */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Award size={16} color="#10b981" />
                  <span>{t("marketplace.modal_cert")}</span>
                </h4>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {parseCertifications(detailProduct.certifications).map((c, i) => (
                    <span
                      key={i}
                      style={{
                        padding: "6px 12px",
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#10b981",
                        fontSize: 12,
                        fontWeight: 700,
                        borderRadius: 8
                      }}
                    >
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Blockchain Proof */}
              {detailProduct.blockchain_tx_hash && (
                <div style={{
                  padding: 14,
                  borderRadius: 10,
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  marginBottom: 24
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
                    {t("marketplace.modal_hash")}
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: "#10b981",
                    wordBreak: "break-all"
                  }}>
                    {detailProduct.blockchain_tx_hash}
                  </div>
                  <a
                    href={`/verify?hash=${detailProduct.blockchain_tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      color: "#3b82f6",
                      marginTop: 8,
                      textDecoration: "none",
                      fontWeight: 600
                    }}
                  >
                    <span>Buka Bukti Verifikasi Ledger</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setDetailProduct(null)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {t("marketplace.modal_close")}
                </button>
                <button
                  onClick={() => {
                    const target = detailProduct;
                    setDetailProduct(null);
                    setBuyProduct(target);
                    setBuyQty(1);
                    setBuyCurrency("IDR");
                    setBuyStep(1);
                    setQrisExpiry(180);
                  }}
                  style={{
                    flex: 2,
                    padding: "12px",
                    borderRadius: 10,
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8
                  }}
                >
                  <ShoppingCart size={16} />
                  <span>{t("marketplace.buy_now")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4-STEP PURCHASE MODAL */}
      {buyProduct && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          padding: 16
        }}>
          <div style={{
            background: "var(--bg-secondary)",
            borderRadius: 18,
            border: "1px solid var(--border-color)",
            padding: 28,
            width: "100%",
            maxWidth: 460,
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                {buyStep === 1 && (lang === "id" ? "Tahap 1: Ringkasan Pesanan" : "Step 1: Order Summary")}
                {buyStep === 2 && (lang === "id" ? "Tahap 2: Faktur Tagihan" : "Step 2: Invoice")}
                {buyStep === 3 && (lang === "id" ? "Tahap 3: Pembayaran QRIS / USDT" : "Step 3: QRIS / USDT Payment")}
                {buyStep === 4 && (lang === "id" ? "Tahap 4: Pembayaran Berhasil" : "Step 4: Payment Successful")}
              </h3>
              {buyStep !== 4 && (
                <button onClick={closePurchaseModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                  <XIcon size={20} />
                </button>
              )}
            </div>

            {/* Stepper Progress */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  style={{
                    height: 4,
                    flex: 1,
                    borderRadius: 2,
                    background: step <= buyStep ? "var(--text-primary)" : "var(--bg-tertiary)"
                  }}
                />
              ))}
            </div>

            {/* Step 1: Order Summary */}
            {buyStep === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{
                  padding: 16,
                  borderRadius: 12,
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  gap: 14,
                  alignItems: "center"
                }}>
                  <div style={{ position: "relative", width: 60, height: 60, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#000" }}>
                    <Image src={buyProduct.image_url || FALLBACK_PRODUCT_IMAGE} alt={buyProduct.name} fill style={{ objectFit: "cover" }} unoptimized />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {buyProduct.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>oleh {buyProduct.umkm_name}</div>
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                      {formatCurrency(buyProduct.price_idr, "IDR")} ({formatCurrency(buyProduct.price_usd, "USD")})
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Kuantitas Pembelian ({buyProduct.unit})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={buyProduct.stock}
                    value={buyQty}
                    onChange={(e) => setBuyQty(Math.max(1, Math.min(buyProduct.stock, Number(e.target.value) || 1)))}
                    className="custom-input"
                    style={{ width: "100%" }}
                  />
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    Sisa stok: {buyProduct.stock} {buyProduct.unit}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Mata Uang Pembayaran
                  </label>
                  <select
                    value={buyCurrency}
                    onChange={(e) => setBuyCurrency(e.target.value)}
                    className="custom-select"
                    style={{ width: "100%" }}
                  >
                    <option value="IDR">IDR (QRIS Standar Indonesia)</option>
                    <option value="USDT">USDT (Tether Crypto Wallet)</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Kota</label>
                    <input type="text" value={buyKota} onChange={(e) => setBuyKota(e.target.value)} className="custom-input" style={{ width: "100%" }} placeholder="Contoh: Jakarta" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Provinsi</label>
                    <input type="text" value={buyProvinsi} onChange={(e) => setBuyProvinsi(e.target.value)} className="custom-input" style={{ width: "100%" }} placeholder="Contoh: DKI Jakarta" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Negara</label>
                    <input type="text" value={buyNegara} onChange={(e) => setBuyNegara(e.target.value)} className="custom-input" style={{ width: "100%" }} placeholder="Contoh: Indonesia" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Kode Pos</label>
                    <input type="text" value={buyKodePos} onChange={(e) => setBuyKodePos(e.target.value)} className="custom-input" style={{ width: "100%" }} placeholder="Contoh: 12345" />
                  </div>
                </div>

                <div style={{ padding: 16, borderRadius: 10, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", marginTop: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Subtotal</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {buyCurrency === "USDT" ? `${(buyProduct.price_usd * buyQty).toFixed(2)} USDT` : formatCurrency(buyProduct.price_idr * buyQty, "IDR")}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>PPN (11%)</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {buyCurrency === "USDT" ? `${(buyProduct.price_usd * buyQty * 0.11).toFixed(2)} USDT` : formatCurrency(buyProduct.price_idr * buyQty * 0.11, "IDR")}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border-color)", paddingTop: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Total Tagihan</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                      {buyCurrency === "USDT" ? `${(buyProduct.price_usd * buyQty * 1.11).toFixed(2)} USDT` : formatCurrency(buyProduct.price_idr * buyQty * 1.11, "IDR")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={proceedToInvoice}
                  style={{
                    padding: "12px 0",
                    borderRadius: 10,
                    background: "var(--text-primary)",
                    color: "var(--bg-primary)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    transition: "all 0.2s ease",
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8
                  }}
                >
                  <span>Buat Invoice Pembayaran</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Step 2: Invoice */}
            {buyStep === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ padding: 20, borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-color)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.05 }}><FileText size={100} /></div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 4 }}>
                    FAKTUR ELEKTRONIK ON-CHAIN
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", marginBottom: 16 }}>
                    {invoiceId}
                  </div>

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
                      <span style={{ fontWeight: 600 }}>
                        {buyCurrency === "USDT" ? `${(buyProduct.price_usd * buyQty).toFixed(2)} USDT` : formatCurrency(buyProduct.price_idr * buyQty, "IDR")}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "var(--text-secondary)" }}>PPN 11%</span>
                      <span style={{ fontWeight: 600 }}>
                        {buyCurrency === "USDT" ? `${(buyProduct.price_usd * buyQty * 0.11).toFixed(2)} USDT` : formatCurrency(buyProduct.price_idr * buyQty * 0.11, "IDR")}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-tertiary)", padding: 12, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>TOTAL TAGIHAN</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                      {buyCurrency === "USDT" ? `${(buyProduct.price_usd * buyQty * 1.11).toFixed(2)} USDT` : formatCurrency(buyProduct.price_idr * buyQty * 1.11, "IDR")}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button onClick={() => setBuyStep(1)} style={{ padding: "12px", borderRadius: 8, background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 14, fontWeight: 700, flex: 1 }}>
                    Kembali
                  </button>
                  <button onClick={() => { setBuyStep(3); setQrisExpiry(180); }} style={{ padding: "12px", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span>{buyCurrency === "USDT" ? "Bayar via Crypto" : "Bayar via QRIS"}</span>
                    <QrCode size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {buyStep === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", marginBottom: 6 }}>
                  {buyCurrency === "USDT"
                    ? `Scan barcode berikut untuk mentransfer USDT ke smart contract ledger. Wallet tujuan: ${buyProduct.umkm_wallet?.slice(0, 6)}...${buyProduct.umkm_wallet?.slice(-4)}`
                    : `Scan QRIS berikut menggunakan M-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, Dana).`}
                </div>

                <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "2px solid #e5e7eb", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                    {buyCurrency === "USDT" ? (
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981", letterSpacing: "0.05em" }}>
                        TETHER (USDT) NETWORK
                      </div>
                    ) : (
                      <Image src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" alt="QRIS" width={64} height={26} unoptimized />
                    )}
                  </div>
                  {qrisExpiry > 0 ? (
                    <QRCodeSVG
                      value={
                        buyCurrency === "USDT"
                          ? `ethereum:${buyProduct.umkm_wallet}?amount=${(buyProduct.price_usd * buyQty * 1.11).toFixed(2)}`
                          : `qris://pay?amount=${buyProduct.price_idr * buyQty * 1.11}&to=${buyProduct.umkm_wallet}`
                      }
                      size={200}
                    />
                  ) : (
                    <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", color: "#ef4444", fontWeight: 700, textAlign: "center", borderRadius: 8 }}>
                      Sesi Pembayaran Kedaluwarsa
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {buyCurrency === "USDT"
                    ? `${(buyProduct.price_usd * buyQty * 1.11).toFixed(2)} USDT`
                    : formatCurrency(buyProduct.price_idr * buyQty * 1.11, "IDR")}
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: qrisExpiry > 0 ? "#eab308" : "#ef4444",
                  background: qrisExpiry > 0 ? "rgba(234,179,8,0.1)" : "rgba(239,68,68,0.1)",
                  padding: "6px 14px",
                  borderRadius: 20
                }}>
                  Waktu tersisa: {Math.floor(qrisExpiry / 60)}:{(qrisExpiry % 60).toString().padStart(2, "0")}
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 10, width: "100%" }}>
                  <button onClick={() => setBuyStep(2)} style={{ padding: "12px", borderRadius: 8, background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 14, fontWeight: 700, flex: 1 }}>
                    Batal
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={buying || qrisExpiry <= 0}
                    style={{
                      padding: "12px",
                      borderRadius: 8,
                      background: "#000",
                      color: "#fff",
                      border: "none",
                      cursor: buying || qrisExpiry <= 0 ? "not-allowed" : "pointer",
                      fontSize: 14,
                      fontWeight: 700,
                      flex: 2,
                      opacity: buying || qrisExpiry <= 0 ? 0.5 : 1
                    }}
                  >
                    {buying ? "Memproses..." : buyCurrency === "USDT" ? "Simulasi Transfer USDT" : "Simulasi Bayar QRIS"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {buyStep === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", textAlign: "center", padding: "12px 0" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <CheckCircle size={36} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Pembayaran Berhasil!
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Transaksi pembelian telah dicatat secara permanen di blockchain TrustChain dan diteruskan ke pihak UMKM.
                </p>
                <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: 10, padding: 14, width: "100%", marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Produk Terverifikasi</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{buyProduct.name} x {buyQty}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Dibayar (Inc. PPN)</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>
                    {buyCurrency === "USDT"
                      ? `${(buyProduct.price_usd * buyQty * 1.11).toFixed(2)} USDT`
                      : formatCurrency(buyProduct.price_idr * buyQty * 1.11, "IDR")}
                  </div>
                </div>
                <button
                  onClick={closePurchaseModal}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 10,
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    marginTop: 12
                  }}
                >
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
