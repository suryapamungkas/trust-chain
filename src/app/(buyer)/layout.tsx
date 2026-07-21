"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, LogOut, Globe, Menu, X } from "lucide-react";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_ITEMS = [
    { href: "/buyer", label: lang === "id" ? "Dashboard" : "Dashboard", icon: LayoutDashboard },
    { href: "/buyer/marketplace", label: lang === "id" ? "Marketplace" : "Marketplace", icon: ShoppingCart },
  ];

  useEffect(() => {
    if (!loading && (!user || user.role !== "buyer")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg-primary)", color: "var(--text-secondary)" }}>Memuat...</div>
  );

  if (!user || user.role !== "buyer") return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <button className="tc-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {mobileOpen && <div className="tc-sidebar-overlay active" onClick={() => setMobileOpen(false)} />}
      <aside className={`tc-sidebar ${mobileOpen ? "open" : ""}`} style={{
        width: 240, background: "var(--sidebar-bg)", borderRight: "1px solid var(--border-color)",
        display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
      }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>TrustChain</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Buyer Panel</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8,
              color: "var(--text-secondary)", fontSize: 13, fontWeight: 500, textDecoration: "none",
              transition: "all 0.2s ease", marginBottom: 2,
            }}
              onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={16} /> {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border-color)" }}>
          <div style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
            {user.name}
            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>{user.email}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setLang(lang === "id" ? "en" : "id")} style={{
              display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8,
              background: "transparent", border: "1px solid var(--border-color)", cursor: "pointer", color: "var(--text-secondary)",
              fontSize: 16, transition: "all 0.2s ease",
            }}
              title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <Globe size={18} />
            </button>
            <button onClick={toggleTheme} style={{
              display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8,
              background: "transparent", border: "1px solid var(--border-color)", cursor: "pointer", color: "var(--text-secondary)",
              fontSize: 16, transition: "all 0.2s ease",
            }}
              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              {theme === "dark" ? "◐" : "◑"}
            </button>
            <button onClick={logout} style={{
              flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8,
              background: "transparent", border: "1px solid var(--border-color)", cursor: "pointer", color: "var(--text-secondary)",
              fontSize: 13, fontWeight: 500, transition: "all 0.2s ease",
            }}
              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <LogOut size={16} /> {lang === "id" ? "Keluar" : "Logout"}
            </button>
          </div>
        </div>
      </aside>
      <main className="tc-main-content" style={{ flex: 1, marginLeft: 240, minHeight: "100vh" }}>{children}</main>
    </div>
  );
}
