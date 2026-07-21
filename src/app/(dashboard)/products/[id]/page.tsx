"use client";

import { use } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { StatusBadge, ScoreRing, BlockchainHash } from "@/components/UIComponents";
import { mockProducts, formatCurrency } from "@/lib/database";
import { QRCodeSVG } from "qrcode.react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <>
        <Topbar title="Produk Tidak Ditemukan" />
        <div className="p-6">
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Produk tidak ditemukan</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">ID produk &ldquo;{id}&rdquo; tidak tersedia dalam sistem.</p>
            <Link href="/products" className="btn-primary">← Kembali ke Daftar Produk</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title={product.name} subtitle={`${product.productId} · ${product.umkmName}`} />

      <div className="p-6 space-y-6">
        {/* Product Header */}
        <div className="glass-card p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Product info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <span className="text-3xl">
                  {product.category === "Kerajinan Tekstil" ? "🧵" : product.category === "Produk Pertanian" ? "☕" : "📦"}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] font-heading">{product.name}</h2>
                  <div className="text-sm text-[var(--text-muted)]">{product.category} · {product.origin}</div>
                </div>
                <StatusBadge status={product.status} />
                {product.exportEligible && <span className="badge badge-primary">✈️ Export Ready</span>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: "Product ID", value: product.productId, color: "#6366f1" },
                  { label: "Harga", value: formatCurrency(product.price) + "/" + product.unit, color: "#10b981" },
                  { label: "Kuantitas", value: product.quantity.toLocaleString("id-ID") + " " + product.unit, color: "#f59e0b" },
                  { label: "AI Demand", value: product.aiDemandPrediction + "%", color: "#06b6d4" },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                    <div className="text-xs text-[var(--text-muted)] mb-1">{item.label}</div>
                    <div className="text-sm font-bold" style={{ color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Blockchain Info */}
              <div className="p-4 rounded-xl" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Blockchain Record</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div><span className="text-[var(--text-muted)]">TX Hash:</span> <BlockchainHash hash={product.blockchainHash} /></div>
                  <div><span className="text-[var(--text-muted)]">IPFS:</span> <span className="font-mono text-emerald-400">{product.ipfsHash.slice(0, 20)}...</span></div>
                  <div><span className="text-[var(--text-muted)]">AI Risk:</span> <span className="font-bold" style={{ color: product.aiRiskScore < 20 ? "#10b981" : "#f59e0b" }}>{product.aiRiskScore}%</span></div>
                  <div><span className="text-[var(--text-muted)]">Last Updated:</span> <span className="text-[var(--text-secondary)]">{new Date(product.lastUpdated).toLocaleDateString("id-ID")}</span></div>
                </div>
              </div>
            </div>

            {/* Right: QR Code & Score */}
            <div className="flex flex-col items-center gap-4 lg:w-64">
              <ScoreRing score={product.qualityScore} size={100} strokeWidth={8} color="#6366f1" label="Kualitas" />
              <div className="p-4 rounded-xl bg-white">
                <QRCodeSVG
                  value={JSON.stringify({
                    platform: "TrustChain UMKM",
                    productId: product.productId,
                    name: product.name,
                    blockchain: product.blockchainHash,
                    qualityScore: product.qualityScore,
                  })}
                  size={160}
                  level="H"
                  fgColor="#0f1035"
                />
              </div>
              <div className="text-xs text-[var(--text-muted)] text-center">Scan untuk verifikasi keaslian</div>
            </div>
          </div>
        </div>

        {/* Certifications & Raw Materials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Certifications */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 font-heading">📜 Sertifikasi</h3>
            <div className="space-y-3">
              {product.certifications.map(cert => (
                <div key={cert.id} className="p-4 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold text-[var(--text-primary)]">{cert.name}</div>
                    <StatusBadge status={cert.status} />
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Diterbitkan oleh: <span className="text-[var(--text-secondary)]">{cert.issuer}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Berlaku hingga: <span className="text-[var(--text-secondary)]">{new Date(cert.validUntil).toLocaleDateString("id-ID")}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-[var(--text-muted)]">TX:</span>
                    <BlockchainHash hash={cert.txHash} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Materials */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 font-heading">🧪 Bahan Baku</h3>
            <div className="space-y-3">
              {product.rawMaterials.map((mat, idx) => (
                <div key={idx} className="p-4 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold text-[var(--text-primary)]">{mat.name}</div>
                    {mat.certified ? (
                      <span className="badge badge-success">✓ Certified</span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-[var(--text-muted)]">Asal:</span> <span className="text-[var(--text-secondary)]">{mat.origin}</span></div>
                    <div><span className="text-[var(--text-muted)]">Supplier:</span> <span className="text-[var(--text-secondary)]">{mat.supplier}</span></div>
                    <div><span className="text-[var(--text-muted)]">Jumlah:</span> <span className="text-[var(--text-secondary)]">{mat.quantity}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Target Markets */}
            <h4 className="text-sm font-bold text-[var(--text-primary)] mt-6 mb-3">🌍 Target Pasar Ekspor</h4>
            <div className="flex flex-wrap gap-2">
              {product.targetMarkets.map(market => (
                <span key={market} className="badge badge-info">{market}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Supply Chain */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">🗺 Supply Chain Timeline</h3>
            <span className="text-xs text-[var(--text-muted)]">{product.supplyChainSteps.length} langkah</span>
          </div>
          <div className="space-y-0">
            {product.supplyChainSteps.map((step, idx) => (
              <div key={step.id} className={`chain-node ${idx === product.supplyChainSteps.length - 1 ? "pb-0" : "pb-4"}`}>
                <div className="chain-dot" style={{ borderColor: step.verified ? "#10b981" : "#f59e0b" }}>
                  {step.verified ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </div>
                <div className="rounded-xl p-4" style={{
                  background: step.verified ? "rgba(16,185,129,0.05)" : "rgba(245,158,11,0.05)",
                  border: `1px solid ${step.verified ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
                }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{step.step}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">{step.description}</div>
                    </div>
                    <StatusBadge status={step.verified ? "verified" : "pending"} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>📍 <span className="text-[var(--text-secondary)]">{step.location}</span></div>
                    <div>👤 <span className="text-[var(--text-secondary)]">{step.actor}</span></div>
                    <div>📅 <span className="text-[var(--text-secondary)]">{new Date(step.timestamp).toLocaleDateString("id-ID")}</span></div>
                    <div className="flex items-center gap-1">🔗 <BlockchainHash hash={step.txHash} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex gap-3">
          <Link href="/products" className="btn-secondary">← Kembali ke Produk</Link>
          <Link href="/traceability" className="btn-secondary">🗺 Traceability</Link>
        </div>
      </div>
    </>
  );
}
