"use client";

export function SkeletonBlock({ width = "100%", height = 16, borderRadius = 6, style = {} }: {
  width?: string | number;
  height?: number;
  borderRadius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="tc-skeleton"
      style={{
        width, height, borderRadius,
        background: "var(--bg-tertiary, #141414)",
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ lines = 3, showAvatar = false }: { lines?: number; showAvatar?: boolean }) {
  return (
    <div style={{
      background: "var(--bg-card, #0a0a0a)",
      border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
      borderRadius: 12, padding: 20,
    }}>
      {showAvatar && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <SkeletonBlock width={40} height={40} borderRadius={20} />
          <div style={{ flex: 1 }}>
            <SkeletonBlock width="60%" height={14} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="40%" height={10} />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          width={i === lines - 1 ? "70%" : "100%"}
          height={i === 0 ? 18 : 14}
          style={{ marginBottom: i < lines - 1 ? 10 : 0 }}
        />
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div style={{
      background: "var(--bg-card, #0a0a0a)",
      border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
      borderRadius: 12, padding: 20,
    }}>
      <SkeletonBlock width="50%" height={12} style={{ marginBottom: 12 }} />
      <SkeletonBlock width="40%" height={28} style={{ marginBottom: 8 }} />
      <SkeletonBlock width="30%" height={10} />
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "12px 16px" }}>
          <SkeletonBlock width={i === 0 ? "80%" : "60%"} height={14} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonGrid({ count = 6, showAvatar = false }: { count?: number; showAvatar?: boolean }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: 16,
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showAvatar={showAvatar} />
      ))}
    </div>
  );
}
