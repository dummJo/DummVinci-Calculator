"use client";
// app/page.tsx — DummVinci Calculator Landing Page
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import { getRandomQuote, type Quote } from "@/lib/quotes";
import { useState, useEffect } from "react";


import {
  LayoutGrid, ChevronRight,
  ShieldPlus, Repeat, MonitorPlay, LineChart
} from "lucide-react";

const SPEC_STRIP = [
  "IEC 60364", "IEC 60947", "IEC 61439",
  "DIN 43671", "PUIL 2011", "ABB Manual",
  "STAHL CraneSystems", "Siemens SIRIUS",
];

// ── Inline SVG icons — no external dependency ────────────────────────────────
function IconCable() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16" /><path d="M4 8h4v8H4z" /><path d="M16 8h4v8h-4z" />
      <path d="M8 12h8" />
    </svg>
  );
}
function IconVSD() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" />
      <path d="M12 4v2M12 18v2M4 12H2M22 12h-2" />
    </svg>
  );
}
function IconBreaker() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 7v5l3 3" /><circle cx="12" cy="17" r="1" />
    </svg>
  );
}
function IconBusbar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="20" height="4" rx="1" />
      <path d="M6 6v4M10 6v4M14 6v4M18 6v4M6 14v4M10 14v4M14 14v4M18 14v4" />
    </svg>
  );
}
function IconBrake() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18L18 6" /><path d="M6 6h12v12" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
function IconPanel() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M8 3v18M2 9h6M2 15h6" />
      <circle cx="15" cy="11" r="3" />
      <path d="M15 8v1M15 14v1M12 11h1M18 11h1" />
    </svg>
  );
}
function IconUnified() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconPLC() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8v8M10 8v8" />
      <rect x="13" y="8" width="6" height="8" rx="1" />
      <circle cx="6" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconStarter() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9h2l1 3 2-6 1 3h2" />
      <path d="M12 17v1" strokeWidth="2.4" />
    </svg>
  );
}

// ── Category config ────────────────────────────────────────────────────────
const CATEGORY_ORDER = ["Main", "Starter", "Power", "Panel", "Control", "Info"] as const;
const CATEGORY_LABELS: Record<string, { en: string; id: string }> = {
  Main:    { en: "Quick Start",       id: "Mulai Cepat" },
  Starter: { en: "Motor & Drive",     id: "Motor & Drive" },
  Power:   { en: "Power Distribution", id: "Distribusi Daya" },
  Panel:   { en: "Panel & Enclosure", id: "Panel & Enclosure" },
  Control: { en: "Control & Tuning",  id: "Kontrol & Tuning" },
  Info:    { en: "Reference & Tools", id: "Referensi & Alat" },
};

