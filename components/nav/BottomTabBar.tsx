"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutGrid, Activity, Cpu, Disc3, MoreHorizontal, 
  Cable, Zap, AlignJustify, Server, Disc, X, History, Sparkles, AlertCircle
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { clsx } from "clsx";

export default function BottomTabBar() {
  const path = usePathname();
  const { t } = useLang();
  const [showMore, setShowMore] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number, width: number } | null>(null);

  const MAIN_TABS = [
    { href: "/",            key: "home",    Icon: LayoutGrid },
    { href: "/unified",     key: "unified", Icon: Activity   },
    { href: "/vsd",         key: "drive",   Icon: Cpu        },
    { href: "/abb-support", key: "support", Icon: Disc3      },
  ];

  const UTILITY_TABS = [
    { href: "/cable",            key: "cable",   Icon: Cable        },
    { href: "/breaker",          key: "breaker", Icon: Zap          },
    { href: "/busbar",           key: "busbar",  Icon: AlignJustify },
    { href: "/panel",            key: "panel",   Icon: Server       },
    { href: "/braking-resistor", key: "brake",   Icon: Disc         },
  ];

  const allTabs = [...MAIN_TABS, ...UTILITY_TABS];
  const activeIndex = allTabs.findIndex(tab => tab.href === "/" ? path === "/" : path.startsWith(tab.href));
  const isUtilityActive = activeIndex >= MAIN_TABS.length;
  
  const [blobStyle, setBlobStyle] = useState({});

  useEffect(() => {
    const handleClose = () => {
      setShowMore(false);
    };
    if (showMore) {
      window.addEventListener("click", handleClose);
    }
    return () => window.removeEventListener("click", handleClose);
  }, [showMore]);

  useEffect(() => {
    const updateBlob = () => {
      if (navRef.current) {
        const activeEl = navRef.current.querySelector(".tab-active") as HTMLElement;
        if (activeEl) {
          setBlobStyle({
            width: activeEl.offsetWidth - 12,
            transform: `translateX(${activeEl.offsetLeft + 6}px)`,
            opacity: 1,
          });
        } else {
          setBlobStyle({ opacity: 0 });
        }
      }
    };
    updateBlob();
    window.addEventListener("resize", updateBlob);
    return () => window.removeEventListener("resize", updateBlob);
  }, [path, showMore]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest(".tab-item") as HTMLElement;
    if (target) {
      setHoverPos({
        x: target.offsetLeft + 6,
        width: target.offsetWidth - 12
      });
    } else {
      setHoverPos(null);
    }
  };

  return (
    <>
      <style>{`
        .liquid-container {
          filter: url('#gooey-dock');
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          height: 100%;
        }
        .liquid-glass {
          background: var(--tabbar-bg);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
        }
        .liquid-blob {
          position: absolute;
          top: 6px;
          bottom: 6px;
          left: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%),
                      linear-gradient(135deg, var(--accent) 0%, #ffdf9e 40%, var(--accent) 70%, #8c6510 100%);
          background-size: 200% 200%;
          border-radius: 24px;
          z-index: 1;
          transition: 
            transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1.1),
            width 0.35s cubic-bezier(0.2, 0.8, 0.2, 1.1),
            opacity 0.4s ease;
          pointer-events: none;
          box-shadow: 0 0 30px rgba(201, 168, 76, 0.2);
        }
        .hover-follower {
          position: absolute;
          top: 8px;
          bottom: 8px;
          left: 0;
          background: var(--accent);
          opacity: 0.08;
          border-radius: 20px;
          z-index: 0;
          transition: 
            transform 0.3s cubic-bezier(0.2, 0, 0, 1),
            width 0.3s cubic-bezier(0.2, 0, 0, 1),
            opacity 0.2s ease;
          pointer-events: none;
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
          opacity: 0.7 !important;
          transform: scale(0.95);
          transition: all 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .tab-item:hover .inactive-icon {
          opacity: 1 !important;
          transform: scale(1.05);
        }
        .tab-active .active-icon {
          color: var(--bg) !important;
          transform: scale(1.15);
          opacity: 1 !important;
        }
        .tab-label {
          font-family: var(--font-heading);
          font-size: 8px;
          margin-top: 4px;
          opacity: 0.5;
          transition: all 0.3s ease;
          pointer-events: none;
        }
        .tab-active .tab-label {
          opacity: 1;
          color: var(--accent);
          font-weight: 800;
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
          grid-template-columns: 1fr;
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
          border-color: rgba(201,168,76,0.5) !important;
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
          background: #0d1017;
          border: 1px solid var(--accent);
          border-radius: 28px;
          padding: 32px;
          position: relative;
          box-shadow: 0 32px 64px rgba(0,0,0,0.8);
        }
        .version-tag {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(201,168,76,0.15);
          color: var(--accent);
          border-radius: 12px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          margin-bottom: 20px;
        }
      `}</style>

      <svg style={{ visibility: "hidden", position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="gooey-dock">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* CHANGELOG MODAL */}
      {showChangelog && (
        <div className="modal-overlay" onClick={() => setShowChangelog(false)}>
          <div className="changelog-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <span className="version-tag">STABLE v2.1.0</span>
                <h2 style={{ fontSize: 24, fontFamily: "var(--font-display)", color: "white", margin: 0 }}>{t.nav.changelog}</h2>
              </div>
              <button onClick={() => setShowChangelog(false)} style={{ background: "none", border: "none", color: "var(--muted-soft)", cursor: "pointer" }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ marginTop: 24, fontSize: 13, lineHeight: 1.6, color: "var(--fg-soft)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)", marginBottom: 12 }}>
                <Sparkles size={16} /> <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>LATEST UPDATE</span>
              </div>
              <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                <li><b>Liquid Meta-ball UI</b>: Organic &quot;Gooey&quot; docking physics with SVG filters.</li>
                <li><b>Ghost Navigation</b>: Minimalist dock with invisible-until-active states.</li>
                <li><b>Hover Follower</b>: Tactile mouse-tracking indicator for real-time feedback.</li>
                <li><b>Golden Ratio Refactor</b>: All grids aligned to 1.618 harmonic proportions.</li>
                <li><b>Click-Outside Logic</b>: Auto-close overlays for cleaner mobile experience.</li>
              </ul>

              <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.05)", margin: "24px 0" }} />
              
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", marginBottom: 12 }}>
                <AlertCircle size={16} /> <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>V2.0.0 CORE FEATURES</span>
              </div>
              <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 8, opacity: 0.7 }}>
                <li>ABB Support Hub (Fault Lookup & Manuals).</li>
                <li>Full ULH (-31) High Harmonic Drive sizing.</li>
                <li>Ambient Temp (40°C+) Derating Logic.</li>
              </ul>
            </div>

            <div style={{ marginTop: 40, textAlign: "center", opacity: 0.5, fontSize: 10, fontFamily: "var(--font-mono)" }}>
              DummVinci Engineering • 2026 Production Build
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
        <div style={{ gridColumn: "span 3", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 12 }}>
          {UTILITY_TABS.map(tab => {
            const active = path.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href} className="more-item" onClick={() => setShowMore(false)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "16px 8px", borderRadius: 24, textDecoration: "none", color: "white", background: "rgba(255,255,255,0.03)" }}
              >
                <tab.Icon size={24} style={{ color: active ? "var(--accent)" : "rgba(255,255,255,0.6)" }} />
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", opacity: 0.8, textAlign: "center" }}>{t.nav[tab.key as keyof typeof t.nav]}</span>
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
            background: "linear-gradient(90deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.02) 100%)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: 20, cursor: "pointer", color: "white", transition: "all 0.2s ease"
          }}
          className="hover-lift"
        >
          <History size={18} style={{ color: "var(--accent)" }} />
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{t.nav.changelog}</div>
            <div style={{ fontSize: 9, opacity: 0.6 }}>Stable Production v2.1.0</div>
          </div>
        </button>
      </div>

      <nav
        ref={navRef}
        className="liquid-glass"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPos(null)}
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
        <div className="liquid-container">
          <div className="hover-follower" style={{ opacity: hoverPos ? 1 : 0, width: hoverPos?.width || 0, transform: `translateX(${hoverPos?.x || 0}px)` }} />
          <div className="liquid-blob" style={blobStyle} />
          {MAIN_TABS.map((tab) => {
            const active = tab.href === "/" ? path === "/" : path.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href} className={clsx("tab-item", active && "tab-active")} onClick={() => setShowMore(false)}>
                <tab.Icon size={24} className={active ? "active-icon" : "inactive-icon"} />
                <span className="tab-label">{t.nav[tab.key as keyof typeof t.nav]}</span>
              </Link>
            );
          })}
          <button className={clsx("tab-item", (showMore || isUtilityActive) && "tab-active")} style={{ background: "none", border: "none", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setShowMore(!showMore); }}>
            {showMore ? <X size={24} style={{ color: "var(--accent)" }} /> : <MoreHorizontal size={24} className={(showMore || isUtilityActive) ? "active-icon" : "inactive-icon"} />}
            <span className="tab-label">{showMore ? t.nav.close : t.nav.more}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
