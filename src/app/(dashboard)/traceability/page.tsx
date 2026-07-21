"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import { StatusBadge, ScoreRing, BlockchainHash } from "@/components/UIComponents";
import { mockProducts } from "@/lib/database";
import { QRCodeSVG } from "qrcode.react";

export default function TraceabilityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [selectedProductId, setSelectedProductId] = useState<string | number | null>(null);
  const [showQR, setShowQR] = useState<string | number | null>(null);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(mockProducts);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const results = mockProducts.filter(p =>
      p.productId.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.blockchainHash.toLowerCase().includes(q) ||
      p.ipfsHash.toLowerCase().includes(q) ||
      p.qrCode.toLowerCase().includes(q) ||
      p.umkmName.toLowerCase().includes(q)
    );
    setFilteredProducts(results);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      <Topbar title="Traceability" subtitle="Lacak perjalanan lengkap setiap produk dari sumber ke tujuan" />

      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="glass-card p-6" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <div className="flex gap-3 items-center mb-3">
            <div className="flex-1">
              <input
                className="custom-input"
                placeholder="Scan QR Code atau masukkan Product ID (contoh: TC-2024-001847) ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                id="trace-search-input"
              />
            </div>
            <button className="btn-primary px-6 py-2.5" onClick={handleSearch} id="trace-search-btn">🔍 Cari Produk</button>
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            Masukkan Product ID, nama produk, blockchain hash, atau IPFS hash untuk melacak perjalanan produk
          </div>
          {searchQuery && filteredProducts.length === 0 && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)" }}>
              <span className="text-sm text-rose-400">⚠️ Tidak ditemukan produk dengan kata kunci &ldquo;{searchQuery}&rdquo;</span>
            </div>
          )}
          {searchQuery && filteredProducts.length > 0 && (
            <div className="mt-3 text-xs text-emerald-400">
              ✅ Ditemukan {filteredProducts.length} produk
            </div>
          )}
        </div>

        {/* Products */}
        {filteredProducts.map((product) => (
          <div key={product.id} className="glass-card p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-4xl">
                {product.category === "Kerajinan Tekstil" ? "🧵" : product.category === "Produk Pertanian" ? "☕" : "📦"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{product.name}</h3>
                  <StatusBadge status={product.status} />
                  {product.exportEligible && <span className="badge badge-primary">✈️ Export Ready</span>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-[var(--text-muted)]">ID:</span> <span className="font-mono text-indigo-400">{product.productId}</span></div>
                  <div><span className="text-[var(--text-muted)]">UMKM:</span> <span className="text-[var(--text-primary)]">{product.umkmName}</span></div>
                  <div><span className="text-[var(--text-muted)]">Asal:</span> <span className="text-[var(--text-primary)]">{product.origin}</span></div>
                  <div><span className="text-[var(--text-muted)]">Kualitas:</span> <span className="font-bold text-emerald-400">{product.qualityScore}/100</span></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* QR Code Button */}
                <button
                  onClick={() => setShowQR(showQR === product.id ? null : product.id)}
                  className="btn-secondary"
                  style={{ padding: "8px 14px", fontSize: 12 }}
                >
                  📱 {showQR === product.id ? "Tutup QR" : "Lihat QR"}
                </button>
                <ScoreRing score={product.qualityScore} size={70} strokeWidth={6} color="#6366f1" label="Kualitas" />
              </div>
            </div>

            {/* QR Code Display */}
            {showQR === product.id && (
              <div className="mb-6 p-6 rounded-xl text-center animate-fadeInUp" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                <div className="inline-block p-4 rounded-xl bg-white">
                  <QRCodeSVG
                    value={JSON.stringify({
                      platform: "TrustChain UMKM",
                      productId: product.productId,
                      name: product.name,
                      umkm: product.umkmName,
                      origin: product.origin,
                      blockchain: product.blockchainHash,
                      qualityScore: product.qualityScore,
                      certifications: product.certifications.map(c => c.name),
                      verifiedAt: new Date().toISOString(),
                    })}
                    size={200}
                    level="H"
                    fgColor="#0f1035"
                    bgColor="#ffffff"
                  />
                </div>
                <div className="mt-3">
                  <div className="text-sm font-bold text-[var(--text-primary)]">{product.productId}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Scan QR ini untuk verifikasi keaslian produk</div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs text-[var(--text-muted)]">Hash:</span>
                    <BlockchainHash hash={product.blockchainHash} />
                  </div>
                </div>
              </div>
            )}

            <div style={{ height: 1, background: "var(--border-subtle)", margin: "0 -24px", marginBottom: 20 }} />

            {/* Supply Chain Timeline */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">🗺 Perjalanan Lengkap Produk</h4>
              <button
                onClick={() => setSelectedProductId(selectedProductId === product.id ? null : product.id)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {selectedProductId === product.id ? "Sembunyikan ▲" : "Tampilkan ▼"}
              </button>
            </div>

            {(selectedProductId === product.id || !selectedProductId) && (
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
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: step.verified ? "rgba(16,185,129,0.05)" : "rgba(245,158,11,0.05)",
                        border: `1px solid ${step.verified ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-bold text-[var(--text-primary)]">{step.step}</div>
                          <div className="text-xs text-[var(--text-secondary)] mt-0.5">{step.description}</div>
                        </div>
                        <StatusBadge status={step.verified ? "verified" : "pending"} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div><span className="text-[var(--text-muted)]">📍</span> <span className="text-[var(--text-secondary)]">{step.location}</span></div>
                        <div><span className="text-[var(--text-muted)]">👤</span> <span className="text-[var(--text-secondary)]">{step.actor}</span></div>
                        <div><span className="text-[var(--text-muted)]">📅</span> <span className="text-[var(--text-secondary)]">{new Date(step.timestamp).toLocaleDateString("id-ID")}</span></div>
                        <div className="flex items-center gap-1"><span className="text-[var(--text-muted)]">🔗</span> <BlockchainHash hash={step.txHash} /></div>
                      </div>
                      {step.documents.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {step.documents.map((doc) => (
                            <span key={doc} className="badge badge-info" style={{ fontSize: "9px" }}>📄 {doc}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
