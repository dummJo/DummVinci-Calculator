"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  MoreHorizontal,
  Cable, Zap, X, History, Sparkles, AlertCircle, BookOpen,
  Settings2, ShieldPlus, Repeat, MonitorPlay, ZapOff, Columns, BoxSelect, Waves, Power, LineChart, Home, HardDrive
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
          background: var(--tabbar-bg);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid var(--accent);
          border-radius: 28px;
          padding: 20px;
          z-index: 180;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
          transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform-origin: bottom center;
        }
        .more-item:hover {
          background: rgba(255,255,255,0.08) !important;
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
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
        }
        .changelog-card {
          width: 100%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          background: var(--bg-raised);
          border: 1px solid var(--accent);
          border-radius: 28px;
          padding: 32px;
          position: relative;
          box-shadow: var(--glass-shadow);
        }
        .version-tag {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(var(--accent-rgb), 0.15);
          color: var(--accent);
          border-radius: 12px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          margin-bottom: 20px;
        }
      `}</style>

      {/* SVG filter removed for cleaner Telegram-style pill indicator */}

      {/* CHANGELOG MODAL */}
      {showChangelog && (
        <div className="modal-overlay" onClick={closeChangelog}>
          <div className="changelog-card" onClick={e => e.stopPropagation()} style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--glass-border)",
            boxShadow: "var(--glass-shadow)",
            padding: "32px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span className="version-tag" style={{ background: "var(--accent)", color: "#000", fontWeight: 800, letterSpacing: "0.1em" }}>{t.changelog.updateTitle}</span>
                <h2 style={{ fontSize: 28, fontFamily: "var(--font-display)", color: "var(--fg)", margin: "8px 0 0 0" }}>
                  {t.changelog.whatsNew}
                </h2>
              </div>
              <button onClick={closeChangelog} style={{ background: "none", border: "none", color: "var(--muted-soft)", cursor: "pointer" }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ marginTop: 24, fontSize: 14, lineHeight: 1.6, color: "var(--fg-soft)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)", marginBottom: 16 }}>
                <Sparkles size={18} /> <span style={{ fontWeight: 800, fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.1em" }}>{t.changelog.vibrationThemesTitle}</span>
              </div>
              <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                <li><b><span style={{color:"var(--fg)"}}>{t.changelog.skfMicrologTitle}</span></b>{t.changelog.skfMicrologDesc}</li>
                <li><b><span style={{color:"var(--fg)"}}>{t.changelog.crimsonPaletteTitle}</span></b>{t.changelog.crimsonPaletteDesc}</li>
                <li><b><span style={{color:"var(--fg)"}}>{t.changelog.consultantI18nTitle}</span></b>{t.changelog.consultantI18nDesc}</li>
              </ul>

              <hr style={{ border: "none", borderTop: "1px dashed rgba(var(--accent-rgb), 0.2)", margin: "24px 0" }} />
              
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", marginBottom: 12 }}>
                <AlertCircle size={14} /> <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 12 }}>{t.changelog.previousReleases}</span>
              </div>
              <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 8, opacity: 0.85, fontSize: 13 }}>
                <li>{t.changelog.v24Desc}</li>
                <li>{t.changelog.v23Desc}</li>
              </ul>
            </div>

            <button onClick={closeChangelog} style={{
              width: "100%", marginTop: 32, padding: "16px", borderRadius: 8,
              background: "linear-gradient(45deg, var(--accent), var(--accent-hi))",
              color: "var(--bg)", fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: 16, border: "none", cursor: "pointer",
              boxShadow: "0 4px 15px rgba(var(--accent-rgb), 0.3)",
              transition: "transform 0.1s"
            }} onMouseDown={e => e.currentTarget.style.transform="scale(0.98)"} onMouseUp={e => e.currentTarget.style.transform="scale(1)"}>
              {t.changelog.letsGo}
            </button>

            <div style={{ marginTop: 24, textAlign: "center", opacity: 0.65, fontSize: 10, fontFamily: "var(--font-mono)" }}>
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
                <tab.Icon size={22} strokeWidth={1.5} className={active ? "active-icon" : "inactive-icon"} />
                <span style={{ fontSize: 9, fontFamily: "var(--font-body), sans-serif", opacity: active ? 1 : 0.8, textAlign: "center", color: active ? "var(--accent)" : "var(--fg)", fontWeight: active ? 600 : 500 }}>
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
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: 20, cursor: "pointer", color: "var(--fg)", transition: "all 0.2s ease"
          }}
          className="hover-lift"
        >
          <History size={18} style={{ color: "var(--accent)" }} />
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--accent)" }}>{t.nav.changelog}</div>
            <div style={{ fontSize: 9, opacity: 0.85, color: "var(--fg)" }}>{t.changelog.stableVersion}</div>
          </div>
        </button>
      </div>

      <nav
        ref={navRef}
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
          zIndex: 100,
          padding: "0 10px",
          cursor: "pointer",
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
          <button className={clsx("tab-item", (showMore || isUtilityActive) && "tab-active")} style={{ background: "none", border: "none", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setShowMore(!showMore); }}>
            {showMore ? <X size={24} strokeWidth={2.4} style={{ color: "var(--accent)" }} /> : <MoreHorizontal size={24} strokeWidth={2.4} className={(showMore || isUtilityActive) ? "active-icon" : "inactive-icon"} />}
            <span className="tab-label">{showMore ? t.nav.close : t.nav.more}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
