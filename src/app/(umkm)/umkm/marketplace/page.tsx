"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShoppingCart, Search } from "lucide-react";

interface Product { id: number; name: string; category: string; description: string; price_idr: number; price_usd: number; stock: number; unit: string; umkm_name: string; umkm_wallet: string; status: string; image_url?: string; }

export default function UmkmMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const p = await fetch("/api/products?global=true", { cache: "no-store" }).then(r => r.json());
      setProducts(Array.isArray(p) ? p : []);
    } catch { 
      // silent fail
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadData();
  }, [loadData]);

  const filteredProducts = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || p.category === catFilter;
    return matchSearch && matchCat;
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
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Eksplorasi Marketplace</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Lihat berbagai produk dari UMKM lain yang terverifikasi on-chain.</p>
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
              <div key={p.id} style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "hidden", transition: "all 0.2s ease", display: "flex", flexDirection: "column" }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--text-primary)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
              >
                {/* Image Placeholder */}
                <div style={{ height: 180, background: "var(--bg-primary)", borderBottom: "1px solid var(--border-color)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.name} fill style={{ objectFit: 'cover' }} unoptimized />
                  ) : (
                    <ShoppingCart size={40} style={{ color: "var(--border-color)" }} />
                  )}
                  <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 11, padding: "4px 8px", borderRadius: 4, fontWeight: 600 }}>
                    {p.category}
                  </div>
                </div>

                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{p.name}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>oleh {p.umkm_name}</span>
                    </div>
                  </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5, flex: 1 }}>{p.description?.slice(0, 80)}{p.description?.length > 80 ? "..." : ""}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Rp {fmtCurrency(p.price_idr)}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>$ {p.price_usd}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "right" }}>
                    <div style={{ fontWeight: 600 }}>{p.stock} {p.unit}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>tersedia</div>
                  </div>
                </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
