"use client";
import ThemeToggle from "@/components/ThemeToggle";
import { useLang, type Lang } from "@/lib/i18n";

import Logo from "@/components/Logo";
import Link from "next/link";

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

export default function TopBar() {

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
        borderBottom: "none",

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        gap: 12,
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, textDecoration: "none" }}>
        <div style={{
          width: 32, height: 32,
          flexShrink: 0,
          color: "var(--accent)"
        }}>
          <Logo size={32} />
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-md)",
          color: "var(--fg)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "baseline",
          gap: "0.15em"
        }}>
          <span style={{ fontWeight: 300, fontStyle: "italic", opacity: 0.7 }}>Dumm</span>
          <span style={{ fontWeight: 700, color: "var(--accent)" }}>Vinci</span>
          <span style={{ 
            fontFamily: "var(--font-mono)", 
            fontSize: 8, 
            fontWeight: 500, 
            letterSpacing: "0.15em", 
            textTransform: "uppercase",
            marginLeft: 4,
            opacity: 0.5,
            color: "var(--accent)"
          }}>
            Calculator
          </span>
        </div>
      </Link>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <LangToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
