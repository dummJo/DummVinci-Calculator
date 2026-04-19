"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Cable, Cpu, Zap, AlignJustify, Disc3, Server,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface Tab { href: string; key: keyof ReturnType<typeof useLang>["t"]["nav"]; Icon: LucideIcon }

const TABS: Tab[] = [
  { href: "/",                 key: "home",    Icon: LayoutGrid   },
  { href: "/cable",            key: "cable",   Icon: Cable        },
  { href: "/vsd",              key: "drive",   Icon: Cpu          },
  { href: "/breaker",          key: "breaker", Icon: Zap          },
  { href: "/busbar",           key: "busbar",  Icon: AlignJustify },
  { href: "/braking-resistor", key: "brake",   Icon: Disc3        },
  { href: "/panel",            key: "panel",   Icon: Server       },
];

export default function BottomTabBar() {
  const path = usePathname();
  const { t } = useLang();

  return (
    <>
      <style>{`
        @keyframes pillPop {
          0%   { transform: scale(0.72); opacity: 0; }
          60%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes iconBounce {
          0%   { transform: translateY(0) scale(1); }
          35%  { transform: translateY(-3px) scale(1.18); }
          65%  { transform: translateY(1px) scale(0.94); }
          100% { transform: translateY(0) scale(1); }
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
          padding: 8px 4px calc(8px + env(safe-area-inset-bottom, 0px));
          position: relative;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .tab-pill {
          position: absolute;
          top: 7px;
          left: 50%;
          transform: translateX(-50%);
          width: 52px;
          height: 34px;
          border-radius: 12px;
          pointer-events: none;
          transition: opacity 0.22s ease;
        }
        .tab-pill--active {
          background: var(--accent-pill-bg, rgba(201,168,76,0.16));
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.12),
            inset 0 -1px 0 rgba(0,0,0,0.10),
            0 0 0 1px rgba(201,168,76,0.22),
            0 4px 16px rgba(201,168,76,0.12);
          animation: pillPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        [data-theme="light"] .tab-pill--active {
          background: rgba(140,101,16,0.12);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.5),
            inset 0 -1px 0 rgba(0,0,0,0.06),
            0 0 0 1px rgba(140,101,16,0.25),
            0 4px 16px rgba(140,101,16,0.10);
        }
        .tab-icon {
          position: relative;
          z-index: 1;
          transition: color 0.18s ease;
        }
        .tab-icon--active {
          animation: iconBounce 0.36s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .tab-label {
          position: relative;
          z-index: 1;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          line-height: 1;
          transition: color 0.18s ease, opacity 0.18s ease;
        }
      `}</style>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "stretch",
          height: "calc(64px + env(safe-area-inset-bottom, 0px))",
          background: "var(--tabbar-bg, rgba(10,13,18,0.62))",
          backdropFilter: "blur(48px) saturate(200%) brightness(1.06)",
          WebkitBackdropFilter: "blur(48px) saturate(200%) brightness(1.06)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
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
              style={{ color: active ? "var(--accent)" : "var(--muted)" }}
            >
              {active && <span className="tab-pill tab-pill--active" />}
              <span className={`tab-icon${active ? " tab-icon--active" : ""}`}>
                <Icon size={22} strokeWidth={active ? 2.2 : 1.6} absoluteStrokeWidth />
              </span>
              <span
                className="tab-label"
                style={{
                  color: active ? "var(--accent)" : "var(--muted-soft)",
                  opacity: active ? 1 : 0.7,
                  fontWeight: active ? 600 : 400,
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
