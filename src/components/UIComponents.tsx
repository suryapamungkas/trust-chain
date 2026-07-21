"use client";

import { useEffect, useRef, ReactNode } from "react";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  target,
  duration = 2000,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const start = 0;
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = start + (target - start) * eased;

      if (ref.current) {
        ref.current.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [target, duration, prefix, suffix, decimals]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: ReactNode;
  color?: string;
  description?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "up",
  icon,
  color = "var(--text-primary)",
  description,
  delay = 0,
}: StatCardProps) {
  const changeColors = {
    up: "var(--text-primary)",
    down: "var(--text-secondary)",
    neutral: "var(--text-muted)",
  };

  return (
    <div
      className="stat-card animate-fadeInUp"
      style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `var(--bg-tertiary)`, border: `1px solid var(--border-color)` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        {change && (
          <div
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
            style={{
              color: changeColors[changeType],
              border: `1px solid var(--border-color)`,
            }}
          >
            {changeType === "up" ? "▲" : changeType === "down" ? "▼" : "●"} {change}
          </div>
        )}
      </div>
      <div className="counter-number text-2xl font-bold text-[var(--text-primary)] mb-1">
        {value}
      </div>
      <div className="text-sm font-medium text-[var(--text-secondary)]">{title}</div>
      {description && (
        <div className="text-xs text-[var(--text-muted)] mt-1">{description}</div>
      )}
    </div>
  );
}

interface BadgeProps {
  status: string;
  label?: string;
}

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  verified: { color: "var(--text-primary)", bg: "var(--bg-hover)", border: "var(--border-hover)", label: "Terverifikasi" },
  active: { color: "var(--text-primary)", bg: "var(--bg-hover)", border: "var(--border-hover)", label: "Aktif" },
  confirmed: { color: "var(--text-primary)", bg: "var(--bg-hover)", border: "var(--border-hover)", label: "Dikonfirmasi" },
  valid: { color: "var(--text-primary)", bg: "var(--bg-hover)", border: "var(--border-hover)", label: "Valid" },
  exported: { color: "var(--text-secondary)", bg: "var(--bg-hover)", border: "var(--border-hover)", label: "Diekspor" },
  in_transit: { color: "var(--text-secondary)", bg: "var(--bg-hover)", border: "var(--border-hover)", label: "Dalam Transit" },
  pending: { color: "var(--text-muted)", bg: "var(--bg-hover)", border: "var(--border-color)", label: "Menunggu" },
  delivered: { color: "var(--text-primary)", bg: "var(--bg-hover)", border: "var(--border-hover)", label: "Terkirim" },
  rejected: { color: "var(--text-muted)", bg: "var(--bg-hover)", border: "var(--border-color)", label: "Ditolak" },
  failed: { color: "var(--text-muted)", bg: "var(--bg-hover)", border: "var(--border-color)", label: "Gagal" },
  expired: { color: "var(--text-muted)", bg: "var(--bg-hover)", border: "var(--border-color)", label: "Kadaluarsa" },
  low: { color: "var(--text-primary)", bg: "var(--bg-hover)", border: "var(--border-hover)", label: "Rendah" },
  medium: { color: "var(--text-secondary)", bg: "var(--bg-hover)", border: "var(--border-hover)", label: "Sedang" },
  high: { color: "var(--text-muted)", bg: "var(--bg-hover)", border: "var(--border-color)", label: "Tinggi" },
  critical: { color: "var(--text-muted)", bg: "var(--bg-hover)", border: "var(--border-color)", label: "Kritis" },
};

export function StatusBadge({ status, label }: BadgeProps) {
  const config = statusConfig[status] || { color: "var(--text-secondary)", bg: "var(--bg-hover)", border: "var(--border-color)", label: status };
  return (
    <span
      className="badge"
      style={{ color: config.color, background: config.bg, border: `1px solid ${config.border}` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: config.color, boxShadow: `0 0 4px ${config.color}` }}
      />
      {label || config.label}
    </span>
  );
}

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function ScoreRing({
  score,
  size = 80,
  strokeWidth = 6,
  color = "var(--text-primary)",
  label,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="score-ring flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize={size < 70 ? "14" : "18"}
          fontWeight="700"
          fontFamily="Space Grotesk, sans-serif"
        >
          {score}
        </text>
      </svg>
      {label && <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>}
    </div>
  );
}

interface BlockchainHashProps {
  hash: string;
  truncate?: boolean;
}

export function BlockchainHash({ hash, truncate = true }: BlockchainHashProps) {
  const display = truncate && hash.length > 16 ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : hash;

  const copyHash = () => {
    navigator.clipboard.writeText(hash);
  };

  return (
    <button
      onClick={copyHash}
      className="flex items-center gap-1.5 group"
      title="Click to copy"
    >
      <span className="hash-text group-hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>{display}</span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth="2"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );
}

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export function LoadingSpinner({ size = 24, color = "var(--text-primary)" }: LoadingSpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      className="animate-spin"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
}

export function ProgressBar({ value, max = 100, color = "var(--text-primary)", label, showValue = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div>
      {(label || showValue) && (
        <div className="flex justify-between text-xs mb-1">
          {label && <span className="text-[var(--text-secondary)]">{label}</span>}
          {showValue && <span className="text-[var(--text-primary)] font-semibold">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className="progress-bar" style={{ background: "var(--border-color)" }}>
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            background: color,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}
