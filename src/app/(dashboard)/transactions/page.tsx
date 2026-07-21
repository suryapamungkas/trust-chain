"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import { StatusBadge, BlockchainHash } from "@/components/UIComponents";
import { mockTransactions, formatCurrency } from "@/lib/database";

export default function TransactionsPage() {
  const [filter, setFilter] = useState("all");

  const filtered = mockTransactions.filter((tx) => filter === "all" || tx.type === filter);

  return (
    <>
      <Topbar title="Transaksi Blockchain" subtitle="Histori lengkap transaksi on-chain — Ethereum Mainnet" />

      <div className="p-6 space-y-6">
        {/* Tx Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Transaksi", value: "2.84M", color: "#6366f1" },
            { label: "Dikonfirmasi", value: "2.83M", color: "#10b981" },
            { label: "Menunggu", value: "1,247", color: "#f59e0b" },
            { label: "Gagal", value: "234", color: "#f43f5e" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-4 text-center">
              <div className="text-2xl font-bold mb-1" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
              <div className="text-sm text-[var(--text-secondary)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", "payment", "certification", "transfer", "escrow"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 text-xs rounded-lg capitalize transition-all font-medium"
              style={{
                background: filter === f ? "rgba(99,102,241,0.2)" : "var(--bg-tertiary)",
                border: filter === f ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border-color)",
                color: filter === f ? "#818cf8" : "#94a3b8",
              }}
            >
              {f === "all" ? "Semua" : f}
            </button>
          ))}
        </div>

        {/* Transaction Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tx Hash</th>
                  <th>Dari</th>
                  <th>Ke</th>
                  <th>Tipe</th>
                  <th>Nilai</th>
                  <th>Gas</th>
                  <th>Block</th>
                  <th>Status</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td><BlockchainHash hash={tx.txHash} /></td>
                    <td><BlockchainHash hash={tx.from} /></td>
                    <td><BlockchainHash hash={tx.to} /></td>
                    <td><span className="badge badge-info capitalize">{tx.type}</span></td>
                    <td className="font-mono text-sm">
                      {tx.currency === "IDR" ? formatCurrency(tx.amount) : `${tx.amount} ${tx.currency}`}
                    </td>
                    <td className="text-xs text-[var(--text-muted)] font-mono">{tx.gasUsed.toLocaleString()}</td>
                    <td className="text-xs font-mono text-indigo-400">#{tx.blockNumber.toLocaleString()}</td>
                    <td><StatusBadge status={tx.status} /></td>
                    <td className="text-xs text-[var(--text-muted)]">
                      {new Date(tx.timestamp).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[var(--text-muted)]">
              Tidak ada transaksi ditemukan
            </div>
          )}
        </div>
      </div>
    </>
  );
}
