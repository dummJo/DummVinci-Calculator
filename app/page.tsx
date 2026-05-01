"use client";
// app/page.tsx — DummVinci Calculator Landing Page
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import { getRandomQuote, type Quote } from "@/lib/quotes";
import { useState, useEffect } from "react";
import {
  LayoutGrid, Activity, ChevronRight, SortAsc, SortDesc, Sparkles, BookOpen
} from "lucide-react";

const SPEC_STRIP = [
  "IEC 60364", "IEC 60947", "IEC 61439",
  "DIN 43671", "PUIL 2011", "ABB Manual",
  "STAHL CraneSystems", "Siemens SIRIUS",
];

// ── Inline SVG icons — no external dependency ────────────────────────────────
function IconCable() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16" /><path d="M4 8h4v8H4z" /><path d="M16 8h4v8h-4z" />
      <path d="M8 12h8" />
    </svg>
  );
}
function IconVSD() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" />
      <path d="M12 4v2M12 18v2M4 12H2M22 12h-2" />
    </svg>
  );
}
function IconBreaker() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 7v5l3 3" /><circle cx="12" cy="17" r="1" />
    </svg>
  );
}
function IconBusbar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="20" height="4" rx="1" />
      <path d="M6 6v4M10 6v4M14 6v4M18 6v4M6 14v4M10 14v4M14 14v4M18 14v4" />
    </svg>
  );
}
function IconBrake() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18L18 6" /><path d="M6 6h12v12" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
function IconPanel() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M8 3v18M2 9h6M2 15h6" />
      <circle cx="15" cy="11" r="3" />
      <path d="M15 8v1M15 14v1M12 11h1M18 11h1" />
    </svg>
  );
}
function IconUnified() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconPLC() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9h2l1 3 2-6 1 3h2" />
      <path d="M12 17v1" strokeWidth="2.5" />
    </svg>
  );
}

