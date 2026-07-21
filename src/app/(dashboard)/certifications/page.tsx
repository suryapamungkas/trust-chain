"use client";

import Topbar from "@/components/Topbar";
import { StatusBadge, BlockchainHash } from "@/components/UIComponents";
import { mockProducts } from "@/lib/database";

export default function CertificationsPage() {
  const allCerts = mockProducts.flatMap((p) =>
    p.certifications.map((c) => ({ ...c, productName: p.name, umkmName: p.umkmName }))
  );

  return (
    <>
      <Topbar title="Sertifikasi" subtitle="Verifikasi sertifikasi produk UMKM on-chain" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Sertifikasi", value: "34,521", color: "#6366f1" },
            { label: "Valid", value: "33,847", color: "#10b981" },
            { label: "Kadaluarsa", value: "674", color: "#f43f5e" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-4 text-center">
              <div className="text-2xl font-bold" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
              <div className="text-sm text-[var(--text-secondary)]">{label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-6 pb-3">
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">Sertifikasi Terdaftar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Sertifikasi</th>
                  <th>Produk</th>
                  <th>UMKM</th>
                  <th>Penerbit</th>
                  <th>Berlaku Hingga</th>
                  <th>Tx Hash</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allCerts.map((cert) => (
                  <tr key={cert.id}>
                    <td className="font-semibold">{cert.name}</td>
                    <td className="text-sm text-[var(--text-secondary)]">{cert.productName}</td>
                    <td className="text-sm text-[var(--text-secondary)]">{cert.umkmName}</td>
                    <td className="text-sm">{cert.issuer}</td>
                    <td className="text-sm font-mono">{new Date(cert.validUntil).toLocaleDateString("id-ID")}</td>
                    <td><BlockchainHash hash={cert.txHash} /></td>
                    <td><StatusBadge status={cert.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
