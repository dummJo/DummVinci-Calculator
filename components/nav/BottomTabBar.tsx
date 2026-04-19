"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/",                   label: "Home",    icon: "⌂" },
  { href: "/cable",              label: "Cable",   icon: "~" },
  { href: "/vsd",                label: "VSD",     icon: "◈" },
  { href: "/breaker",            label: "Breaker", icon: "⚡" },
  { href: "/busbar",             label: "Busbar",  icon: "═" },
  { href: "/braking-resistor",   label: "Brake",   icon: "◉" },
  { href: "/panel",              label: "Panel",   icon: "▣" },
] as const;

export default function BottomTabBar() {
  const path = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "var(--nav-bg)",
        backdropFilter: "var(--nav-blur)",
        WebkitBackdropFilter: "var(--nav-blur)",
        borderTop: "1px solid var(--glass-border)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "stretch",
        height: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {TABS.map(tab => {
        const active = tab.href === "/" ? path === "/" : path.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              color: active ? "var(--accent)" : "var(--muted)",
              textDecoration: "none",
              backgroundImage: "none",
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              transition: "color 0.18s ease",
              paddingTop: 4,
              borderTop: active ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1, fontFamily: "inherit" }}>{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
