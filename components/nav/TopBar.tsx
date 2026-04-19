"use client";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useLang, type Lang } from "@/lib/i18n";

// ─── 4 da Vinci–inspired 32×32 SVG icons (cycle every 3 s) ───────────────────
const ICONS = [
  // 1 · Vitruvian Man
  <svg key="vitruv" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#0e0d0b"/>
    <circle cx="16" cy="16" r="11.5" stroke="#c9a96e" strokeWidth="1"/>
    <rect x="5.5" y="5.5" width="21" height="21" stroke="#c9a96e" strokeWidth="0.7"/>
    <line x1="16" y1="9.5" x2="16" y2="23.5" stroke="#c9a96e" strokeWidth="1.3"/>
    <line x1="8.5" y1="16" x2="23.5" y2="16" stroke="#c9a96e" strokeWidth="1.1"/>
    <circle cx="16" cy="8" r="1.8" stroke="#c9a96e" strokeWidth="0.9" fill="#0e0d0b"/>
    <line x1="10" y1="13.5" x2="16" y2="16" stroke="#c9a96e" strokeWidth="0.8" opacity="0.75"/>
    <line x1="22" y1="13.5" x2="16" y2="16" stroke="#c9a96e" strokeWidth="0.8" opacity="0.75"/>
    <line x1="12.5" y1="24.5" x2="16" y2="19" stroke="#c9a96e" strokeWidth="0.8" opacity="0.75"/>
    <line x1="19.5" y1="24.5" x2="16" y2="19" stroke="#c9a96e" strokeWidth="0.8" opacity="0.75"/>
  </svg>,

  // 2 · Compass (da Vinci drafting dividers)
  <svg key="compass" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#0e0d0b"/>
    <circle cx="16" cy="7" r="2" stroke="#c9a96e" strokeWidth="1" fill="#0e0d0b"/>
    <line x1="16" y1="9" x2="10" y2="25" stroke="#c9a96e" strokeWidth="1.3"/>
    <line x1="16" y1="9" x2="22" y2="25" stroke="#c9a96e" strokeWidth="1.3"/>
    <line x1="10" y1="25" x2="10" y2="27.5" stroke="#c9a96e" strokeWidth="1"/>
    <line x1="22" y1="25" x2="22" y2="27.5" stroke="#c9a96e" strokeWidth="1"/>
    <path d="M11.5 19 Q16 21 20.5 19" stroke="#c9a96e" strokeWidth="0.8" fill="none" opacity="0.6"/>
    <circle cx="16" cy="7" r="4.5" stroke="#c9a96e" strokeWidth="0.6" strokeDasharray="1.5 2" opacity="0.5"/>
    <line x1="13" y1="7" x2="19" y2="7" stroke="#c9a96e" strokeWidth="0.7" opacity="0.6"/>
  </svg>,

  // 3 · Golden Spiral
  <svg key="spiral" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#0e0d0b"/>
    <rect x="5" y="5" width="22" height="22" stroke="#c9a96e" strokeWidth="0.6" opacity="0.4"/>
    <rect x="5" y="5" width="13.5" height="13.5" stroke="#c9a96e" strokeWidth="0.5" opacity="0.35"/>
    <rect x="18.5" y="5" width="8.5" height="8.5" stroke="#c9a96e" strokeWidth="0.5" opacity="0.35"/>
    <rect x="18.5" y="13.5" width="8.5" height="5.5" stroke="#c9a96e" strokeWidth="0.5" opacity="0.35"/>
    <path d="M27 5 Q18.5 5 18.5 13.5 Q18.5 18.5 23.5 18.5 Q27 18.5 27 14.5 Q27 12 25 12" stroke="#c9a96e" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
  </svg>,

  // 4 · Anatomical Eye
  <svg key="eye" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#0e0d0b"/>
    <path d="M5 16 Q10 9 16 9 Q22 9 27 16 Q22 23 16 23 Q10 23 5 16Z" stroke="#c9a96e" strokeWidth="1.1" fill="none"/>
    <circle cx="16" cy="16" r="4.5" stroke="#c9a96e" strokeWidth="1"/>
    <circle cx="16" cy="16" r="2" fill="#c9a96e" opacity="0.55"/>
    <line x1="16" y1="4.5" x2="16" y2="7.5" stroke="#c9a96e" strokeWidth="0.8" opacity="0.5"/>
    <line x1="16" y1="24.5" x2="16" y2="27.5" stroke="#c9a96e" strokeWidth="0.8" opacity="0.5"/>
    <line x1="4.5" y1="16" x2="3" y2="16" stroke="#c9a96e" strokeWidth="0.7" opacity="0.4"/>
    <line x1="27.5" y1="16" x2="29" y2="16" stroke="#c9a96e" strokeWidth="0.7" opacity="0.4"/>
  </svg>,
];

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
