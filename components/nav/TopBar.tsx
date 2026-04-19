"use client";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useLang, type Lang } from "@/lib/i18n";

import { ICONS_SVG_STRINGS } from "@/components/DynamicIconManager";

// ─── 8 Vincinian icons from dummjo.dev (cycle every 3.2 s) ───────────────────
const ICONS = ICONS_SVG_STRINGS.map((svg, i) => (
  <div key={i} dangerouslySetInnerHTML={{ __html: svg }} />
));

// ─── Lang pill toggle ─────────────────────────────────────────────────────────
function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div style={{
      display: "flex",
      background: "var(--glass-bg)",
      border: "1px solid var(--glass-border)",
      borderRadius: "var(--r-pill)",
      padding: 2,
      gap: 1,
      flexShrink: 0,
    }}>
      {(["en", "id"] as Lang[]).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: "3px 9px",
            borderRadius: "var(--r-pill)",
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            border: "none",
            cursor: "pointer",
            background: lang === l ? "var(--accent)" : "transparent",
            color: lang === l ? "var(--bg-deep, #090807)" : "var(--muted)",
            fontWeight: lang === l ? 700 : 400,
            transition: "background 0.16s ease, color 0.16s ease",
            lineHeight: "18px",
          }}
        >
          {l === "en" ? "EN" : "ID"}
        </button>
      ))}
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
export default function TopBar() {
  const [iconIdx, setIconIdx] = useState(0);
  const [fading, setFading]   = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIconIdx(i => (i + 1) % ICONS.length);
        setFading(false);
      }, 260);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 90,
        height: "var(--nav-height)",
        background: "var(--nav-bg)",
        backdropFilter: "var(--nav-blur)",
        WebkitBackdropFilter: "var(--nav-blur)",
        borderBottom: "1px solid var(--glass-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        gap: 12,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32,
          borderRadius: 6,
          overflow: "hidden",
          flexShrink: 0,
          opacity: fading ? 0 : 1,
          transition: "opacity 0.24s ease",
        }}>
          {ICONS[iconIdx]}
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-md)",
          color: "var(--accent)",
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
        }}>
          DummVinci Calculator
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <LangToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
