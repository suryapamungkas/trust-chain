"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { StatusBadge, BlockchainHash, ScoreRing } from "@/components/UIComponents";
import { formatCurrency } from "@/lib/database";
import type { Product } from "@/lib/database";

export default function ProductsPage() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/products?limit=100");
        const data = await res.json();
        setProducts(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchQ = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.umkmName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchS = filterStatus === "all" || p.status === filterStatus;
    return matchQ && matchS;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <Topbar title="Digital Identity Produk" subtitle="Manajemen identitas digital produk UMKM on-chain" />

      <div className="p-6">
        {/* Header Controls */}
        <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              className="custom-input w-64"
              placeholder="Cari produk atau UMKM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="custom-select w-48"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="in_transit">Dalam Transit</option>
              <option value="delivered">Terkirim</option>
              <option value="exported">Diekspor</option>
            </select>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Daftarkan Produk
          </button>
        </div>

        <div className={`grid gap-6 ${selected ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
          {/* Product List */}
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelected(product.id === selected?.id ? null : product)}
                className={`glass-card p-5 cursor-pointer border-2 transition-all ${
                  selected?.id === product.id
                    ? "border-indigo-500"
                    : "border-transparent"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* QR/Icon */}
                  <div
                    className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))",
                      border: "1px solid rgba(99,102,241,0.3)",
                    }}
                  >
                    {product.category === "Kerajinan Tekstil" ? "🧵" :
                     product.category === "Produk Pertanian" ? "☕" :
                     product.category === "Kerajinan Tangan" ? "🏺" : "📦"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-bold text-[var(--text-primary)]">{product.name}</h3>
                      <StatusBadge status={product.status} />
                      {product.exportEligible && (
                        <span className="badge badge-primary">Export Ready</span>
                      )}
                    </div>

                    <div className="text-sm text-[var(--text-secondary)] mb-2">{product.umkmName} · {product.origin}</div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <div>
                        <div className="text-xs text-[var(--text-muted)] mb-0.5">Product ID</div>
                        <div className="text-xs font-mono text-indigo-400">{product.productId}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)] mb-0.5">Kualitas</div>
                        <div className="text-sm font-bold" style={{ color: product.qualityScore >= 90 ? "#10b981" : "#f59e0b" }}>
                          {product.qualityScore}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)] mb-0.5">AI Risk</div>
                        <div className="text-sm font-bold" style={{ color: product.aiRiskScore < 20 ? "#10b981" : "#f59e0b" }}>
                          {product.aiRiskScore}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)] mb-0.5">Harga</div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                          {formatCurrency(product.price)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <BlockchainHash hash={product.blockchainHash} />
                      <span className="text-xs text-[var(--text-muted)]">·</span>
                      <span className="text-xs text-[var(--text-muted)]">IPFS: <span className="text-cyan-400 font-mono">{product.ipfsHash.slice(0, 16)}...</span></span>
                    </div>

                    {/* Certifications */}
                    <div className="flex gap-2 flex-wrap mt-3">
                      {product.certifications.map((cert) => (
                        <span key={cert.id} className="badge badge-success">{cert.name}</span>
                      ))}
                    </div>
                  </div>

                  <ScoreRing score={product.qualityScore} size={60} strokeWidth={5} color="#6366f1" />
                </div>
                <div className="flex justify-end mt-3">
                  <Link
                    href={`/products/${product.id}`}
                    className="btn-secondary"
                    style={{ padding: "6px 14px", fontSize: 11 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    📄 Lihat Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Product Detail Panel */}
          {selected && (
            <div className="space-y-4 animate-fadeIn">
              {/* Digital Identity Card */}
              <div className="glass-card p-6" style={{ border: "1px solid rgba(99,102,241,0.3)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.2)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Digital Identity</h3>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Product ID</div>
                      <div className="font-mono text-sm text-indigo-400">{selected.productId}</div>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Status</div>
                      <StatusBadge status={selected.status} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Blockchain Hash</div>
                    <BlockchainHash hash={selected.blockchainHash} truncate={false} />
                  </div>

                  <div className="p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="text-xs text-[var(--text-muted)] mb-1">IPFS Content Hash</div>
                    <span className="hash-text">{selected.ipfsHash}</span>
                  </div>

                  <div className="p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="text-xs text-[var(--text-muted)] mb-2">Bahan Baku</div>
                    {selected.rawMaterials.map((mat, idx) => (
                      <div key={idx} className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-xs font-medium text-[var(--text-primary)]">{mat.name}</span>
                          <span className="text-xs text-[var(--text-muted)] ml-2">dari {mat.origin}</span>
                        </div>
                        {mat.certified && <span className="badge badge-success" style={{ fontSize: "9px" }}>Certified</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="glass-card p-6" style={{ border: "1px solid rgba(139,92,246,0.3)" }}>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Analisis AI</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl text-center" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <div className="text-2xl font-bold text-emerald-400">{selected.qualityScore}</div>
                    <div className="text-xs text-[var(--text-muted)]">Skor Kualitas</div>
                  </div>
                  <div className="p-3 rounded-xl text-center" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <div className="text-2xl font-bold text-indigo-400">{selected.aiDemandPrediction}%</div>
                    <div className="text-xs text-[var(--text-muted)]">Prediksi Permintaan</div>
                  </div>
                  <div className="p-3 rounded-xl text-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <div className="text-2xl font-bold text-amber-400">{selected.aiRiskScore}%</div>
                    <div className="text-xs text-[var(--text-muted)]">Skor Risiko</div>
                  </div>
                  <div className="p-3 rounded-xl text-center" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
                    <div className="text-2xl font-bold text-cyan-400">{selected.targetMarkets.length}</div>
                    <div className="text-xs text-[var(--text-muted)]">Target Pasar</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-[var(--text-muted)] mb-2">Target Pasar Ekspor</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.targetMarkets.map((market) => (
                      <span key={market} className="badge badge-info">{market}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Supply Chain Steps */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Journey Rantai Pasokan</h3>
                <div className="space-y-0">
                  {selected.supplyChainSteps.map((step, idx) => (
                    <div key={step.id} className={`chain-node pb-4 ${idx === selected.supplyChainSteps.length - 1 ? "pb-0" : ""}`}>
                      <div className="chain-dot">
                        {step.verified ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </div>
                      <div className="glass-card p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[var(--text-primary)]">{step.step}</span>
                          <StatusBadge status={step.verified ? "verified" : "pending"} />
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mb-1">{step.description}</p>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                          <span>📍 {step.location}</span>
                          <span>👤 {step.actor}</span>
                        </div>
                        <div className="mt-1">
                          <BlockchainHash hash={step.txHash} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
