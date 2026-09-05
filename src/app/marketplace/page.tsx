"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Package, ArrowUpRight, Globe, ShieldCheck, Award, Eye, X as XIcon, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { parseCertifications, FALLBACK_PRODUCT_IMAGE } from "@/lib/product-utils";

interface Product {
  id: number;
  name: string;
  category: string;
  description?: string;
  price_idr: number;
  price_usd: number;
  stock: number;
  unit: string;
  umkm_name?: string;
  status: string;
  image_url?: string;
  certifications?: string;
  blockchain_hash?: string;
}

export default function PublicMarketplace() {
  const { lang, setLang, t, formatCurrency } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/api/products?global=true&";
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (category) url += `category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price_asc") return a.price_idr - b.price_idr;
    if (sortBy === "price_desc") return b.price_idr - a.price_idr;
    if (sortBy === "stock_desc") return b.stock - a.stock;
    return 0;
  });

  const categories = [
    { key: "", label: t("marketplace.all_categories") },
    { key: "Jamu Tradisional", label: t("marketplace.cat_jamu") },
    { key: "Ekstrak Herbal", label: t("marketplace.cat_ekstrak") },
    { key: "Minyak Atsiri", label: t("marketplace.cat_minyak") },
    { key: "Teh & Seduhan", label: t("marketplace.cat_teh") },
    { key: "Perawatan Tubuh", label: t("marketplace.cat_perawatan") },
  ];

  return (
    <div className="tc-landing" style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div className="tc-grid-bg" />
      <div className="tc-noise" />

      {/* NAVBAR */}
      <nav className="tc-nav" style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)" }}>
        <div className="tc-nav-inner">
          <div className="tc-nav-left">
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <span className="tc-logo-text">TrustChain</span>
            </Link>
          </div>
          <div className="tc-nav-links">
            <Link href="/">{lang === "id" ? "Beranda" : "Home"}</Link>
            <Link href="/marketplace" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Marketplace</Link>
          </div>
          <div className="tc-nav-right">
            {mounted && (
              <>
                <button
                  onClick={() => setLang(lang === "id" ? "en" : "id")}
                  style={{
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
                >
                  <Globe size={18} /> {lang.toUpperCase()}
                </button>
                <button onClick={toggleTheme} className="tc-theme-btn" aria-label="Toggle theme">
                  {theme === "dark" ? "◐" : "◑"}
                </button>
              </>
            )}
            <Link href="/login" className="tc-btn-outline" style={{ padding: "8px 16px", fontSize: 13 }}>
              {t("auth.login")}
            </Link>
            <Link href="/register" className="tc-btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>
              <span>{t("auth.register")}</span>
              <span className="tc-btn-arrow">↗</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER SECTION */}
      <section style={{ padding: "140px 32px 36px", maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", maxWidth: 860, margin: "0 auto 40px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 24,
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            color: "#10b981",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: 20
          }}>
            <Sparkles size={14} />
            <span>{lang === "id" ? "Katalog Jamu Tradisional Terkurasi" : "Curated Heritage Herbal Catalog"}</span>
          </div>

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: 16
          }}>
            {t("marketplace.title")}
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2vw, 17px)",
            color: "var(--text-secondary)",
            lineHeight: 1.65,
            maxWidth: 720,
            margin: "0 auto"
          }}>
            {t("marketplace.subtitle")}
          </p>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            flexWrap: "wrap",
            marginTop: 24,
            fontSize: 13,
            color: "var(--text-muted)"
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={16} color="#10b981" /> 100% On-Chain Audited
            </span>
            <span>•</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Award size={16} color="#eab308" /> Sertifikasi BPOM & Halal Resmi
            </span>
            <span>•</span>
            <span>{sortedProducts.length} {lang === "id" ? "Produk Warisan Aktif" : "Heritage Products Active"}</span>
          </div>
        </div>

        {/* SEARCH & FILTERS CONTROLS */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 32,
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            {/* Search Input */}
            <div style={{ position: "relative", flex: "1 1 320px" }}>
              <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder={t("marketplace.search_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 46px",
                  borderRadius: 10,
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit"
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
              <Filter size={16} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  fontWeight: 600,
                  outline: "none",
                  fontFamily: "inherit",
                  cursor: "pointer"
                }}
              >
                <option value="default">{lang === "id" ? "Urutkan: Rekomendasi" : "Sort: Featured"}</option>
                <option value="price_asc">{lang === "id" ? "Harga: Rendah ke Tinggi" : "Price: Low to High"}</option>
                <option value="price_desc">{lang === "id" ? "Harga: Tinggi ke Rendah" : "Price: High to Low"}</option>
                <option value="stock_desc">{lang === "id" ? "Stok: Terbanyak" : "Stock: Highest"}</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingTop: 14,
            marginTop: 14,
            borderTop: "1px solid var(--border-subtle)",
            scrollbarWidth: "none"
          }}>
            {categories.map((cat) => {
              const isActive = category === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
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

        {/* PRODUCTS GRID */}
        {loading ? (
          <div style={{ padding: 80, textAlign: "center", color: "var(--text-secondary)" }}>
            <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite" }}>⟳</div>
            <div>{t("common.loading")}</div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div style={{
            padding: 60,
            textAlign: "center",
            border: "1px dashed var(--border-color)",
            borderRadius: 16,
            background: "var(--bg-card)"
          }}>
            <Package size={48} style={{ color: "var(--text-muted)", marginBottom: 16, opacity: 0.5 }} />
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
            gap: 28
          }}>
            {sortedProducts.map((p) => {
              const hasImgError = imgErrors[p.id];
              const certList = parseCertifications(p.certifications);

              return (
                <div
                  key={p.id}
                  className="tc-product-card content-auto"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 16,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--text-primary)";
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = "0 16px 36px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-color)";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.03)";
                  }}
                >
                  {/* IMAGE CONTAINER */}
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
                        style={{
                          objectFit: "cover",
                          transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
                        }}
                        className="tc-product-img"
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
                      background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)",
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
                      <span>{lang === "id" ? "Verified" : "Verified"}</span>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Producer UMKM */}
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
                      <span style={{ letterSpacing: "0.02em" }}>{p.umkm_name || "UMKM Mitra"}</span>
                    </div>

                    {/* Product Name */}
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

                    {/* Description Snippet */}
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
                      color: p.stock > 0 ? "var(--text-muted)" : "#ef4444",
                      marginBottom: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <span>{t("marketplace.stock_available")}:</span>
                      <strong style={{ color: p.stock > 0 ? "var(--text-primary)" : "#ef4444" }}>
                        {p.stock} {p.unit}
                      </strong>
                    </div>

                    {/* Price and CTAs */}
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
                          onClick={() => setSelectedProduct(p)}
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
                            padding: "6px 8px",
                            borderRadius: 6,
                            transition: "background 0.2s ease"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        >
                          <Eye size={14} /> {t("marketplace.view_details")}
                        </button>
                      </div>

                      <Link
                        href="/login"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          background: "var(--text-primary)",
                          color: "var(--bg-primary)",
                          padding: "11px 16px",
                          borderRadius: 8,
                          textDecoration: "none",
                          fontWeight: 700,
                          fontSize: 13.5,
                          transition: "opacity 0.2s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        <span>{t("marketplace.sign_in_to_buy")}</span>
                        <ArrowUpRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* QUICK VIEW DETAIL MODAL */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            padding: 20
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 720,
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-color)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  padding: "4px 10px",
                  borderRadius: 16,
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {selectedProduct.category}
                </span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {selectedProduct.umkm_name}
                </span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-primary)"
                }}
              >
                <XIcon size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "24px 28px" }}>
              <div style={{
                position: "relative",
                aspectRatio: "16 / 9",
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 20,
                background: "#18181b"
              }}>
                {selectedProduct.image_url || FALLBACK_PRODUCT_IMAGE ? (
                  <Image
                    src={selectedProduct.image_url || FALLBACK_PRODUCT_IMAGE}
                    alt={selectedProduct.name}
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <Package size={48} color="var(--text-muted)" />
                  </div>
                )}
              </div>

              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: 12
              }}>
                {selectedProduct.name}
              </h2>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  {t("marketplace.modal_composition")}
                </h4>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {selectedProduct.description}
                </p>
              </div>

              {/* Certifications */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                  {t("marketplace.modal_cert")}
                </h4>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {parseCertifications(selectedProduct.certifications).map((cert, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-color)",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-primary)"
                      }}
                    >
                      <CheckCircle2 size={14} color="#10b981" /> {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Blockchain Hash preview */}
              <div style={{
                padding: "14px 16px",
                borderRadius: 10,
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                marginBottom: 24
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4, letterSpacing: "0.04em" }}>
                  {t("marketplace.modal_hash")}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3b82f6", wordBreak: "break-all" }}>
                  {selectedProduct.blockchain_hash || "0x89f4b7a128cd9938b0051e27a6f3b0e3f9a721c45d"}
                </div>
              </div>

              {/* Pricing & CTA */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid var(--border-color)",
                paddingTop: 20
              }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
                    {formatCurrency(selectedProduct.price_idr, "IDR")}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {formatCurrency(selectedProduct.price_usd, "USD")} • {selectedProduct.stock} {selectedProduct.unit} {t("marketplace.stock_available")}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 8,
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer"
                    }}
                  >
                    {t("marketplace.modal_close")}
                  </button>
                  <Link
                    href="/login"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 24px",
                      borderRadius: 8,
                      background: "var(--text-primary)",
                      color: "var(--bg-primary)",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: 14
                    }}
                  >
                    <span>{t("marketplace.buy_now")}</span>
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="tc-footer" style={{ borderTop: "1px solid var(--border-color)", padding: "40px 32px" }}>
        <div className="tc-footer-inner" style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div className="tc-footer-left">
            <span className="tc-logo-text" style={{ fontSize: 16 }}>TrustChain</span>
            <span className="tc-footer-copy" style={{ marginLeft: 16, color: "var(--text-secondary)", fontSize: 13 }}>
              © {new Date().getFullYear()} TrustChain UMKM. All rights reserved.
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Heritage Jamu & Botanical Supply Chain Ecosystem
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .tc-product-card:hover .tc-product-img {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
}