export default function HomePage() {
  const { t, lang } = useLang();
  const th = t.home;
  const [heroQuote, setHeroQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const tid = setTimeout(() => setHeroQuote(getRandomQuote()), 0);
    return () => clearTimeout(tid);
  }, []);

  const CALCS = [
    { href: "/unified",     key: "unified", tag: "Fastsizing", cat: "Main",     Icon: IconUnified, accent: true },
    { href: "/vsd",         key: "vsd",     tag: "VSD & BTU",   cat: "Starter",  Icon: IconVSD },
    { href: "/cable",       key: "cable",   tag: "Current",     cat: "Power",    Icon: IconCable },
    { href: "/breaker",     key: "breaker", tag: "Protection",  cat: "Power",    Icon: IconBreaker },
    { href: "/busbar",      key: "busbar",  tag: "Capacity",    cat: "Power",    Icon: IconBusbar },
    { href: "/starter",     key: "starter", tag: "Motor Sizing",cat: "Starter",  Icon: IconStarter },
    { href: "/plc",         key: "plc",     tag: "I/O Config",  cat: "Control",  Icon: IconPLC },
    { href: "/abb-support", key: "support", tag: "Reference",   cat: "Info",     Icon: ShieldPlus },
    { href: "/panel-layout",key: "layout",  tag: "Layout",      cat: "Panel",    Icon: LayoutGrid },
    { href: "/braking-resistor", key: "brake",   tag: "Regeneration",cat: "Starter",  Icon: IconBrake },
    { href: "/panel",       key: "panel",   tag: "Enclosure",   cat: "Panel",    Icon: IconPanel },
    { href: "/pid",         key: "pid",     tag: "Tuning",      cat: "Control",  Icon: LineChart },
    { href: "/convert",     key: "convert", tag: "Utility",     cat: "Info",     Icon: Repeat },
    { href: "/tutorials",   key: "tutorials", tag: "Guide",     cat: "Info",     Icon: MonitorPlay },
  ];

  // Group calcs by category in defined order
  const grouped = CATEGORY_ORDER.map(cat => ({
    cat,
    label: CATEGORY_LABELS[cat][lang] || CATEGORY_LABELS[cat].en,
    items: CALCS.filter(c => c.cat === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "56px 20px 24px",
          width: "100%",
        }}
      >
        {/* Brand row + quote strip */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          {/* ◈ mark */}
          <div
            style={{
              width: 32,
              height: 32,
              border: "1px solid var(--accent)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 15,
              color: "var(--accent)",
              flexShrink: 0,
              background: "rgba(201,168,76,0.06)",
              marginTop: 2,
            }}
          >
            ◈
          </div>

          {/* Quote block */}
          <div
            style={{
              opacity: heroQuote ? 1 : 0,
              transition: "opacity 0.8s ease",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* Quote text */}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(11px, 1.3vw, 13px)",
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--fg-soft)",
                lineHeight: 1.45,
                letterSpacing: "0.005em",
              }}
            >
              &ldquo;{heroQuote?.text}&rdquo;
            </span>
            {/* Author */}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--accent)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                opacity: 0.75,
              }}
            >
              — {heroQuote?.author}
            </span>
          </div>
        </div>


        {/* Title — editorial typographic contrast */}
        <div style={{ marginBottom: 16 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(44px, 8vw, 76px)",
              fontWeight: 400,
              color: "var(--fg)",
              letterSpacing: "-0.05em",
              lineHeight: 0.85,
              margin: "0 0 16px",
            }}
          >
            {/* "Dumm" — thin italic, slightly muted */}
            <span
              style={{
                fontWeight: 300,
                fontStyle: "italic",
                opacity: 0.65,
              }}
            >
              Dumm
            </span>
            {/* "Vinci" — extrabold, upright, accent */}
            <span
              style={{
                fontWeight: 800,
                fontStyle: "normal",
                color: "var(--accent)",
              }}
            >
              Vinci
            </span>
          </h1>

          {/* "Calculator" as a compact mono eyebrow label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 24,
                height: 1,
                background: "var(--accent)",
                opacity: 0.5,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--accent)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              CALCULATOR
            </span>
          </div>
        </div>


        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(11px, 1.4vw, 13px)",
            color: "var(--muted)",
            letterSpacing: "0.06em",
            margin: "0 0 16px",
            lineHeight: 1.4,
          }}
        >
          {th.heroSubtitle}
        </p>
        
        <a 
          href="https://www.ptts.co.id" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            background: "rgba(29, 78, 216, 0.1)",
            border: "1px solid rgba(29, 78, 216, 0.3)",
            borderRadius: "var(--r-pill)",
            color: "var(--fg)",
            textDecoration: "none",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            transition: "all 0.2s ease",
            marginBottom: 16
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1d4ed8", boxShadow: "0 0 4px #1d4ed8" }} />
          Supported by PT Prima Tekindo Tirta Sejahtera
        </a>


        {/* Spec strip (Auto-sliding Marquee) */}
        <div
          style={{
            paddingTop: 16,
            borderTop: "1px solid var(--hairline-soft)",
            overflow: "hidden",
            width: "100%",
            position: "relative",
          }}
        >
          {/* Gradient fade masks for smooth edges */}
          <div style={{ position: "absolute", top: 16, bottom: 0, left: 0, width: 40, background: "linear-gradient(to right, var(--bg) 0%, transparent 100%)", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 16, bottom: 0, right: 0, width: 40, background: "linear-gradient(to left, var(--bg) 0%, transparent 100%)", zIndex: 2, pointerEvents: "none" }} />
          
          <div className="spec-marquee" style={{ gap: 8 }}>
            {[...SPEC_STRIP, ...SPEC_STRIP].map((s, i) => (
              <span key={`${s}-${i}`} className="tag" style={{ letterSpacing: "0.08em", fontSize: 10, padding: "2px 7px", whiteSpace: "nowrap" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ─── Section label ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 10px", width: "100%" }}>
        <div className="sec-label">
          <span>{th.secCalculators}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginLeft: 2 }}>
            {CALCS.length} tools
          </span>
        </div>
      </div>

      {/* ─── Card Grid by Category ─────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 12px 0",
          width: "100%",
          flex: 1,
        }}
      >
        {grouped.map((group, gi) => (
          <div key={group.cat} style={{ marginBottom: gi === grouped.length - 1 ? 0 : 24 }}>
            {/* Category header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 8px",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 14,
                  borderRadius: 2,
                  background: "var(--accent)",
                  opacity: 0.6,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--accent)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  opacity: 0.8,
                }}
              >
                {group.label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--hairline-soft)",
                  opacity: 0.6,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "var(--muted-soft)",
                  letterSpacing: "0.06em",
                }}
              >
                {group.items.length}
              </span>
            </div>

            {/* Cards grid */}
            <div className="home-card-grid">
              {group.items.map((calc) => {
                const meta = th.calcs[calc.key as keyof typeof th.calcs];
                // Trim description to ~60 chars for card brevity
                const shortDesc = meta?.desc
                  ? meta.desc.length > 80
                    ? meta.desc.slice(0, 77) + "…"
                    : meta.desc
                  : "";

                return (
                  <Link
                    key={calc.key}
                    href={calc.href}
                    id={`calc-card-${calc.key}`}
                    className="home-card cursor-card"
                    style={{ textDecoration: "none" }}
                  >
                    {/* Top row: Icon + Tag */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                      <div
                        className="card-icon"
                        style={{
                          width: 38,
                          height: 38,
                          border: "1px solid var(--glass-border)",
                          borderRadius: "var(--r-md)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: calc.accent ? "var(--accent)" : "var(--muted)",
                          background: calc.accent ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.03)",
                          flexShrink: 0,
                        }}
                      >
                        <calc.Icon />
                      </div>
                      <span
                        className="tag"
                        style={{
                          letterSpacing: "0.06em",
                          fontSize: 8,
                          padding: "1px 6px",
                          textTransform: "uppercase",
                          opacity: 0.8,
                          ...(calc.accent ? { color: "var(--accent)", borderColor: "rgba(201,168,76,0.5)", background: "rgba(201,168,76,0.1)" } : {}),
                        }}
                      >
                        {calc.tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--fg)",
                        letterSpacing: "-0.01em",
                        margin: "0 0 5px",
                        lineHeight: 1.2,
                      }}
                    >
                      {meta?.title || "Untitled"}
                    </h2>

                    {/* Description */}
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "11px",
                        color: "var(--fg-soft)",
                        lineHeight: 1.4,
                        margin: 0,
                        opacity: 0.6,
                        fontWeight: 400,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {shortDesc}
                    </p>

                    {/* Bottom arrow hint */}
                    <div
                      className="home-card-arrow"
                      style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        opacity: 0,
                        color: "var(--accent)",
                        transition: "opacity 0.2s ease, transform 0.2s ease",
                        transform: "translateX(-4px)",
                      }}
                    >
                      <ChevronRight size={14} strokeWidth={2} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
}
