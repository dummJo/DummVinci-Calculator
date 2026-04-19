"use client";
// app/page.tsx — DummVinci Calculator Landing Page
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import { getRandomQuote } from "@/lib/quotes";
import { useState, useEffect } from "react";

const SPEC_STRIP = [
  "IEC 60364",
  "IEC 60947",
  "IEC 61439",
  "DIN 43671",
  "PUIL 2011",
  "ABB Hardware Manual",
  "STAHL CraneSystems",
];

export default function HomePage() {
  const { t } = useLang();
  const th = t.home;
  const [heroQuote, setHeroQuote] = useState("");

  useEffect(() => {
    setHeroQuote(getRandomQuote());
  }, []);

  const CALCS = [
    {
      href: "/cable",
      icon: "⌁",
      title: th.calcs.cable.title,
      description: th.calcs.cable.desc,
      tag: "IEC 60364-5-52",
    },
    {
      href: "/vsd",
      icon: "◎",
      title: th.calcs.vsd.title,
      description: th.calcs.vsd.desc,
      tag: "ABB CATALOG",
    },
    {
      href: "/breaker",
      icon: "⏻",
      title: th.calcs.breaker.title,
      description: th.calcs.breaker.desc,
      tag: "IEC 60947-2",
    },
    {
      href: "/busbar",
      icon: "≡",
      title: th.calcs.busbar.title,
      description: th.calcs.busbar.desc,
      tag: "DIN 43671",
    },
    {
      href: "/braking-resistor",
      icon: "Ω",
      title: th.calcs.brake.title,
      description: th.calcs.brake.desc,
      tag: "STAHL STANDARD",
    },
    {
      href: "/panel",
      icon: "▣",
      title: th.calcs.panel.title,
      description: th.calcs.panel.desc,
      tag: "IEC 60890",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <header
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "64px 24px 48px",
          width: "100%",
        }}
      >
        {/* Codex mark + brand line */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "1px solid var(--accent)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 18,
              color: "var(--accent)",
              flexShrink: 0,
              background: "rgba(201,168,76,0.06)",
            }}
          >
            ◈
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--fs-xs)",
              color: "var(--accent)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: heroQuote ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          >
            {heroQuote}
          </span>
        </div>

        {/* Display title */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 7vw, 80px)",
            fontWeight: 400,
            color: "var(--fg)",
            letterSpacing: "-0.025em",
            lineHeight: 1.0,
            margin: "0 0 20px",
          }}
        >
          {th.heroTitle}
          <br />
          <span style={{ color: "var(--accent)" }}>{th.heroSub}</span>
        </h1>

        {/* Mono subtitle */}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(12px, 1.8vw, 15px)",
            color: "var(--muted)",
            letterSpacing: "0.08em",
            margin: "0 0 36px",
            lineHeight: 1.6,
          }}
        >
          {th.heroSubtitle}
        </p>

        {/* Engineering spec strip */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            paddingTop: 24,
            borderTop: "1px solid var(--hairline-soft)",
          }}
        >
          {SPEC_STRIP.map((s) => (
            <span key={s} className="tag" style={{ letterSpacing: "0.10em" }}>
              {s}
            </span>
          ))}
        </div>
      </header>

      {/* ─── Section label ────────────────────────────────────────────── */}
      <div
        style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 20px", width: "100%" }}
      >
        <div className="sec-label">
          <span>{th.secCalculators}</span>
        </div>
      </div>

      {/* ─── Card grid ────────────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px 0px",
          width: "100%",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {CALCS.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              style={{
                textDecoration: "none",
                display: "block",
                borderRadius: "var(--r-2xl)",
              }}
            >
              <div
                className="vinci-card card-hover cursor-card"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  borderRadius: "var(--r-2xl)",
                }}
              >
                {/* Icon + tag row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      border: "1px solid var(--glass-border)",
                      borderRadius: "var(--r-lg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: 22,
                      color: "var(--accent)",
                      background: "rgba(201,168,76,0.06)",
                      flexShrink: 0,
                    }}
                  >
                    {calc.icon}
                  </div>
                  <span className="tag" style={{ letterSpacing: "0.10em", marginTop: 4 }}>
                    {calc.tag}
                  </span>
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--fs-xl)",
                    fontWeight: 400,
                    color: "var(--fg)",
                    letterSpacing: "-0.01em",
                    margin: "0 0 10px",
                    lineHeight: 1.2,
                  }}
                >
                  {calc.title}
                </h2>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--fs-xs)",
                    color: "var(--muted)",
                    lineHeight: 1.7,
                    letterSpacing: "0.02em",
                    margin: "0 0 24px",
                    flex: 1,
                  }}
                >
                  {calc.description}
                </p>

                {/* CTA row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--fs-xs)",
                    color: "var(--accent)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {th.ctaOpen}
                  <span style={{ fontSize: 14 }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