export default function HomePage() {
  const { t } = useLang();
  const th = t.home;
  const [heroQuote, setHeroQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const tid = setTimeout(() => setHeroQuote(getRandomQuote()), 0);
    return () => clearTimeout(tid);
  }, []);

  const [sortBy, setSortBy] = useState<"name" | "cat" | "default">("default");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const CALCS = [
    { href: "/unified",     key: "unified", tag: "Fastsizing", cat: "Main",     Icon: IconUnified, accent: true },
    { href: "/vsd",         key: "vsd",     tag: "VSD & BTU",   cat: "Starter",  Icon: IconVSD },
    { href: "/cable",       key: "cable",   tag: "Current",     cat: "Power",    Icon: IconCable },
    { href: "/breaker",     key: "breaker", tag: "Protection",  cat: "Power",    Icon: IconBreaker },
    { href: "/busbar",      key: "busbar",  tag: "Capacity",    cat: "Power",    Icon: IconBusbar },
    { href: "/starter",     key: "starter", tag: "Motor Sizing",cat: "Starter",  Icon: IconStarter },
    { href: "/plc",         key: "plc",     tag: "I/O Config",  cat: "Control",  Icon: IconPLC },
    { href: "/abb-support", key: "support", tag: "Reference",   cat: "Info",     Icon: Activity },
    { href: "/panel-layout",key: "layout",  tag: "Layout",      cat: "Panel",    Icon: LayoutGrid },
    { href: "/braking-resistor", key: "brake",   tag: "Regeneration",cat: "Starter",  Icon: IconBrake },
    { href: "/panel",       key: "panel",   tag: "Enclosure",   cat: "Panel",    Icon: IconPanel },
    { href: "/pid",         key: "pid",     tag: "Tuning",      cat: "Control",  Icon: Activity },
    { href: "/convert",     key: "convert", tag: "Utility",     cat: "Info",     Icon: Sparkles },
    { href: "/tutorials",   key: "tutorials", tag: "Guide",     cat: "Info",     Icon: BookOpen },
  ];

  const sortedCalcs = [...CALCS].sort((a, b) => {
    if (sortBy === "default") return 0;
    
    const metaA = th.calcs[a.key as keyof typeof th.calcs];
    const metaB = th.calcs[b.key as keyof typeof th.calcs];
    
    const valA = sortBy === "name" ? (metaA?.title || "") : a.cat;
    const valB = sortBy === "name" ? (metaB?.title || "") : b.cat;
    
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "64px 24px 32px",
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
            margin: "0 0 4px",
            lineHeight: 1.4,
          }}
        >
          {th.heroSubtitle}
        </p>


        {/* Spec strip */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            paddingTop: 16,
            borderTop: "1px solid var(--hairline-soft)",
          }}
        >
          {SPEC_STRIP.map((s) => (
            <span key={s} className="tag" style={{ letterSpacing: "0.08em", fontSize: 10, padding: "2px 7px" }}>
              {s}
            </span>
          ))}
        </div>
      </header>

      {/* ─── Section label ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 14px", width: "100%" }}>
        <div className="sec-label" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span>{th.secCalculators}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginLeft: 2 }}>
              {CALCS.length} tools
            </span>
          </div>

          {/* Sorting Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div 
              style={{ 
                display: "flex", 
                background: "rgba(255,255,255,0.03)", 
                border: "1px solid var(--hairline-soft)",
                borderRadius: 20,
                padding: 2,
                gap: 2
              }}
            >
              {[
                { id: "default", label: "Default" },
                { id: "name",    label: "Name" },
                { id: "cat",     label: "Category" }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as "name" | "cat" | "default")}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 18,
                    fontSize: 9,
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    border: "none",
                    cursor: "pointer",
                    background: sortBy === opt.id ? "var(--accent)" : "transparent",
                    color: sortBy === opt.id ? "var(--bg)" : "var(--muted)",
                    transition: "all 0.2s ease"
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              className="tag"
              style={{ 
                height: 24, 
                padding: "0 8px", 
                display: "flex", 
                alignItems: "center", 
                gap: 4, 
                cursor: "pointer",
                borderColor: sortOrder === "desc" ? "var(--accent)" : "var(--glass-border)",
                color: sortOrder === "desc" ? "var(--accent)" : "var(--muted)"
              }}
            >
              {sortOrder === "asc" ? <SortAsc size={12} /> : <SortDesc size={12} />}
              <span style={{ fontSize: 9 }}>{sortOrder.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Aesthetic List View ─────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 16px 0px", 
          width: "100%",
          flex: 1,
        }}
      >
        <div className="hero-grid">
          {sortedCalcs.map((calc) => {
            const meta = th.calcs[calc.key as keyof typeof th.calcs];
            return (
              <Link
                key={calc.key}
                href={calc.href}
                className="vinci-card vinci-card-row card-hover cursor-card"
                style={{ textDecoration: "none", padding: "18px 20px" }}
              >
                {/* Left: Icon block */}
                <div
                  className="card-icon"
                  style={{
                    width: 44,
                    height: 44,
                    border: "1px solid var(--glass-border)",
                    borderRadius: "var(--r-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: calc.accent ? "var(--accent)" : "var(--muted)",
                    background: calc.accent ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.03)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <calc.Icon />
                </div>

                {/* Center: Title & Descriptor */}
                <div style={{ flex: 1, paddingLeft: 4, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "var(--fg)",
                        letterSpacing: "-0.015em",
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {meta?.title || "Untitled"}
                    </h2>
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
                  
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "12.5px",
                      color: "var(--fg-soft)",
                      lineHeight: 1.45,
                      margin: "2px 0 0",
                      opacity: 0.7,
                      fontWeight: 400,
                      maxWidth: "92%",
                    }}
                  >
                    {meta?.desc}
                  </p>
                </div>

                {/* Right: Modern Arrow indicator */}
                <div style={{ opacity: 0.3, color: "var(--fg-soft)", paddingRight: 4, alignSelf: "center" }}>
                  <ChevronRight size={18} strokeWidth={1.5} />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
