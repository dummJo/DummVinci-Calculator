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
    const handleClose = () => setShowMore(false);
    if (showMore) {
      window.addEventListener("click", handleClose);
    }
    return () => window.removeEventListener("click", handleClose);
  }, [showMore]);

  useEffect(() => {
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
          background: rgba(13, 16, 22, 0.4);
          backdrop-filter: blur(50px) saturate(200%);
          -webkit-backdrop-filter: blur(50px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
        }
        .liquid-blob {
          position: absolute;
          top: 6px;
          bottom: 6px;
          left: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%),
                      linear-gradient(135deg, #c9a84c 0%, #ffdf9e 40%, #c9a84c 70%, #8c6510 100%);
          background-size: 200% 200%;
          border-radius: 24px;
          z-index: 1;
          transition: 
            transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
            width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
          box-shadow: 0 0 30px rgba(201, 168, 76, 0.4);
        }
        .hover-follower {
          position: absolute;
          top: 8px;
          bottom: 8px;
          left: 0;
          background: rgba(255, 255, 255, 0.08);
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
          transition: all 0.3s ease;
        }
        .active-icon {
          color: #0d1016 !important;
          transform: scale(1.15);
          filter: drop-shadow(0 0 2px rgba(255,255,255,0.4));
          opacity: 1 !important;
        }
        .inactive-icon {
          color: white;
          opacity: 0 !important; /* Invisible before selected */
          transform: scale(0.85);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .tab-item:hover .inactive-icon {
          opacity: 0.3 !important; /* Visible on hover */
          transform: scale(1);
        }
        .tab-label {
          font-family: var(--font-mono);
          font-size: 8px;
          margin-top: 4px;
          opacity: 0; /* Hidden by default */
          transition: all 0.3s ease;
          pointer-events: none;
        }
        .tab-active .tab-label {
          opacity: 1;
          color: var(--accent);
          font-weight: 700;
        }
        .tab-item:hover .tab-label {
          opacity: 0.7;
        }
        .more-overlay {
          position: fixed;
          bottom: 96px;
          left: 12px;
          right: 12px;
          max-width: 400px;
          margin: 0 auto;
          background: rgba(13, 16, 22, 0.95);
          backdrop-filter: blur(60px);
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px;
          z-index: 90;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          transform-origin: bottom center;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <svg style={{ visibility: "hidden", position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="gooey-dock">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -15" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* BACKDROP FOR CLICK-OUTSIDE */}
      {showMore && (
        <div 
          onClick={() => setShowMore(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "transparent"
          }} 
        />
      )}

      {/* MORE OVERLAY */}
      <div 
        className="more-overlay"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
        style={{ 
          opacity: showMore ? 1 : 0,
          transform: showMore ? "scale(1) translateY(0)" : "scale(0.8) translateY(40px)",
          pointerEvents: showMore ? "auto" : "none",
        }}
      >
        {UTILITY_TABS.map(tab => {
          const active = path.startsWith(tab.href);
          return (
            <Link 
              key={tab.href} 
              href={tab.href} 
              className="more-item"
              onClick={() => setShowMore(false)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 16, borderRadius: 24, textDecoration: "none", color: "white", background: "rgba(255,255,255,0.03)" }}
            >
              <tab.Icon size={24} style={{ color: active ? "var(--accent)" : "rgba(255,255,255,0.6)" }} />
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", opacity: 0.8 }}>{t.nav[tab.key]}</span>
            </Link>
          );
        })}
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
          {/* Mouse Follower */}
          <div 
            className="hover-follower" 
            style={{ 
              opacity: hoverPos ? 1 : 0,
              width: hoverPos?.width,
              transform: `translateX(${hoverPos?.x}px)`
            }} 
          />
          
          {/* Active Blob */}
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
                  size={24} 
                  className={active ? "active-icon" : "inactive-icon"} 
                />
                <span className="tab-label">{t.nav[tab.key]}</span>
              </Link>
            );
          })}

          <button
            className={clsx("tab-item", (showMore || isUtilityActive) && "tab-active")}
            style={{ background: "none", border: "none", cursor: "pointer" }}
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? (
              <X size={24} style={{ color: "var(--accent)" }} />
            ) : (
              <MoreHorizontal size={24} className={(showMore || isUtilityActive) ? "active-icon" : "inactive-icon"} />
            )}
            <span className="tab-label">{showMore ? t.nav.close : t.nav.more}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
