"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Activity, Cable, Cpu, Zap, AlignJustify, Disc3, Server,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface Tab { href: string; key: keyof ReturnType<typeof useLang>["t"]["nav"]; Icon: LucideIcon }

const TABS: Tab[] = [
  { href: "/",                 key: "home",    Icon: LayoutGrid   },
  { href: "/unified",          key: "unified", Icon: Activity     },
  { href: "/cable",            key: "cable",   Icon: Cable        },
  { href: "/vsd",              key: "drive",   Icon: Cpu          },
  { href: "/breaker",          key: "breaker", Icon: Zap          },
  { href: "/busbar",           key: "busbar",  Icon: AlignJustify },
  { href: "/panel",            key: "panel",   Icon: Server       },
  { href: "/abb-support",      key: "support", Icon: Disc3        },
];

export default function BottomTabBar() {
  const path = usePathname();
  const { t } = useLang();

  return (
    <>
      <style>{`
        @keyframes pillPop {
          0%   { transform: scale3d(0.85, 0.85, 1); opacity: 0; }
          100% { transform: scale3d(1, 1, 1);       opacity: 1; }
        }
        @keyframes iconBounce {
          0%   { transform: translate3d(0, 0, 0) scale3d(1, 1, 1); }
          45%  { transform: translate3d(0, -2px, 0) scale3d(1.1, 1.1, 1); }
          100% { transform: translate3d(0, 0, 0) scale3d(1, 1, 1); }
        }
        .tab-link {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-decoration: none;
          background-image: none !important;
          padding: 6px 2px calc(8px + env(safe-area-inset-bottom, 0px));
          position: relative;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .tab-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 32px;
          z-index: 1;
        }
        .tab-pill {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          pointer-events: none;
          transition: opacity 0.2s ease;
          will-change: transform, opacity;
          z-index: -1;
        }
        .tab-pill--active {
          background: var(--accent-pill-bg, rgba(201,168,76,0.12));
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 0 0 1px rgba(201,168,76,0.2),
            0 4px 12px rgba(201,168,76,0.08);
          animation: pillPop 0.28s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        [data-theme="light"] .tab-pill--active {
          background: rgba(140,101,16,0.08);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.4),
            0 0 0 1px rgba(140,101,16,0.15),
            0 4px 12px rgba(140,101,16,0.06);
        }
        .tab-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.18s ease;
          will-change: transform;
        }
        .tab-icon--active {
          animation: iconBounce 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .tab-label {
          font-family: var(--font-mono);
          font-size: 8.5px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          line-height: 1;
          transition: color 0.18s ease, opacity 0.18s ease;
          text-align: center;
        }
      `}</style>
      <nav
        style={{
          position: "fixed",
          bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
          left: 12,
          right: 12,
          maxWidth: 600,
          margin: "0 auto",
          zIndex: 100,
          display: "flex",
          alignItems: "stretch",
          height: 64,
          background: "var(--tabbar-floating-bg, rgba(13,16,22,0.85))",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          border: "1px solid var(--glass-border-bold, rgba(255,255,255,0.08))",
          borderRadius: 32,
          boxShadow: "0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)",
          overflow: "hidden",
          padding: "0 4px",
        }}
      >
        {TABS.map(tab => {
          const active = tab.href === "/" ? path === "/" : path.startsWith(tab.href);
          const { Icon } = tab;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="tab-link"
              style={{
                color: active ? "var(--accent)" : "var(--muted)",
                paddingTop: 8,
                paddingBottom: 8,
              }}
            >
              <div className="tab-icon-wrapper">
                {active && <span className="tab-pill tab-pill--active" />}
                <span className={`tab-icon${active ? " tab-icon--active" : ""}`}>
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.8} absoluteStrokeWidth />
                </span>
              </div>
              <span
                className="tab-label"
                style={{
                  color: active ? "var(--accent)" : "var(--muted-soft)",
                  opacity: active ? 1 : 0.6,
                  fontWeight: active ? 700 : 400,
                  fontSize: 8,
                }}
              >
                {t.nav[tab.key]}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
