"use client";

import { mockProducts, formatCurrency } from "@/lib/database";
import { StatusBadge, ScoreRing } from "@/components/UIComponents";
import { useState } from "react";

export default function BuyerProductsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.umkmName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Produk Tersedia</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Jelajahi produk UMKM terverifikasi blockchain</p>

      <div style={{ marginBottom: 20 }}>
        <input className="custom-input" placeholder="🔍 Cari produk atau UMKM..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {filtered.map(product => (
          <div key={product.id} className="glass-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{product.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{product.umkmName} · {product.origin}</div>
              </div>
              <StatusBadge status={product.status} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <ScoreRing score={product.qualityScore} size={50} strokeWidth={3.5} color={product.qualityScore >= 90 ? "#10b981" : "#f59e0b"} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fbbf24" }}>{formatCurrency(product.price)}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>per {product.unit}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {product.certifications.filter(c => c.status === "valid").map(c => (
                <span key={c.id} style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 5, background: "rgba(16,185,129,0.1)", color: "#34d399" }}>✓ {c.name}</span>
              ))}
              {product.exportEligible && (
                <span style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 5, background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>🌍 Ekspor</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
