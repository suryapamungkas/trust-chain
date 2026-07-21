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
  const { lang, setLang } = useLanguage();
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
            <Link href="/login" className="tc-nav-login">{lang === "id" ? "Masuk" : "Login"}</Link>
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
              <span>BLOCKCHAIN PROTOCOL — LIVE ON ETHEREUM</span>
            </div>

            <h1 className="x-hero-title">
              <span className="tc-reveal x-glitch" data-text="Trust">Trust</span>
              <br />
              <span className="tc-reveal tc-reveal-delay x-glitch" data-text="Chain_">Chain<span className="tc-cursor">_</span></span>
            </h1>

            <div className="x-hero-subtitle-wrap">
              <p
                className="x-hero-subtitle"
                style={{ transform: `translateY(${scrollY * 0.08}px)`, opacity: Math.max(0, 1 - scrollY * 0.002) }}
              >
                Infrastruktur verifikasi rantai pasok yang mengubah <em>opacity</em> menjadi <em>transparency</em>.
              </p>
            </div>

            <div className="tc-hero-actions">
              <Link href="/register" className="tc-btn-primary">
                <span>Mulai Sekarang</span>
                <span className="tc-btn-arrow">→</span>
              </Link>
              <Link href="/login" className="tc-btn-outline">Masuk ke Platform</Link>
            </div>
          </div>

          {/* Right: 30% — floating overlapping cards */}
          <div className="x-hero-float">
            {/* Card 1: Main data card */}
            <div className="x-float-card x-float-1">
              <div className="tc-data-card-header">
                <span className="tc-dot-pulse" />
                <span className="font-mono" style={{ fontSize: 10, letterSpacing: "0.12em" }}>LIVE NETWORK</span>
              </div>
              {[
                { l: "Active nodes", v: "847" },
                { l: "Latest block", v: "#18,945,231" },
                { l: "24h tx", v: "12,847" },
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
              <span className="font-mono" style={{ fontSize: 10 }}>8,412 UMKM verified</span>
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
                BLOCKCHAIN · AI ANALYTICS · SUPPLY CHAIN · SMART CONTRACTS · DIGITAL IDENTITY · TRACEABILITY · FRAUD DETECTION · EXPORT READY ·&nbsp;
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
          { img: "/images/home_products/home_product_1.png", label: "Minyak Gosok Premium", width: "78%" },
          { img: "/images/home_products/home_product_2.png", label: "Kapsul Suplemen", width: "92%" },
          { img: "/images/home_products/home_product_3.png", label: "Minuman Jamu Ekstrak", width: "99%" },
          { img: "/images/home_products/home_product_4.png", label: "Salep Kosmetik Herbal", width: "65%" },
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
            <div className="x-manifesto-num">01</div>
            <div className="x-manifesto-body">
              <h2 className="x-manifesto-text">
                Kami membangun TrustChain karena <span className="tc-text-highlight">8.4 juta UMKM Indonesia</span> tidak punya akses ke infrastruktur verifikasi yang layak.
              </h2>
              <p className="x-manifesto-p2">
                Rantai pasok yang transparan bukan privilege — itu <em>hak</em>.
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
      <section id="protocol" className="tc-section">
        <div className="tc-section-header">
          <span className="tc-section-tag">02 — PROTOCOL</span>
          <h2 className="tc-section-h2">Tiga layer.<br />Satu <span className="tc-text-highlight">kebenaran</span>.</h2>
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
            <h3 className="tc-bento-title">Digital Identity Layer</h3>
            <p className="tc-bento-desc">Setiap produk UMKM mendapat identitas digital unik yang tercatat di blockchain — immutable dan traceable dari hulu ke hilir.</p>
            <div className="tc-bento-tag">VERIFICATION · IMMUTABLE</div>
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
            <h3 className="tc-bento-title">Smart Contract Engine</h3>
            <p className="tc-bento-desc">Otomasi kontrak antara UMKM, buyer, dan logistik. Kode adalah hukum — tanpa pihak ketiga.</p>
            <div className="tc-bento-tag">AUTOMATION · TRUSTLESS</div>
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
            <h3 className="tc-bento-title">AI Prediction Core</h3>
            <p className="tc-bento-desc">Neural network mendeteksi fraud, memprediksi demand, dan mengoptimasi distribusi secara real-time.</p>
            <div className="tc-bento-tag">INTELLIGENCE · REAL-TIME</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          DATA WALL — Brutalist unequal grid (1fr 2fr 1fr)
          Dense auto-placement creates visual tension.
      ══════════════════════════════════════════════════ */}
      <section className="tc-section" style={{ padding: "0 32px 140px" }}>
        <div className="tc-section-header">
          <span className="tc-section-tag">05 — DATA WALL</span>
          <h2 className="tc-section-h2">The network<br /><span className="tc-text-highlight">speaks</span>.</h2>
        </div>
        <div className="x-data-wall" ref={staggerRef}>
          {[
            { title: "Transparent Blockchain Ledger", desc: "Seluruh riwayat transaksi terekam secara on-chain. Terbuka, immutable, dan siapapun dapat melakukan verifikasi transaksi.", tag: "IMMUTABLE · PUBLIC", num: "01", cls: "" },
            { title: "QRIS Payment Gateway", desc: "Sistem Top-Up saldo dan simulasi pembayaran real-time menggunakan QRIS. Beli produk UMKM semudah scan barcode.", tag: "INSTANT · SEAMLESS", num: "02", cls: "x-data-wall-wide" },
            { title: "Verifikasi Dokumen Ekspor", desc: "UMKM mengunggah NIB, Sertifikat Halal, & BPOM untuk diverifikasi Admin. Membuka jalan menuju pasar global.", tag: "COMPLIANCE · GLOBAL", num: "03", cls: "" },
            { title: "Marketplace B2B Terkurasi", desc: "Portal khusus bagi Buyer untuk menemukan produk UMKM unggulan yang keasliannya terjamin 100% on-chain.", tag: "VERIFIED · SECURE", num: "04", cls: "x-data-wall-tall" },
            { title: "Role-Based Dashboards", desc: "Tiga jenis portal khusus: Admin (Oversight), UMKM (Seller Center), dan Buyer (Pembelian). Dilengkapi tema gelap/terang.", tag: "PERSONALIZED · UI/UX", num: "05", cls: "" },
            { title: "Smart Contract Engine", desc: "Pencatatan perpindahan dana dan perubahan stok otomatis tereksekusi tanpa perantara pihak ketiga.", tag: "AUTOMATION · TRUSTLESS", num: "06", cls: "" },
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
      <section id="architecture" className="tc-section" style={{ padding: "0 0 140px" }}>
        <div className="x-uneven-split">
          {/* 20% rail — vertical text */}
          <div className="x-rail">
            <span className="x-rail-text">ARCHITECTURE</span>
            <div className="x-rail-line" />
            <span className="x-rail-num">03</span>
          </div>

          {/* 80% content */}
          <div className="x-rail-content">
            <h2 className="tc-split-h2" style={{ marginBottom: 64 }}>
              Dibangun untuk <span className="tc-text-highlight">skala</span>,<br />bukan untuk demo.
            </h2>

            <div className="x-arch-grid">
              {[
                { num: "L1", title: "Consensus", desc: "Proof-of-Stake validation dengan finality < 3 detik. 10K+ TPS untuk transaksi mikro.", tag: "LAYER 1" },
                { num: "L2", title: "Intelligence", desc: "Neural network untuk fraud detection dan demand prediction. Data BPS + Kemendag.", tag: "LAYER 2" },
                { num: "L3", title: "Interface", desc: "Dashboard stakeholder: UMKM, buyer, pemerintah, bank. Mobile-first dan real-time.", tag: "LAYER 3" },
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
      <div className="x-testimonial-split">
        <div className="x-testimonial-rail">
          <span className="x-testimonial-mark">&ldquo;</span>
        </div>
        <div className="x-testimonial-content">
          <div className="x-testimonial-overflow">
            <span className="x-testimonial-overflow-text">4.9</span>
            <span className="x-testimonial-overflow-sub">Trust Score</span>
          </div>
          <p className="x-testimonial-quote">
            TrustChain mengubah cara kami memverifikasi supplier. Dari proses <em>berminggu-minggu</em> menjadi <em>hitungan detik</em>. Ini bukan sekadar tools — ini infrastruktur kepercayaan baru.
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
      <section className="tc-section">
        <div className="tc-section-header">
          <span className="tc-section-tag">04 — ACCESS</span>
          <h2 className="tc-section-h2">Satu ekosistem.<br />Tiga <span className="tc-text-highlight">portal</span>.</h2>
        </div>

        <div className="x-typo-roles">
          {[
            { role: "Admin", desc: "Oversight penuh pada sistem. Verifikasi dokumen UMKM, kelola produk, dan pantau Transparent Ledger.", href: "/login", num: "01" },
            { role: "UMKM", desc: "Daftarkan produk unggulan, unggah sertifikasi ekspor, dan pantau pesanan dari Buyer.", href: "/login", num: "02" },
            { role: "Buyer", desc: "Telusuri marketplace B2B, Top-Up saldo, dan lakukan pembelian instan via QRIS Payment Gateway.", href: "/login", num: "03" },
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
      <section className="tc-cta">
        <div className="tc-cta-inner">
          <h2 className="tc-cta-h2">
            Mulai<br />sekarang<span className="tc-cursor">_</span>
          </h2>
          <p className="tc-cta-sub">
            Tidak perlu kartu kredit. Tidak perlu setup rumit.<br />Daftarkan bisnis Anda dalam 2 menit.
          </p>
          <div className="tc-cta-btns">
            <Link href="/register" className="tc-btn-primary tc-btn-large">
              <span>Buat Akun</span>
              <span className="tc-btn-arrow">→</span>
            </Link>
            <Link href="/login" className="tc-btn-outline">Masuk ke dashboard</Link>
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
            <a href="#">Protocol</a>
            <a href="#">Docs</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
