"use client";

import { mockTransactions, formatCurrency } from "@/lib/database";
import { StatusBadge, BlockchainHash } from "@/components/UIComponents";

export default function UmkmTransactionsPage() {
  return (
    <div className="animate-fadeIn">
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Transaksi</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Riwayat transaksi blockchain Anda</p>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>TX Hash</th>
                <th>Tipe</th>
                <th>Nilai</th>
                <th>Block</th>
                <th>Waktu</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map(tx => (
                <tr key={tx.id}>
                  <td><BlockchainHash hash={tx.txHash} /></td>
                  <td><span className="badge badge-info">{tx.type}</span></td>
                  <td style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                    {tx.currency === "IDR" ? formatCurrency(tx.amount) : `${tx.amount} ${tx.currency}`}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>#{tx.blockNumber}</td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(tx.timestamp).toLocaleDateString("id-ID")}</td>
                  <td><StatusBadge status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
