"use client";
// app/page.tsx — DummVinci Calculator Landing Page
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import { getRandomQuote, type Quote } from "@/lib/quotes";
import { useState, useEffect } from "react";

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
    setHeroQuote(getRandomQuote());
  }, []);

  const CALCS = [
    {
      href: "/unified",
      Icon: IconUnified,
      title: th.calcs.unified.title,
      description: th.calcs.unified.desc,
      tag: "SMART-SIZE",
      accent: true,
    },
    {
      href: "/cable",
      Icon: IconCable,
      title: th.calcs.cable.title,
      description: th.calcs.cable.desc,
      tag: "IEC 60364",
    },
    {
      href: "/vsd",
      Icon: IconVSD,
      title: th.calcs.vsd.title,
      description: th.calcs.vsd.desc,
      tag: "ABB CATALOG",
    },
    {
      href: "/breaker",
      Icon: IconBreaker,
      title: th.calcs.breaker.title,
      description: th.calcs.breaker.desc,
      tag: "IEC 60947",
    },
    {
      href: "/busbar",
      Icon: IconBusbar,
      title: th.calcs.busbar.title,
      description: th.calcs.busbar.desc,
      tag: "DIN 43671",
    },
    {
      href: "/braking-resistor",
      Icon: IconBrake,
      title: th.calcs.brake.title,
      description: th.calcs.brake.desc,
      tag: "STAHL STD",
    },
    {
      href: "/panel",
      Icon: IconPanel,
      title: th.calcs.panel.title,
      description: th.calcs.panel.desc,
      tag: "IEC 60890",
    },
    {
      href: "/plc",
      Icon: IconPLC,
      title: th.calcs.plc.title,
      description: th.calcs.plc.desc,
      tag: "S7-1200/1500",
    },
    {
      href: "/starter",
      Icon: IconStarter,
      title: th.calcs.starter.title,
      description: th.calcs.starter.desc,
      tag: "SIRIUS 3RV/3RT",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ─── Compact Hero ─────────────────────────────────────────────── */}
      <header
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "40px 24px 28px",
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
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 400,
              color: "var(--fg)",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
              margin: "0 0 10px",
            }}
          >
            {/* "Dumm" — thin italic, slightly muted */}
            <span
              style={{
                fontWeight: 300,
                fontStyle: "italic",
                opacity: 0.65,
                letterSpacing: "-0.02em",
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
                letterSpacing: "-0.04em",
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
                fontSize: "clamp(10px, 1.2vw, 12px)",
                fontWeight: 500,
                color: "var(--muted)",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              {th.heroSub}
            </span>
          </div>
        </div>

        {/* Subtitle */}
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
        <div className="sec-label">
          <span>{th.secCalculators}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginLeft: 8 }}>
            {CALCS.length} tools
          </span>
        </div>
      </div>

      {/* ─── Compact Card Grid ─────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 16px 0px", // Reduced horizontal padding for mobile compactness
          width: "100%",
          flex: 1,
        }}
      >
        <div className="hero-grid">
          {CALCS.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              style={{ textDecoration: "none", display: "block", borderRadius: "var(--r-xl)" }}
            >
              <div
                className="vinci-card card-hover cursor-card"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  // padding removed as it's now in .vinci-card class
                  ...(calc.accent
                    ? {
                        borderColor: "rgba(201,168,76,0.35)",
                        background: "rgba(201,168,76,0.04)",
                      }
                    : {}),
                }}
              >
                {/* Icon + tag row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      border: "1px solid var(--glass-border)",
                      borderRadius: "var(--r-lg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: calc.accent ? "var(--accent)" : "var(--muted)",
                      background: calc.accent ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.03)",
                      flexShrink: 0,
                      transition: "color 0.2s, background 0.2s",
                    }}
                    className="card-icon"
                  >
                    <calc.Icon />
                  </div>
                  <span
                    className="tag"
                    style={{
                      letterSpacing: "0.08em",
                      fontSize: 9,
                      padding: "2px 6px",
                      ...(calc.accent ? { color: "var(--accent)", borderColor: "rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.08)" } : {}),
                    }}
                  >
                    {calc.tag}
                  </span>
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "16px", // Reduced from var(--fs-lg) for compact grid
                    fontWeight: 500,
                    color: "var(--fg)",
                    letterSpacing: "-0.01em",
                    margin: "0 0 6px",
                    lineHeight: 1.25,
                  }}
                >
                  {calc.title}
                </h2>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--muted)",
                    lineHeight: 1.6,
                    letterSpacing: "0.01em",
                    margin: "0 0 14px",
                    flex: 1,
                  }}
                >
                  {calc.description}
                </p>

                {/* CTA */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--accent)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    opacity: 0.8,
                  }}
                >
                  {th.ctaOpen}
                  <span style={{ fontSize: 12 }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
