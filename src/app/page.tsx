"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

declare global {
  interface Window {
    VANTA: {
      NET: (config: Record<string, unknown>) => { destroy: () => void };
    };
    THREE: unknown;
  }
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<{ destroy: () => void } | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const staggerRef = useRef<HTMLDivElement>(null);

  const setupStaggerObserver = useCallback(() => {
    if (!staggerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("x-visible");
          }
        });
      },
      { threshold: 0.15 }
    );
    staggerRef.current.querySelectorAll(".x-stagger").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
     
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const cleanup = setupStaggerObserver();
    return cleanup;
  }, [mounted, setupStaggerObserver]);

  useEffect(() => {
    if (!mounted) return;
    const loadVanta = () => {
      if (window.VANTA && vantaRef.current) {
        if (vantaEffect.current) vantaEffect.current.destroy();
        vantaEffect.current = window.VANTA.NET({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: theme === "dark" ? 0x555555 : 0x888888,
          backgroundColor: theme === "dark" ? 0x000000 : 0xfafafa,
          points: 8,
          maxDistance: 22,
          spacing: 18,
        });
      }
    };
    if (!document.querySelector('script[src*="three.r134"]')) {
      const s1 = document.createElement("script");
      s1.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
      s1.onload = () => {
        const s2 = document.createElement("script");
        s2.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js";
        s2.onload = loadVanta;
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    } else {
      loadVanta();
    }
    return () => {
      if (vantaEffect.current) { vantaEffect.current.destroy(); vantaEffect.current = null; }
    };
  }, [mounted, theme]);

  return (
    <div className="tc-landing">
      <div className="tc-grid-bg" />
      <div className="tc-noise" />

      {/* ══════════ NAVBAR ══════════ */}
      <nav className="tc-nav" style={{ borderColor: scrollY > 50 ? "var(--border-color)" : "transparent" }}>
        <div className="tc-nav-inner">
          <div className="tc-nav-left">
            {mounted && (
              <Image
                src={theme === "dark" ? "/logo_putih.png" : "/logo_hitam.png"}
                alt="TrustChain"
                width={50}
                height={50}
                style={{ objectFit: "contain" }}
                priority
              />
            )}
            <span className="tc-logo-text">TrustChain</span>
          </div>
          <div className="tc-nav-links">
            <a href="#manifesto">{lang === "id" ? "Visi Kami" : "Our Vision"}</a>
            <a href="#protocol">{lang === "id" ? "Tata Kelola" : "Governance"}</a>
            <a href="#architecture">{lang === "id" ? "Infrastruktur" : "Infrastructure"}</a>
            <div className="tc-dropdown-container">
              <a className="tc-dropdown-trigger">
                {lang === "id" ? "Regulasi" : "Regulations"} <span style={{ fontSize: '0.8em', opacity: 0.7 }}>▼</span>
              </a>
              <div className="tc-dropdown-menu">
                <a href="https://insw.go.id/" target="_blank" rel="noopener noreferrer" className="tc-dropdown-item">INSW (National Single Window)</a>
                <a href="https://www.beacukai.go.id/" target="_blank" rel="noopener noreferrer" className="tc-dropdown-item">Bea Cukai</a>
                <a href="https://kemendag.go.id/" target="_blank" rel="noopener noreferrer" className="tc-dropdown-item">Kementerian Perdagangan</a>
              </div>
            </div>
            <Link href="/marketplace">Marketplace</Link>
          </div>
          <div className="tc-nav-right">
            <button
              onClick={() => setLang(lang === "id" ? "en" : "id")}
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              title="Ganti Bahasa / Switch Language"
            >
              <Globe size={18} />
            </button>
            <button onClick={toggleTheme} className="tc-theme-btn" aria-label="Toggle theme">
              {mounted && (theme === "dark" ? "◐" : "◑")}
            </button>
            <Link href="/login" className="tc-nav-login">{t("auth.login")}</Link>
            <Link href="/register" className="tc-nav-cta">{lang === "id" ? "Buat Akun ↗" : "Register ↗"}</Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════
          SECTION 1: HERO — Typography IS the visual
          Giant text dominates. No image needed.
          Parallax-style scroll offset on subtitle.
      ══════════════════════════════════════════════════ */}
      <section className="tc-hero">
        <div ref={vantaRef} className="tc-hero-vanta" />

        <div className="x-hero-layout">
          {/* Left: 70% — massive display text */}
          <div className="x-hero-main">
            <div className="tc-hero-eyebrow">
              <span className="tc-dot-pulse" />
              <span>{t("landing.hero_eyebrow")}</span>
            </div>

            <h1 className="x-hero-title">
              <span className="tc-reveal x-glitch" data-text={t("landing.hero_title_1")}>{t("landing.hero_title_1")}</span>
              <br />
              <span className="tc-reveal tc-reveal-delay x-glitch" data-text={t("landing.hero_title_2")}>{t("landing.hero_title_2")}</span>
            </h1>

            <div className="x-hero-subtitle-wrap">
              <p
                className="x-hero-subtitle"
                style={{ transform: `translateY(${scrollY * 0.08}px)`, opacity: Math.max(0, 1 - scrollY * 0.002) }}
              >
                {t("landing.hero_subtitle")}
              </p>
            </div>

            <div className="tc-hero-actions">
              <Link href="/register" className="tc-btn-primary">
                <span>{t("landing.hero_cta_primary")}</span>
                <span className="tc-btn-arrow">→</span>
              </Link>
              <Link href="/login" className="tc-btn-outline">{t("landing.hero_cta_secondary")}</Link>
            </div>
          </div>

          {/* Right: 30% — floating overlapping cards */}
          <div className="x-hero-float">
            {/* Card 1: Main data card */}
            <div className="x-float-card x-float-1">
              <div className="tc-data-card-header">
                <span className="tc-dot-pulse" />
                <span className="font-mono" style={{ fontSize: 10, letterSpacing: "0.12em" }}>{t("landing.live_network")}</span>
              </div>
              {[
                { l: t("landing.active_nodes"), v: "847" },
                { l: t("landing.latest_block"), v: "#18,945,231" },
                { l: t("landing.daily_tx"), v: "12,847" },
              ].map((r, i) => (
                <div key={i} className="tc-data-row">
                  <span className="tc-data-label">{r.l}</span>
                  <span className="tc-data-value font-mono">{r.v}</span>
                </div>
              ))}
            </div>

            {/* Card 3: Small floating badge */}
            <div className="x-float-card x-float-3">
              <span className="tc-dot-pulse" />
              <span className="font-mono" style={{ fontSize: 10 }}>{t("landing.verified_umkm_badge")}</span>
            </div>
          </div>

          {/* Orbital particles around hero */}
          <div className="x-orbit-container">
            <div className="x-orbit-dot" />
            <div className="x-orbit-dot" />
            <div className="x-orbit-dot" />
            <div className="x-orbit-dot" />
          </div>
        </div>

        {/* Marquee */}
        <div className="tc-marquee">
          <div className="tc-marquee-track">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="tc-marquee-content">
                {t("landing.marquee")}&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          METRICS RIBBON WITH PRODUCTS
          Original layout but numbers are replaced by product images
      ══════════════════════════════════════════════════ */}
      <div className="x-metrics-ribbon">
        {[
          { img: "/images/home_products/home_product_1.png", label: t("landing.metric_1"), width: "78%" },
          { img: "/images/home_products/home_product_2.png", label: t("landing.metric_2"), width: "92%" },
          { img: "/images/home_products/home_product_3.png", label: t("landing.metric_3"), width: "99%" },
          { img: "/images/home_products/home_product_4.png", label: t("landing.metric_4"), width: "65%" },
        ].map((m, i) => (
          <div key={i} className="x-metric-cell x-product-metric-cell">
            <div className="x-product-metric-img-wrapper">
              <Image src={m.img} alt={m.label} fill sizes="(max-width: 768px) 100vw, 25vw" className="x-product-metric-img" />
            </div>
            <span className="x-metric-label" style={{ marginTop: "24px" }}>{m.label}</span>
            <div className="x-metric-bar">
              <div className="x-metric-bar-fill" style={{ width: m.width }} />
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 2: DIAGONAL CUT — Manifesto
          The entire section is rotated -3deg.
          Content is counter-rotated to stay readable.
          Creates visual momentum and energy.
      ══════════════════════════════════════════════════ */}
      <section id="manifesto" className="x-skew-section">
        <div className="x-skew-content">
          <div className="x-manifesto-layout">
            <div className="x-manifesto-num">{t("landing.manifesto_num")}</div>
            <div className="x-manifesto-body">
              <h2 className="x-manifesto-text">
                {t("landing.manifesto_text_1")}<span className="tc-text-highlight">{t("landing.manifesto_highlight")}</span>{t("landing.manifesto_text_2")}
              </h2>
              <p className="x-manifesto-p2">
                {t("landing.manifesto_sub")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3: PROTOCOL — Overlapping depth layers
          Cards stack with deliberate z-index + offset.
          Not a flat grid — a layered composition.
      ══════════════════════════════════════════════════ */}
      <section id="protocol" className="tc-section content-auto">
        <div className="tc-section-header">
          <span className="tc-section-tag">{t("landing.protocol_tag")}</span>
          <h2 className="tc-section-h2">{t("landing.protocol_title")}<br /><span className="tc-text-highlight">{t("landing.protocol_highlight")}</span></h2>
        </div>

        <div className="x-depth-stack">
          {/* Layer 1: back — largest, slightly rotated */}
          <div className="x-depth-card x-depth-1 tc-card-clip">
            <div className="tc-bento-corner" />
            <span className="x-depth-label">01</span>
            <div className="tc-bento-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 className="tc-bento-title">{t("landing.protocol_l1_title")}</h3>
            <p className="tc-bento-desc">{t("landing.protocol_l1_desc")}</p>
            <div className="tc-bento-tag">{t("landing.protocol_l1_tag")}</div>
          </div>

          {/* Layer 2: middle */}
          <div className="x-depth-card x-depth-2 tc-card-clip">
            <div className="tc-bento-corner" />
            <span className="x-depth-label">02</span>
            <div className="tc-bento-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="18" rx="2" /><path d="M8 7h8M8 11h5" />
              </svg>
            </div>
            <h3 className="tc-bento-title">{t("landing.protocol_l2_title")}</h3>
            <p className="tc-bento-desc">{t("landing.protocol_l2_desc")}</p>
            <div className="tc-bento-tag">{t("landing.protocol_l2_tag")}</div>
          </div>

          {/* Layer 3: front — smallest, most forward */}
          <div className="x-depth-card x-depth-3 tc-card-clip">
            <div className="tc-bento-corner" />
            <span className="x-depth-label">03</span>
            <div className="tc-bento-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3 className="tc-bento-title">{t("landing.protocol_l3_title")}</h3>
            <p className="tc-bento-desc">{t("landing.protocol_l3_desc")}</p>
            <div className="tc-bento-tag">{t("landing.protocol_l3_tag")}</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          DATA WALL — Brutalist unequal grid (1fr 2fr 1fr)
          Dense auto-placement creates visual tension.
      ══════════════════════════════════════════════════ */}
      <section className="tc-section content-auto" style={{ padding: "0 32px 140px" }}>
        <div className="tc-section-header">
          <span className="tc-section-tag">{t("landing.data_wall_tag")}</span>
          <h2 className="tc-section-h2">{t("landing.data_wall_title")}<br /><span className="tc-text-highlight">{t("landing.data_wall_highlight")}</span></h2>
        </div>
        <div className="x-data-wall" ref={staggerRef}>
          {[
            { title: t("landing.dw_1_title"), desc: t("landing.dw_1_desc"), tag: t("landing.dw_1_tag"), num: "01", cls: "" },
            { title: t("landing.dw_2_title"), desc: t("landing.dw_2_desc"), tag: t("landing.dw_2_tag"), num: "02", cls: "x-data-wall-wide" },
            { title: t("landing.dw_3_title"), desc: t("landing.dw_3_desc"), tag: t("landing.dw_3_tag"), num: "03", cls: "" },
            { title: t("landing.dw_4_title"), desc: t("landing.dw_4_desc"), tag: t("landing.dw_4_tag"), num: "04", cls: "x-data-wall-tall" },
            { title: t("landing.dw_5_title"), desc: t("landing.dw_5_desc"), tag: t("landing.dw_5_tag"), num: "05", cls: "" },
            { title: t("landing.dw_6_title"), desc: t("landing.dw_6_desc"), tag: t("landing.dw_6_tag"), num: "06", cls: "" },
          ].map((item, i) => (
            <div key={i} className={`x-data-wall-cell x-stagger ${item.cls}`}>
              <div>
                <span className="x-data-wall-num">{item.num}</span>
                <h4 className="x-data-wall-title">{item.title}</h4>
              </div>
              <div>
                <p className="x-data-wall-desc">{item.desc}</p>
                <div className="x-data-wall-tag">{item.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4: ARCHITECTURE — 20/80 Uneven Split
          Tiny left rail with vertical text.
          Wide right panel with content.
      ══════════════════════════════════════════════════ */}
      <section id="architecture" className="tc-section content-auto" style={{ padding: "0 0 140px" }}>
        <div className="x-uneven-split">
          {/* 20% rail — vertical text */}
          <div className="x-rail">
            <span className="x-rail-text">{lang === "id" ? "ARSITEKTUR" : "ARCHITECTURE"}</span>
            <div className="x-rail-line" />
            <span className="x-rail-num">03</span>
          </div>

          {/* 80% content */}
          <div className="x-rail-content">
            <h2 className="tc-split-h2" style={{ marginBottom: 64 }}>
              {lang === "id" ? (
                <>Dibangun untuk <span className="tc-text-highlight">skala</span>,<br />bukan untuk demo.</>
              ) : (
                <>Engineered for <span className="tc-text-highlight">scale</span>,<br />not for demos.</>
              )}
            </h2>

            <div className="x-arch-grid">
              {[
                { num: "L1", title: "Consensus", desc: lang === "id" ? "Proof-of-Stake validation dengan finality < 3 detik. 10K+ TPS untuk transaksi mikro." : "Proof-of-Stake validation with <3s finality. 10K+ TPS for high-frequency micro-transactions.", tag: "LAYER 1" },
                { num: "L2", title: "Intelligence", desc: lang === "id" ? "Neural network untuk deteksi fraud dan prediksi permintaan pasar. Integrasi data BPS + Kemendag." : "Neural network for fraud detection and market demand forecasting. Integrated with national trade data.", tag: "LAYER 2" },
                { num: "L3", title: "Interface", desc: lang === "id" ? "Dashboard stakeholder terpadu: UMKM, buyer, dan auditor. Responsif dan update real-time." : "Unified stakeholder dashboards: MSMEs, buyers, and auditors. Fully responsive with real-time sync.", tag: "LAYER 3" },
              ].map((item, i) => (
                <div key={i} className="x-arch-card tc-card-clip">
                  <div className="tc-bento-corner" />
                  <div className="x-arch-card-head">
                    <span className="x-arch-card-num">{item.num}</span>
                    <span className="x-arch-card-tag">{item.tag}</span>
                  </div>
                  <h4 className="tc-arch-title">{item.title}</h4>
                  <p className="tc-arch-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIAL — 30/70 Asymmetric Split
          Quote element overlaps the gutter boundary.
      ══════════════════════════════════════════════════ */}
      <div className="x-testimonial-split content-auto">
        <div className="x-testimonial-rail">
          <span className="x-testimonial-mark">&ldquo;</span>
        </div>
        <div className="x-testimonial-content">
          <div className="x-testimonial-overflow">
            <span className="x-testimonial-overflow-text">4.9</span>
            <span className="x-testimonial-overflow-sub">Trust Score</span>
          </div>
          <p className="x-testimonial-quote">
            {lang === "id" 
              ? "TrustChain mengubah cara kami memverifikasi supplier. Dari proses berminggu-minggu menjadi hitungan detik. Ini bukan sekadar tools — ini infrastruktur kepercayaan baru."
              : "TrustChain transformed how we verify suppliers. From a multi-week ordeal into mere seconds. This isn't just a tool — it's the new standard of cryptographic trust."}
          </p>
          <div className="x-testimonial-author">
            <div className="x-testimonial-avatar">RA</div>
            <div className="x-testimonial-info">
              <span className="x-testimonial-name">Raka Adiputra</span>
              <span className="x-testimonial-role">Head of Supply Chain, PT Indo Export</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 5: ROLES — Typography-driven
          Role name IS the visual. Giant text with description overlay.
      ══════════════════════════════════════════════════ */}
      <section className="tc-section content-auto">
        <div className="tc-section-header">
          <span className="tc-section-tag">04 — ACCESS</span>
          <h2 className="tc-section-h2">
            {lang === "id" ? (
              <>Satu ekosistem.<br />Tiga <span className="tc-text-highlight">portal</span>.</>
            ) : (
              <>One ecosystem.<br />Three <span className="tc-text-highlight">portals</span>.</>
            )}
          </h2>
        </div>

        <div className="x-typo-roles">
          {[
            { role: "Admin", desc: lang === "id" ? "Oversight penuh pada sistem. Verifikasi dokumen UMKM, kelola produk, dan pantau Transparent Ledger." : "Complete system oversight. Verify MSME documentation, manage products, and monitor the Transparent Ledger.", href: "/login", num: "01" },
            { role: "UMKM", desc: lang === "id" ? "Daftarkan produk unggulan, unggah sertifikasi ekspor, dan pantau pesanan dari Buyer." : "Register flagship products, upload export certifications, and fulfill orders from buyers.", href: "/login", num: "02" },
            { role: "Buyer", desc: lang === "id" ? "Telusuri marketplace B2B, Top-Up saldo, dan lakukan pembelian instan via QRIS Payment Gateway." : "Explore curated B2B marketplace, top up balance, and buy directly via instant QRIS payment.", href: "/login", num: "03" },
          ].map((r) => (
            <Link key={r.role} href={r.href} className="x-typo-role">
              <span className="x-typo-role-num">{r.num}</span>
              <span className="x-typo-role-name">{r.role}</span>
              <span className="x-typo-role-desc">{r.desc}</span>
              <span className="x-typo-role-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 6: CTA — Full bleed typographic
      ══════════════════════════════════════════════════ */}
      <section className="tc-cta content-auto">
        <div className="tc-cta-inner">
          <h2 className="tc-cta-h2">
            {lang === "id" ? (
              <>Mulai<br />sekarang</>
            ) : (
              <>Get started<br />today</>
            )}
          </h2>
          <p className="tc-cta-sub">
            {lang === "id" ? (
              <>Tidak perlu kartu kredit. Tidak perlu setup rumit.<br />Daftarkan bisnis Anda dalam 2 menit.</>
            ) : (
              <>No credit card required. No complex configuration.<br />Register your enterprise in under 2 minutes.</>
            )}
          </p>
          <div className="tc-cta-btns">
            <Link href="/register" className="tc-btn-primary tc-btn-large">
              <span>{t("auth.register")}</span>
              <span className="tc-btn-arrow">→</span>
            </Link>
            <Link href="/login" className="tc-btn-outline">{t("auth.login")}</Link>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="tc-footer">
        <div className="tc-footer-inner">
          <div className="tc-footer-left">
            <span className="tc-logo-text" style={{ fontSize: 16 }}>TrustChain</span>
            <span className="tc-footer-copy">© {new Date().getFullYear()}</span>
          </div>
          <div className="tc-footer-links">
            <a href="#protocol">Protocol</a>
            <a href="https://insw.go.id/" target="_blank" rel="noopener noreferrer">INSW</a>
            <a href="https://www.beacukai.go.id/" target="_blank" rel="noopener noreferrer">Customs</a>
            <Link href="/marketplace">Marketplace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
