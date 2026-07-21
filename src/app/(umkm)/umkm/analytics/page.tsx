"use client";

import { useAuth } from "@/contexts/AuthContext";
import { mockAIInsights } from "@/lib/database";
import { StatusBadge } from "@/components/UIComponents";
import { useState, useEffect } from "react";

export default function UmkmAnalyticsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [umkmProfile, setUmkmProfile] = useState<any>(null);

  useEffect(() => {
    fetch("/api/umkm?limit=1").then(r => r.json()).then(d => setUmkmProfile(d.data?.[0]));
  }, []);

  const insights = mockAIInsights;

  if (!umkmProfile) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Memuat analitik...</div>;

  return (
    <div className="animate-fadeIn">
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>AI Analytics</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Analisis cerdas untuk usaha {umkmProfile.businessName}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
        {insights.map(insight => (
          <div key={insight.id} className="glass-card" style={{ padding: 18, borderLeft: `3px solid ${insight.severity === "critical" ? "#ef4444" : insight.severity === "high" ? "#f43f5e" : insight.severity === "medium" ? "#f59e0b" : "#10b981"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{insight.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{insight.type.replace(/_/g, " ").toUpperCase()}</div>
              </div>
              <StatusBadge status={insight.severity} />
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 10 }}>{insight.description}</p>
            <div style={{ padding: 10, borderRadius: 8, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", fontSize: 12, color: "var(--text-secondary)" }}>
              💡 {insight.recommendation}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Kepercayaan: <strong style={{ color: "#818cf8" }}>{insight.confidence}%</strong></span>
              {insight.resolved ? (
                <span style={{ fontSize: 10, color: "#34d399", fontWeight: 600 }}>✓ Resolved</span>
              ) : (
                <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600 }}>⏳ Aktif</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
