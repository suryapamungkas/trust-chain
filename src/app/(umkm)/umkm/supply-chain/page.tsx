"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/database";

export default function SupplyChainPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?limit=5");
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

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
          Transparansi Supply Chain
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Lacak perjalanan bahan baku dan proses produksi produk Anda di blockchain</p>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Memuat data supply chain...</div>
      ) : products.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Belum ada data supply chain produk.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {products.map(product => {
            let steps = [];
            try {
              steps = typeof product.supplyChainSteps === 'string' ? JSON.parse(product.supplyChainSteps) : product.supplyChainSteps;
            } catch {
              steps = [];
            }
            if (!Array.isArray(steps)) steps = [];

            return (
              <div key={product.id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border-color)" }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{product.name}</h3>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Blockchain Hash: <span style={{ fontFamily: "monospace" }}>{product.blockchainHash}</span></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>Tahap Selesai</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--brand-primary)" }}>{steps.filter(s => s.status === 'verified').length} / {steps.length}</div>
                  </div>
                </div>

                <div style={{ display: "flex", overflowX: "auto", paddingBottom: 10, gap: 16 }}>
                  {steps.map((step, idx) => (
                    <div key={idx} style={{ minWidth: 220, padding: 16, borderRadius: 12, background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)", position: "relative" }}>
                      {idx < steps.length - 1 && (
                        <div style={{ position: "absolute", top: "50%", right: -16, width: 16, height: 2, background: "var(--border-color)" }} />
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: step.status === "verified" ? "var(--brand-primary)" : "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: step.status === "verified" ? "white" : "var(--text-muted)" }}>
                          {idx + 1}
                        </div>
                        <span className={`badge ${step.status === "verified" ? "badge-success" : "badge-warning"}`} style={{ fontSize: 9 }}>
                          {step.status === "verified" ? "Verified" : "Pending"}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{step.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>{step.location}</div>
                      <div style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        Tx: {step.txHash}
                      </div>
                    </div>
                  ))}
                  {steps.length === 0 && (
                    <div style={{ fontSize: 13, color: "var(--text-muted)", padding: 10 }}>Tahapan supply chain belum tercatat untuk produk ini.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
