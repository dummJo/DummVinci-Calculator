"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  MoreHorizontal,
  Cable, Zap, X, History, Sparkles, AlertCircle, BookOpen,
  Settings2, ShieldPlus, Repeat, MonitorPlay, ZapOff, Columns, BoxSelect, Waves, Power, LineChart, Home, HardDrive, FileText
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { clsx } from "clsx";

function getNavLabel(key: string, t: { nav: Record<string, string> }): string {
  switch (key) {
    case "home": return t.nav.home;
    case "unified": return t.nav.unified;
    case "drive": return t.nav.drive;
    case "support": return t.nav.support;
    case "cable": return t.nav.cable;
    case "breaker": return t.nav.breaker;
    case "busbar": return t.nav.busbar;
    case "panel": return t.nav.panel;
    case "brake": return t.nav.brake;
    case "plc": return t.nav.plc;
    case "starter": return t.nav.starter;
    case "pid": return t.nav.pid;
    case "convert": return t.nav.convert;
    case "tutorials": return t.nav.tutorials;
    case "skfMicrolog": return t.nav.skfMicrolog;
    case "abbDriveCare": return t.nav.abbDriveCare;
    default: return "";
  }
}

export default function BottomTabBar() {
  const path = usePathname();
  const { t } = useLang();
  const [showMore, setShowMore] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("dummvinci_v2_7_seen");
      if (!seen) {
        // slight delay for dramatic effect
        const tid = setTimeout(() => setShowChangelog(true), 800);
        return () => clearTimeout(tid);
      }
    }
  }, []);

  const closeChangelog = () => {
    setShowChangelog(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("dummvinci_v2_7_seen", "true");
    }
  };
  const navRef = useRef<HTMLDivElement>(null);

  const MAIN_TABS = [
    { href: "/",            key: "home",    Icon: Home      },
    { href: "/unified",     key: "unified", Icon: Zap       },
    { href: "/vsd",         key: "drive",   Icon: Settings2 },
    { href: "/abb-support", key: "support", Icon: ShieldPlus},
  ];

  const UTILITY_TABS = [
    { href: "/cable",            key: "cable",   Icon: Cable        },
    { href: "/breaker",          key: "breaker", Icon: ZapOff       },
    { href: "/busbar",           key: "busbar",  Icon: Columns      },
    { href: "/panel",            key: "panel",   Icon: BoxSelect    },
    { href: "/braking-resistor", key: "brake",   Icon: Waves        },
    { href: "/plc",              key: "plc",     Icon: HardDrive    },
    { href: "/starter",          key: "starter", Icon: Power        },
    { href: "/pid",              key: "pid",     Icon: LineChart    },
    { href: "/convert",          key: "convert", Icon: Repeat       },
    { href: "/tutorials",        key: "tutorials", Icon: MonitorPlay   },
    { href: "/skf-microlog",     key: "skfMicrolog", Icon: BookOpen      },
    { href: "/abb-drivecare",    key: "abbDriveCare", Icon: FileText    },
  ];

  const allTabs = [...MAIN_TABS, ...UTILITY_TABS];
  const activeIndex = allTabs.findIndex(tab => tab.href === "/" ? path === "/" : path.startsWith(tab.href));
  const isUtilityActive = activeIndex >= MAIN_TABS.length;
  
  useEffect(() => {
    const handleClose = () => {
      setShowMore(false);
    };
    if (showMore) {
      window.addEventListener("click", handleClose);
    }
    return () => window.removeEventListener("click", handleClose);
  }, [showMore]);

  // Esc to close changelog modal — keyboard-accessible dismiss.
  // Esc to close changelog modal — keyboard-accessible dismiss.
  useEffect(() => {
    if (!showChangelog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowChangelog(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showChangelog]);

  // Auto-hide on scroll-down, reveal on scroll-up. Always visible near the top.
  // Respects prefers-reduced-motion via the global CSS rule (the translate
  // transition is suppressed there, so the bar still hides but without animation).
  const [hiddenByScroll, setHiddenByScroll] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const delta = y - lastY;
        // Ignore tiny jitters; always show near the top.
        if (Math.abs(delta) < 6) { lastY = y; return; }
        if (y < 80) setHiddenByScroll(false);
        else if (delta > 0) setHiddenByScroll(true);
        else setHiddenByScroll(false);
        lastY = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  // Keep the bar visible while a modal/overlay is open so the user can dismiss it.
  const isHidden = hiddenByScroll && !showMore && !showChangelog;

  return (
    <>
      <style>{`
        .telegram-container {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          height: 100%;
        }
        .telegram-glass {
          background: var(--tabbar-bg);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid var(--glass-border);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
          transform: translateZ(0); /* Force hardware layer */
        }
        .tab-item {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
        .inactive-icon {
          color: var(--fg);
          opacity: 0.6;
          transform: scale(0.95) translateY(2px);
          transition: transform 0.4s cubic-bezier(0.1, 0.7, 0.1, 1), opacity 0.4s ease, color 0.4s ease;
          will-change: transform, opacity;
        }
        .tab-item:active .inactive-icon, .tab-item:active .active-icon {
          transform: scale(0.85);
          transition-duration: 0.1s;
        }
        .tab-item:hover .inactive-icon {
          opacity: 1 !important;
          transform: scale(1.02) translateY(1px);
        }
        
        @keyframes liquidPop {
          0% { 
            transform: scale(0.95) translateY(2px); 
            filter: drop-shadow(0 0 0 transparent);
          }
          5% { 
            transform: scale(1.3) translateY(-8px); 
            filter: drop-shadow(0 16px 24px rgba(var(--accent-rgb), 0.9));
          }
          100% { 
            transform: scale(1.15) translateY(-4px); 
            filter: drop-shadow(0 8px 12px rgba(var(--accent-rgb), 0.6));
          }
        }
        
        .tab-active .active-icon {
          color: var(--accent) !important;
          animation: liquidPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          will-change: transform, filter, opacity;
        }
        .tab-label {
          font-family: var(--font-body), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 10px;
          margin-top: 4px;
          opacity: 0.7;
          transition: transform 0.4s cubic-bezier(0.1, 0.7, 0.1, 1), opacity 0.4s ease, color 0.4s ease, filter 0.4s ease;
          pointer-events: none;
          color: var(--fg);
          font-weight: 500;
          will-change: transform, opacity, color;
        }
        .tab-active .tab-label {
          opacity: 1;
          color: var(--accent);
          font-weight: 700;
          letter-spacing: 0.02em;
          filter: drop-shadow(0 2px 4px rgba(var(--accent-rgb), 0.3));
          transform: translateY(-2px);
        }
        .more-overlay {
          position: fixed;
          bottom: 104px;
          left: 12px;
          right: 12px;
          max-width: 434px;
          margin: 0 auto;
          background: var(--popout-bg);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid var(--popout-border);
          border-radius: 28px;
          padding: 20px;
          z-index: 180;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.30);
          transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform-origin: bottom center;
        }
        .more-item {
          color: var(--popout-fg) !important;
        }
        .more-item:hover {
          background: var(--accent-pill-bg) !important;
          transform: translateY(-2px);
        }
        .hover-lift {
          transition: all 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 12px 24px rgba(0,0,0,0.2);
          border-color: rgba(var(--accent-rgb), 0.5) !important;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: radial-gradient(circle at 50% 40%, rgba(var(--accent-rgb), 0.10) 0%, rgba(0, 0, 0, 0.55) 60%, rgba(0, 0, 0, 0.7) 100%);
          backdrop-filter: blur(12px) saturate(140%);
          -webkit-backdrop-filter: blur(12px) saturate(140%);
          animation: clOverlayIn 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes clOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes clCardIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .changelog-card {
          width: 100%;
          max-width: 520px;
          max-height: 85vh;
          overflow-y: auto;
          background: var(--popout-bg);
          color: var(--popout-fg);
          border: 1px solid var(--popout-border);
          border-radius: 24px;
          padding: 28px 28px 24px;
          position: relative;
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(var(--accent-rgb), 0.08);
          animation: clCardIn 0.42s cubic-bezier(0.2, 0.8, 0.2, 1);
          overflow-x: hidden;
        }
        .changelog-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0.85;
        }
        .changelog-card * {
          color: inherit;
        }
        .changelog-card::-webkit-scrollbar { width: 6px; }
        .changelog-card::-webkit-scrollbar-thumb {
          background: rgba(var(--accent-rgb), 0.25);
          border-radius: 3px;
        }
        .version-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px 5px 8px;
          background: rgba(var(--accent-rgb), 0.10);
          color: var(--accent);
          border: 1px solid rgba(var(--accent-rgb), 0.22);
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .version-tag::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.7);
        }
        .cl-section-label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--popout-muted);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .cl-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, var(--popout-border), transparent);
        }
        .cl-feature-row {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          align-items: start;
          padding: 14px 14px 14px 12px;
          border-radius: 14px;
          background: rgba(var(--accent-rgb), 0.04);
          border: 1px solid rgba(var(--accent-rgb), 0.10);
          transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
        }
        .cl-feature-row:hover {
          background: rgba(var(--accent-rgb), 0.08);
          border-color: rgba(var(--accent-rgb), 0.22);
          transform: translateY(-1px);
        }
        .cl-feature-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--accent);
          margin-top: 7px;
          box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.18);
          flex-shrink: 0;
        }
        .cl-feature-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 14px;
          color: var(--popout-fg);
          line-height: 1.3;
          margin-bottom: 4px;
        }
        .cl-feature-desc {
          font-size: 13px;
          line-height: 1.55;
          color: var(--popout-muted);
        }
        .cl-prev-chip {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 8px;
          background: rgba(var(--accent-rgb), 0.04);
          border: 1px solid var(--popout-border);
          font-size: 12px;
          color: var(--popout-muted);
        }
        .cl-prev-chip b {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--accent);
          letter-spacing: 0.08em;
        }
        .cl-cta-pill {
          width: 100%;
          margin-top: 24px;
          padding: 15px 24px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--popout-bg);
          background: linear-gradient(135deg, var(--accent), var(--popout-muted));
          box-shadow: 0 8px 24px rgba(var(--accent-rgb), 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.25);
          transition: transform 0.12s ease, box-shadow 0.18s ease;
        }
        .cl-cta-pill:hover {
          box-shadow: 0 10px 28px rgba(var(--accent-rgb), 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.32);
        }
        .cl-cta-pill:active {
          transform: scale(0.98);
        }
        .cl-close-btn {
          background: rgba(var(--accent-rgb), 0.06);
          border: 1px solid var(--popout-border);
          color: var(--popout-muted);
          cursor: pointer;
          width: 32px; height: 32px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.16s ease, color 0.16s ease, transform 0.12s ease;
          flex-shrink: 0;
        }
        .cl-close-btn:hover {
          background: rgba(var(--accent-rgb), 0.14);
          color: var(--accent);
        }
        .cl-close-btn:active {
          transform: scale(0.92);
        }
        @media (prefers-reduced-motion: reduce) {
          .modal-overlay,
          .changelog-card { animation: none !important; }
          .cl-feature-row:hover { transform: none; }
        }
      `}</style>

      {/* SVG filter removed for cleaner Telegram-style pill indicator */}

      {/* CHANGELOG MODAL */}
      {showChangelog && (
        <div
          className="modal-overlay"
          onClick={closeChangelog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="changelog-title"
        >
          <div className="changelog-card" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 22 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
                <span className="version-tag">
                  {t.changelog.updateTitle}
                </span>
                <h2
                  id="changelog-title"
                  style={{
                    fontSize: 30,
                    lineHeight: 1.1,
                    fontFamily: "var(--font-display)",
                    color: "var(--popout-fg)",
                    margin: 0,
                    letterSpacing: "-0.02em",
                    fontWeight: 700,
                  }}
                >
                  {t.changelog.whatsNew}
                </h2>
              </div>
              <button type="button" aria-label={t.nav.close} onClick={closeChangelog} className="cl-close-btn">
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            {/* Highlights section label */}
            <div className="cl-section-label" style={{ marginBottom: 14 }}>
              <Sparkles size={14} strokeWidth={2.4} style={{ color: "var(--accent)" }} />
              <span>{t.changelog.vibrationThemesTitle}</span>
            </div>

            {/* Highlight cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="cl-feature-row">
                <span className="cl-feature-dot" />
                <div>
                  <div className="cl-feature-title">{t.changelog.skfMicrologTitle}</div>
                  <div className="cl-feature-desc">{t.changelog.skfMicrologDesc}</div>
                </div>
              </div>
              <div className="cl-feature-row">
                <span className="cl-feature-dot" />
                <div>
                  <div className="cl-feature-title">{t.changelog.crimsonPaletteTitle}</div>
                  <div className="cl-feature-desc">{t.changelog.crimsonPaletteDesc}</div>
                </div>
              </div>
              <div className="cl-feature-row">
                <span className="cl-feature-dot" />
                <div>
                  <div className="cl-feature-title">{t.changelog.consultantI18nTitle}</div>
                  <div className="cl-feature-desc">{t.changelog.consultantI18nDesc}</div>
                </div>
              </div>
            </div>

            {/* Previous releases */}
            <div className="cl-section-label" style={{ marginTop: 26, marginBottom: 12 }}>
              <AlertCircle size={12} strokeWidth={2.4} />
              <span>{t.changelog.previousReleases}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="cl-prev-chip"><b>v2.4</b><span>{t.changelog.v24Desc}</span></div>
              <div className="cl-prev-chip"><b>v2.3</b><span>{t.changelog.v23Desc}</span></div>
            </div>

            {/* CTA */}
            <button type="button" onClick={closeChangelog} className="cl-cta-pill">
              {t.changelog.letsGo}
            </button>

            {/* Brand footer */}
            <div style={{
              marginTop: 18,
              textAlign: "center",
              opacity: 0.55,
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              color: "var(--popout-muted)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}>
              {t.changelog.byDummVinci}
            </div>
          </div>
        </div>
      )}

      {/* BACKDROP FOR CLICK-OUTSIDE */}
      {showMore && (
        <div 
          onClick={() => setShowMore(false)}
          style={{ position: "fixed", inset: 0, zIndex: 80, background: "transparent" }} 
        />
      )}

      {/* MORE OVERLAY */}
      <div 
        className="more-overlay"
        onClick={e => e.stopPropagation()}
        style={{ 
          opacity: showMore ? 1 : 0,
          transform: showMore ? "scale(1) translateY(0)" : "scale(0.8) translateY(40px)",
          pointerEvents: showMore ? "auto" : "none",
        }}
      >
        <div style={{ 
          gridColumn: "span 3", 
          display: "flex", 
          flexWrap: "wrap", 
          justifyContent: "center", 
          gap: 12, 
          marginBottom: 12 
        }}>
          {UTILITY_TABS.map(tab => {
            const active = path.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href} className={clsx("more-item", active && "tab-active")} onClick={() => setShowMore(false)}
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: 8, 
                  padding: "16px 4px", 
                  borderRadius: 24, 
                  textDecoration: "none",
                  width: "calc(33.33% - 12px)",
                  minWidth: "90px"
                }}
              >
                <tab.Icon size={22} strokeWidth={1.5} className={active ? "active-icon" : "inactive-icon"} style={{ color: active ? "var(--popout-muted)" : "var(--popout-fg)" }} />
                <span style={{ fontSize: 9, fontFamily: "var(--font-body), sans-serif", opacity: active ? 1 : 0.8, textAlign: "center", color: active ? "var(--popout-muted)" : "var(--popout-fg)", fontWeight: active ? 600 : 500 }}>
                  {getNavLabel(tab.key, t)}
                </span>
              </Link>
            );
          })}
        </div>
        
        {/* CHANGELOG TRIGGER BANNER */}
        <button 
          onClick={() => { setShowChangelog(true); setShowMore(false); }}
          style={{ 
            gridColumn: "span 3",
            display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
            background: "var(--accent-pill-bg)",
            border: "1px solid var(--popout-border)",
            borderRadius: 20, cursor: "pointer", color: "var(--popout-fg)", transition: "all 0.2s ease"
          }}
          className="hover-lift"
        >
          <History size={18} style={{ color: "var(--popout-muted)" }} />
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--popout-muted)" }}>{t.nav.changelog}</div>
            <div style={{ fontSize: 9, opacity: 0.85, color: "var(--popout-fg)" }}>{t.changelog.stableVersion}</div>
          </div>
        </button>
      </div>

      <nav
        ref={navRef}
        aria-label="Main navigation"
        aria-hidden={isHidden}
        className="telegram-glass"
        style={{
          position: "fixed",
          bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
          left: 12,
          right: 12,
          maxWidth: 450,
          margin: "0 auto",
          height: 72,
          borderRadius: 36,
          transform: isHidden
            ? "translateY(calc(100% + 32px + env(safe-area-inset-bottom, 0px)))"
            : "translateY(0)",
          transition: "transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)",
          pointerEvents: isHidden ? "none" : "auto",
          zIndex: 100,
          padding: "0 10px",
        }}
      >
        <div className="telegram-container">
          {MAIN_TABS.map((tab) => {
            const active = tab.href === "/" ? path === "/" : path.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href} className={clsx("tab-item", active && "tab-active")} onClick={() => setShowMore(false)}>
                <tab.Icon size={24} strokeWidth={2.4} className={active ? "active-icon" : "inactive-icon"} />
                <span className="tab-label">{getNavLabel(tab.key, t)}</span>
              </Link>
            );
          })}
          <button type="button" aria-haspopup="true" aria-expanded={showMore} aria-label={showMore ? t.nav.close : t.nav.more} className={clsx("tab-item", (showMore || isUtilityActive) && "tab-active")} style={{ background: "none", border: "none", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setShowMore(!showMore); }}>
            {showMore ? <X size={24} strokeWidth={2.4} style={{ color: "var(--accent)" }} /> : <MoreHorizontal size={24} strokeWidth={2.4} className={(showMore || isUtilityActive) ? "active-icon" : "inactive-icon"} />}
            <span className="tab-label">{showMore ? t.nav.close : t.nav.more}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
