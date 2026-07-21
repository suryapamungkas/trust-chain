"use client";

import Topbar from "@/components/Topbar";
import { StatusBadge, ProgressBar } from "@/components/UIComponents";
import { mockProducts } from "@/lib/database";

export default function SupplyChainPage() {
  return (
    <>
      <Topbar title="Rantai Pasokan" subtitle="Pelacakan real-time seluruh perjalanan produk UMKM" />

      <div className="p-6 space-y-6">
        {/* Live Tracking Banner */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(99,102,241,0.15) 100%)",
            border: "1px solid rgba(6,182,212,0.25)",
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] font-heading mb-1">
                Supply Chain Live Monitor
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {mockProducts.reduce((sum, p) => sum + p.supplyChainSteps.length, 0)} langkah tercatat ·{" "}
                {mockProducts.filter((p) => p.status === "in_transit").length} produk dalam transit
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <span className="status-dot online" />
              <span className="text-sm text-emerald-400 font-semibold">Live Tracking Active</span>
            </div>
          </div>
        </div>

        {/* Product chain views */}
        {mockProducts.map((product) => (
          <div key={product.id} className="glass-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl">
                {product.category === "Kerajinan Tekstil" ? "🧵" : product.category === "Produk Pertanian" ? "☕" : "📦"}
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">{product.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{product.umkmName} · ID: {product.productId}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <StatusBadge status={product.status} />
                <div className="text-sm font-semibold text-indigo-400">{product.supplyChainSteps.length} langkah</div>
              </div>
            </div>

            {/* Horizontal chain visual */}
            <div className="flex items-center gap-0 overflow-x-auto pb-2 mb-6">
              {product.supplyChainSteps.map((step, idx) => (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div
                    className="block text-center"
                    style={{ minWidth: "130px", padding: "12px 8px" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                      style={{
                        background: step.verified ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)",
                        border: `1px solid ${step.verified ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.4)"}`,
                      }}
                    >
                      {step.verified ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="text-amber-400 text-sm">⏳</span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-[var(--text-primary)] leading-tight mb-1">{step.step}</div>
                    <div className="text-xs text-[var(--text-muted)]">{step.location.split(",")[0]}</div>
                  </div>
                  {idx < product.supplyChainSteps.length - 1 && (
                    <div className="block-connector flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Progress */}
            <ProgressBar
              value={(product.supplyChainSteps.filter((s) => s.verified).length / product.supplyChainSteps.length) * 100}
              color="#6366f1"
              label={`Terverifikasi: ${product.supplyChainSteps.filter((s) => s.verified).length}/${product.supplyChainSteps.length} langkah`}
            />
          </div>
        ))}
      </div>
    </>
  );
}
