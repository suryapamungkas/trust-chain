"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { parseCertifications, FALLBACK_PRODUCT_IMAGE } from "@/lib/product-utils";
import {
  ShoppingCart,
  Search,
  X as XIcon,
  ShieldCheck,
  Eye,
  Award,
  Sparkles,
  ExternalLink,
  Package,
  SlidersHorizontal,
} from "lucide-react";

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

export default function UmkmMarketplace() {
  const { t, lang, formatCurrency } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const p = await fetch("/api/products?global=true", { cache: "no-store" }).then((r) => r.json());
      setProducts(Array.isArray(p) ? p : []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Categories definition
  const categories = useMemo(() => [
    { key: "all", label: t("marketplace.all_categories") },
    { key: "Jamu Tradisional", label: t("marketplace.cat_jamu") },
    { key: "Ekstrak Herbal", label: t("marketplace.cat_ekstrak") },
    { key: "Minyak Atsiri", label: t("marketplace.cat_minyak") },
    { key: "Teh & Seduhan", label: t("marketplace.cat_teh") },
    { key: "Perawatan Tubuh", label: t("marketplace.cat_perawatan") },
  ], [t]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.umkm_name?.toLowerCase().includes(q);

      const matchCat = catFilter === "all" || p.category === catFilter;
      return matchSearch && matchCat;
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
          <div style={{ fontSize: 16, fontWeight: 600 }}>{lang === "id" ? "Memuat katalog marketplace..." : "Loading marketplace..."}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* HEADER */}
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
          <span>{lang === "id" ? "JARINGAN UMKM NUSANTARA · TERVERIFIKASI" : "NUSANTARA UMKM NETWORK · VERIFIED"}</span>
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
          {lang === "id" ? "Eksplorasi Katalog Jamu Nusantara" : "Explore Nusantara Herbal Catalog"}
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 780, lineHeight: 1.6 }}>
          {lang === "id"
            ? "Pelajari benchmark mutu produk jamu, ekstrak, dan minyak atsiri premium mitra UMKM lain yang tercatat transparan di ledger."
            : "Explore quality benchmarks for premium herbal jamu, extracts, and essential oils recorded transparently in the ledger."}
        </p>
      </div>

      {/* FILTER & SEARCH */}
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

                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%)",
                    pointerEvents: "none"
                  }} />

                  {/* Category Pill */}
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

                  {/* Verified On-Chain Badge */}
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

                  <div style={{
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: 16,
                    marginTop: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 19,
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
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-primary)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <Eye size={14} />
                      <span>{t("marketplace.view_details")}</span>
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
                    Harga Patokan Pasar
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
                    Stok Mitra
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>
                    {detailProduct.stock} {detailProduct.unit}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                  {t("marketplace.modal_composition")}
                </h4>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {detailProduct.description}
                </p>
              </div>

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

              <button
                onClick={() => setDetailProduct(null)}
                style={{
                  width: "100%",
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
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
