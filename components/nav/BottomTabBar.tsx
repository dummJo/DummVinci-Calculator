"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutGrid, Activity, Cpu, Disc3, MoreHorizontal, 
  Cable, Zap, AlignJustify, Server, Disc, X
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { clsx } from "clsx";

export default function BottomTabBar() {
  const path = usePathname();
  const { t, lang } = useLang();
  const [showMore, setShowMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Main high-frequency tabs
  const MAIN_TABS = [
    { href: "/",            key: "home",    Icon: LayoutGrid },
    { href: "/unified",     key: "unified", Icon: Activity   },
    { href: "/vsd",         key: "drive",   Icon: Cpu        },
    { href: "/abb-support", key: "support", Icon: Disc3      },
  ];

  // Grouped calculators
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
  
  // Slide indicator logic
  const [blobStyle, setBlobStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navRef.current) {
      const activeEl = navRef.current.querySelector(".tab-active") as HTMLElement;
      if (activeEl) {
        setBlobStyle({
          width: activeEl.offsetWidth - 8,
          transform: `translateX(${activeEl.offsetLeft + 4}px)`,
          opacity: 1,
        });
      } else {
        setBlobStyle({ opacity: 0 });
      }
    }
  }, [path, showMore]);

  return (
    <>
      <style>{`
        .liquid-glass {
          background: rgba(20, 24, 33, 0.4);
          backdrop-filter: blur(40px) saturate(180%) contrast(100%);
          -webkit-backdrop-filter: blur(40px) saturate(180%) contrast(100%);
          border: 0.5px solid rgba(255, 255, 255, 0.12);
          box-shadow: 
            0 8px 32px -4px rgba(0, 0, 0, 0.5),
            inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .liquid-blob {
          position: absolute;
          top: 8px;
          bottom: 8px;
          left: 0;
          background: linear-gradient(135deg, rgba(201, 168, 76, 0.25) 0%, rgba(201, 168, 76, 0.08) 100%);
          border-radius: 20px;
          z-index: 0;
          /* Super elastic spring transition */
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
          box-shadow: 
            0 4px 12px rgba(201,168,76,0.15),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .tab-item {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
          text-decoration: none;
          transition: transform 0.2s ease;
        }
        .tab-item:active {
          transform: scale(0.92);
        }
        .icon-glow {
          transition: filter 0.3s ease, color 0.3s ease;
        }
        .active-glow {
          filter: drop-shadow(0 0 10px rgba(201, 168, 76, 0.6));
          color: var(--accent) !important;
          animation: spring-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes spring-pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.25); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .liquid-blob {
          will-change: transform, width;
        }
        .more-overlay {
          position: fixed;
          bottom: 100px;
          left: 12px;
          right: 12px;
          max-width: 400px;
          margin: 0 auto;
          padding: 24px;
          border-radius: 28px;
          z-index: 90;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          transform-origin: bottom center;
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1.15);
        }
        .more-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 20px;
          text-decoration: none;
          color: var(--muted);
          transition: all 0.2s ease;
        }
        .more-item:hover {
          background: rgba(255,255,255,0.05);
          color: var(--accent);
        }
      `}</style>

      {/* MORE OVERLAY */}
      <div 
        className="liquid-glass more-overlay"
        style={{ 
          opacity: showMore ? 1 : 0,
          transform: showMore ? "scale(1) translateY(0)" : "scale(0.8) translateY(20px)",
          pointerEvents: showMore ? "auto" : "none",
        }}
      >
        {UTILITY_TABS.map(tab => {
          const active = path.startsWith(tab.href);
          return (
            <Link 
              key={tab.href} 
              href={tab.href} 
              className="more-item hover-lift"
              onClick={() => setShowMore(false)}
            >
              <div style={{ 
                width: 44, height: 44, borderRadius: 14, background: "rgba(201,168,76,0.1)",
                display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
                color: active ? "var(--accent)" : "inherit"
              }}>
                <tab.Icon size={22} />
              </div>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", textAlign: "center" }}>{t.nav[tab.key]}</span>
            </Link>
          );
        })}
      </div>

      <nav
        ref={navRef}
        className="liquid-glass"
        style={{
          position: "fixed",
          bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
          left: 12,
          right: 12,
          maxWidth: 450,
          margin: "0 auto",
          height: 68,
          borderRadius: 34,
          display: "flex",
          padding: "0 8px",
          zIndex: 100,
        }}
      >
        <div className="liquid-blob" style={blobStyle} />

        {MAIN_TABS.map((tab) => {
          const active = tab.href === "/" ? path === "/" : path.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx("tab-item", active && "tab-active")}
              onClick={() => setShowMore(false)}
            >
              <tab.Icon 
                size={22} 
                className={clsx("icon-glow", active ? "active-glow" : "color-muted")} 
                style={{ color: active ? "var(--accent)" : "rgba(255,255,255,0.4)" }}
              />
              <span style={{ 
                fontSize: 8, 
                marginTop: 4, 
                opacity: active ? 1 : 0.5, 
                color: active ? "var(--accent)" : "white",
                fontWeight: active ? 700 : 400,
                fontFamily: "var(--font-mono)"
              }}>
                {t.nav[tab.key]}
              </span>
            </Link>
          );
        })}

        {/* MORE BUTTON */}
        <button
          className={clsx("tab-item", (showMore || isUtilityActive) && "tab-active")}
          style={{ background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? (
            <X size={22} className="color-accent" />
          ) : (
            <MoreHorizontal size={22} className={clsx("icon-glow", isUtilityActive ? "active-glow" : "color-muted")} style={{ color: isUtilityActive ? "var(--accent)" : "rgba(255,255,255,0.4)" }} />
          )}
          <span style={{ 
            fontSize: 8, marginTop: 4, 
            opacity: (showMore || isUtilityActive) ? 1 : 0.5, 
            color: (showMore || isUtilityActive) ? "var(--accent)" : "white",
            fontWeight: (showMore || isUtilityActive) ? 700 : 400,
            fontFamily: "var(--font-mono)"
          }}>
            {showMore ? t.nav.close : t.nav.more}
          </span>
        </button>
      </nav>
    </>
  );
}
