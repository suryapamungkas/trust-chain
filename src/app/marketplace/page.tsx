"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Package, ArrowUpRight } from "lucide-react";

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
}

export default function PublicMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="tc-landing" style={{ minHeight: "100vh" }}>
      <div className="tc-grid-bg" />
      <div className="tc-noise" />

      {/* NAVBAR */}
      <nav className="tc-nav" style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)" }}>
        <div className="tc-nav-inner">
          <div className="tc-nav-left">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <span className="tc-logo-text">TrustChain</span>
            </Link>
          </div>
          <div className="tc-nav-links">
            <Link href="/">Beranda</Link>
            <Link href="/marketplace" style={{ color: "var(--text-primary)" }}>Marketplace</Link>
          </div>
          <div className="tc-nav-right">
            <Link href="/login" className="tc-nav-login">Masuk</Link>
            <Link href="/register" className="tc-nav-cta">Buat Akun ↗</Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="tc-section" style={{ paddingTop: 140, paddingBottom: 40 }}>
        <div className="tc-section-header">
          <span className="tc-section-tag">PUBLIC MARKETPLACE</span>
          <h2 className="tc-section-h2" style={{ fontSize: "3rem" }}>
            Produk <span className="tc-text-highlight">Terverifikasi</span>.
          </h2>
          <p className="tc-cta-sub" style={{ textAlign: "left", marginTop: 16 }}>
            Semua produk di sini telah melewati verifikasi ketat oleh admin dan datanya tercatat on-chain.
          </p>
        </div>

        {/* SEARCH & FILTER */}
        <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 300, position: "relative" }}>
            <Search size={20} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Cari nama produk atau deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "16px 16px 16px 48px",
                borderRadius: 8,
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "inherit"
              }}
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: "0 24px",
              borderRadius: 8,
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              outline: "none",
              fontFamily: "inherit",
              minWidth: 200
            }}
          >
            <option value="">Semua Kategori</option>
            <option value="Jamu">Jamu</option>
            <option value="Obat Tradisional">Obat Tradisional</option>
            <option value="Suplemen">Suplemen</option>
            <option value="Minuman Herbal">Minuman Herbal</option>
            <option value="Bahan Baku">Bahan Baku</option>
            <option value="Obat Luar">Obat Luar</option>
          </select>
        </div>

        {/* GRID */}
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
            Memuat produk...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: 12 }}>
            <Package size={48} style={{ color: "var(--text-secondary)", marginBottom: 16, opacity: 0.5 }} />
            <p style={{ color: "var(--text-secondary)" }}>Tidak ada produk yang ditemukan.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24
          }}>
            {products.map((p) => (
              <div key={p.id} style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: 12,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, border-color 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Image Placeholder */}
                <div style={{
                  height: 200,
                  background: "var(--bg-primary)",
                  borderBottom: "1px solid var(--border-color)",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {p.image_url && p.image_url.startsWith('/') ? (
                    <Image src={p.image_url} alt={p.name} fill style={{ objectFit: 'cover' }} unoptimized />
                  ) : (
                    <Package size={40} style={{ color: "var(--border-color)" }} />
                  )}
                  
                  <div style={{
                    position: "absolute",
                    top: 12, left: 12,
                    background: "rgba(0,0,0,0.8)",
                    backdropFilter: "blur(4px)",
                    color: "#fff",
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}>
                    {p.category}
                  </div>
                </div>

                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                    <span>{p.umkm_name || "UMKM"}</span>
                    <span>Stok: {p.stock} {p.unit}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{p.name}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16, flex: 1 }}>
                    {p.description?.substring(0, 80)}...
                  </p>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>
                        Rp {p.price_idr.toLocaleString("id-ID")}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        $ {p.price_usd.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <Link href="/login" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background: "var(--text-primary)",
                    color: "var(--bg-primary)",
                    padding: "12px",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    Login untuk Beli <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="tc-footer" style={{ borderTop: "1px solid var(--border-color)", padding: "40px 32px" }}>
        <div className="tc-footer-inner" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between" }}>
          <div className="tc-footer-left">
            <span className="tc-logo-text" style={{ fontSize: 16 }}>TrustChain</span>
            <span className="tc-footer-copy" style={{ marginLeft: 16, color: "var(--text-secondary)" }}>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
