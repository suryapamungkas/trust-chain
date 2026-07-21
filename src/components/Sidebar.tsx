"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const navItems = [
  {
    groupKey: "nav_group.overview",
    items: [
      { href: "/dashboard", labelKey: "nav.dashboard", icon: "⬡" },
    ],
  },
  {
    groupKey: "nav_group.products_supply",
    items: [
      { href: "/products", labelKey: "nav.products", icon: "◈" },
      { href: "/supply-chain", labelKey: "nav.supply_chain", icon: "◎" },
      { href: "/traceability", labelKey: "nav.traceability", icon: "⬟" },
    ],
  },
  {
    groupKey: "nav_group.blockchain",
    items: [
      { href: "/smart-contracts", labelKey: "nav.smart_contracts", icon: "◑" },
      { href: "/transactions", labelKey: "nav.transactions", icon: "◐" },
      { href: "/certifications", labelKey: "nav.certifications", icon: "◆" },
    ],
  },
  {
    groupKey: "nav_group.ai",
    items: [
      { href: "/ai-analytics", labelKey: "nav.ai_analytics", icon: "◉" },
      { href: "/fraud-detection", labelKey: "nav.fraud_detection", icon: "◔" },
      { href: "/demand-prediction", labelKey: "nav.demand_prediction", icon: "◕" },
    ],
  },
  {
    groupKey: "nav_group.stakeholder",
    items: [
      { href: "/government", labelKey: "nav.government", icon: "▣" },
      { href: "/banking", labelKey: "nav.banking", icon: "▤" },
      { href: "/exporters", labelKey: "nav.exporters", icon: "▥" },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (v: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`} style={{ zIndex: 160 }}>
      {/* Logo */}
      <div style={{ padding: "16px 12px 12px", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              background: "#ffffff",
              boxShadow: "0 0 18px rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#000" strokeWidth="1.5" fill="none" />
              <polygon points="11,6 16,9 16,13 11,16 6,13 6,9" fill="#000" opacity="0.6" />
              <circle cx="11" cy="11" r="2" fill="#000" />
            </svg>
          </div>

          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>
                  TrustChain
                </div>
                <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 500 }}>UMKM Ecosystem</div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "rgba(255,255,255,0.08)", color: "var(--text-primary)", border: "1px solid rgba(255,255,255,0.15)", whiteSpace: "nowrap" }}>ADMIN</span>
            </>
          )}
        </div>
      </div>

      {/* Network Status */}
      {!collapsed && (
        <div style={{ margin: "10px 8px 4px", padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span className="status-dot online" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{t("sidebar.network_label")}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{t("sidebar.network_status")}</div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {navItems.map((group) => (
          <div key={group.groupKey} style={{ marginBottom: 4 }}>
            {!collapsed && (
              <div style={{ padding: "6px 16px 4px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {t(group.groupKey)}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              const label = t(item.labelKey);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-item ${isActive ? "active" : ""}`}
                  title={collapsed ? label : undefined}
                >
                  <span style={{ fontSize: 17, flexShrink: 0, color: isActive ? "var(--brand-primary)" : "var(--text-muted)" }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>}
                  {!collapsed && isActive && (
                    <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "var(--brand-primary)", flexShrink: 0 }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      {!collapsed && (
        <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border-color)" }}>
          <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{t("sidebar.system_status")}</div>
            {[
              [t("sidebar.database"), t("sidebar.mysql")],
              [t("sidebar.blockchain_label"), t("sidebar.local_ledger")],
              [t("sidebar.ai_engine"), t("sidebar.algorithmic")]
            ].map(([name, status]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: "var(--text-muted)" }}>{name}</span>
                <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{status}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#000000", flexShrink: 0 }}>
              {user?.avatar || "A"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Admin TrustChain"}</div>
              <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Super Admin</div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Button, Theme Toggle & Language Toggle */}
      <div style={{ padding: collapsed ? "8px" : "0 8px 8px", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => setLang(lang === "id" ? "en" : "id")}
          style={{ padding: "8px", borderRadius: 9, background: "var(--bg-hover)", border: "1px solid var(--border-color)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
        >
          <Globe size={18} />
        </button>
        <button
          onClick={toggleTheme}
          style={{ padding: "8px", borderRadius: 9, background: "var(--bg-hover)", border: "1px solid var(--border-color)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}
          title="Toggle Theme"
        >
          {theme === "dark" ? "◐" : "◑"}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ flex: 1, padding: "8px", borderRadius: 9, background: "var(--bg-hover)", border: "1px solid var(--border-color)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, gap: 8 }}
        >
          {collapsed ? "→" : "←"}&nbsp;{!collapsed && t("sidebar.collapse")}
        </button>
        {!collapsed && (
          <button
            onClick={logout}
            style={{ width: "100%", padding: "8px", borderRadius: 9, background: "rgba(255,0,0,0.1)", border: "1px solid rgba(255,0,0,0.2)", color: "#ff4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, gap: 8, marginTop: 4, fontWeight: 600 }}
          >
            {t("auth.logout")}
          </button>
        )}
      </div>
    </aside>
  );
}
