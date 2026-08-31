"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import toast from "react-hot-toast";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function Topbar({ title, subtitle, onToggleSidebar }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, notifications, unreadCount, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);


  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil keluar.");
  };

  const roleLabel = user?.role === "admin" ? "Admin" : user?.role === "umkm" ? "Pelaku UMKM" : "Buyer/Investor";
  const roleBadgeColor = user?.role === "admin" ? "#000000" : user?.role === "umkm" ? "#333333" : "#666666";

  return (
    <header className="topbar" style={{ justifyContent: "space-between", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Hamburger for mobile */}
        <button
          onClick={onToggleSidebar}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4, display: "flex", alignItems: "center" }}
          aria-label="Toggle sidebar"
          className="lg:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5h14a1 1 0 110 2H3a1 1 0 010-2zM3 10h14a1 1 0 110 2H3a1 1 0 010-2zm0 5h14a1 1 0 110 2H3a1 1 0 010-2z"/>
          </svg>
        </button>
        <div>
          {title && (
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{subtitle}</p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Network status */}
        <div style={{ display: "none", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} className="sm-flex">
          <span className="status-dot online" />
          <span style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>Mainnet</span>
        </div>

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === "id" ? "en" : "id")}
          style={{
            width: 36, height: 36, borderRadius: 9,
            background: "var(--bg-tertiary)", border: "1px solid var(--border-color)",
            color: "var(--text-primary)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
          title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
        >
          <Globe size={18} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: 36, height: 36, borderRadius: 9,
            background: "var(--bg-tertiary)", border: "1px solid var(--border-color)",
            color: "var(--text-secondary)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, transition: "all 0.2s",
          }}
          title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          id="theme-toggle"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }}
            style={{
              width: 36, height: 36, borderRadius: 9, background: "var(--bg-tertiary)",
              border: "1px solid var(--border-color)", color: "var(--text-secondary)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, position: "relative",
            }}
            title={t("topbar.notifications")}
            id="notif-btn"
          >
            🔔
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 320, background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: 14, boxShadow: "var(--shadow-lg)", zIndex: 200, overflow: "hidden",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{t("topbar.notifications")}</span>
                {unreadCount > 0 && <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>{unreadCount} {t("topbar.unread")}</span>}
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>{t("topbar.no_notifications")}</div>
                ) : (
                  notifications.slice(0, 6).map((n: { id: number; read?: number; type?: string; title?: string; message?: string; created_at?: string }) => (
                    <div key={n.id} style={{
                      padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)",
                      background: n.read === 0 ? "rgba(255,255,255,0.04)" : "transparent",
                      cursor: "pointer",
                    }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>
                          {n.type === "success" ? "✓" : n.type === "warning" ? "⚠" : n.type === "error" ? "✕" : "ℹ"}
                        </span>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{n.title}</div>
                          <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 4 }}>{n.created_at ? new Date(n.created_at).toLocaleDateString("id-ID") : ""}</div>
                        </div>
                        {n.read === 0 && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-primary)", flexShrink: 0, marginTop: 4 }} />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "5px 10px 5px 5px", borderRadius: 10,
              background: "var(--bg-tertiary)", border: "1px solid var(--border-color)",
              cursor: "pointer", transition: "all 0.2s",
            }}
            id="user-menu-btn"
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, ${roleBadgeColor}, #aaaaaa)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "white",
            }}>
              {user?.avatar || "?"}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                {user?.name?.split(" ")[0] || "User"}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-secondary)", fontWeight: 600 }}>
                {roleLabel}
              </div>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "var(--text-muted)" }}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {showUser && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 200, background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: 12, boxShadow: "var(--shadow-lg)", zIndex: 200, overflow: "hidden",
            }}>
              <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user?.email}</div>
              </div>
              {[
                { label: "Dashboard", href: user?.role === "admin" ? "/dashboard" : user?.role === "umkm" ? "/umkm" : "/buyer", icon: "◈" },
                { label: "Profil Saya", href: "#", icon: "⬡" },
                { label: "Pengaturan", href: "#", icon: "⚙" },
              ].map(item => (
                <button key={item.label} onClick={() => router.push(item.href)} style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "var(--text-secondary)", fontSize: 13, textAlign: "left", transition: "background 0.2s" }}
                  onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"}
                  onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}>
                  <span style={{ width: 16 }}>{item.icon}</span>{item.label}
                </button>
              ))}
              <div style={{ borderTop: "1px solid var(--border-color)" }}>
                <button onClick={handleLogout} style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "var(--text-primary)", fontSize: 13 }}
                  onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"}
                  onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}
                  id="logout-btn">
                  <span style={{ width: 16 }}>⎋</span> Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {(showNotifs || showUser) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => { setShowNotifs(false); setShowUser(false); }} />
      )}
    </header>
  );
}
