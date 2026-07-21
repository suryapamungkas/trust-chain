"use client";

import { useState, useEffect } from "react";
import { formatCurrency, Product } from "@/lib/database";

export default function UmkmProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?limit=20");
        const json = await res.json();
        if (json.data) {
          setProducts(json.data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            Produk Saya
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Kelola produk dan inventaris UMKM Anda</p>
        </div>
        <button style={{ padding: "10px 20px", borderRadius: 8, background: "var(--brand-primary)", color: "white", fontWeight: 700, border: "none", cursor: "pointer" }}>
          + Tambah Produk
        </button>
      </div>

      <div className="glass-card" style={{ padding: 16, marginBottom: 24 }}>
        <input 
          type="text" 
          placeholder="Cari nama atau kategori produk..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: 400, padding: "10px 14px", borderRadius: 8, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
        />
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Memuat produk...</div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Tidak ada produk yang ditemukan.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filteredProducts.map((product, i) => (
            <div key={product.id} className="glass-card animate-fadeInUp" style={{ padding: 16, animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #10b981, #34d399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  📦
                </div>
                <span className={`badge ${product.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {product.status.toUpperCase()}
                </span>
              </div>
              
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                {product.name}
              </h3>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
                {product.category}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 10, borderRadius: 8, background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Harga ({product.unit})</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(product.price)}</div>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Kuantitas</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{product.quantity}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border-color)" }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>AI Risk Score</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: product.aiRiskScore < 20 ? "#34d399" : product.aiRiskScore < 50 ? "#fbbf24" : "#f87171" }}>
                    {product.aiRiskScore}/100
                  </div>
                </div>
                <button style={{ padding: "6px 12px", borderRadius: 6, background: "transparent", border: "1px solid var(--brand-primary)", color: "var(--brand-primary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
