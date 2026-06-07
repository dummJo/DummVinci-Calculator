"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * PageTransition — an iconic mosaic-ember reveal that fires on every App Router
 * route change, with the pixel-art Claude mascot striding across a brand glyph.
 *
 * How it works: Next.js App Router navigation is effectively instant (the new
 * page is already painted by the time `usePathname()` updates). So rather than
 * a "cover" we play a *reveal*: an opaque mosaic of `var(--bg)` tiles drops over
 * the fresh page, each tile flaring with an accent "ember" glow before it burns
 * away in a diagonal wave — uncovering the new page. Claude walks through the
 * middle past a faint πρᾶξις glyph as it clears.
 *
 * The overlay sits at z-index 99 — ABOVE page content + TopBar (90) but BELOW
 * the bottom nav (100), feedback (142) and watermark (150) — so the bottom tab
 * bar stays a crisp, untouched anchor while everything else mosaics away.
 *
 * It is `pointer-events:none` and self-unmounts once the wave finishes, so it
 * never traps taps on the page underneath.
 */

const COLS = 7;
const ROWS = 11;
const TILE_COUNT = COLS * ROWS;

// Timing — keep the total snappy so navigation never feels gated.
const STAGGER_MS = 20;          // per-tile diagonal delay step
const TILE_ANIM_MS = 460;       // single-tile ember-dissolve duration
const MAX_DELAY_MS = (COLS - 1 + ROWS - 1) * STAGGER_MS;
const TOTAL_MS = MAX_DELAY_MS + TILE_ANIM_MS + 80; // + buffer before unmount

export default function PageTransition() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [runId, setRunId] = useState(0);
  const firstMount = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip the initial load — that's the SplashScreen's job, not a transition.
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }

    // Respect reduced-motion: no mosaic churn, the page just appears.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    setRunId(id => id + 1); // restart keyframes even on rapid back-to-back nav
    setActive(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(false), TOTAL_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pathname]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      key={runId}
      style={{
        position: "fixed",
        inset: 0,
        // Above content + TopBar (90), below bottom nav (100) so the tab bar
        // stays untouched as a fixed anchor during the transition.
        zIndex: 99,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes pt-tile-ember {
          0%   { opacity: 1; transform: scale(1);
                 box-shadow: inset 0 0 0 0.5px rgba(var(--accent-rgb), 0.06); }
          38%  { opacity: 1; transform: scale(0.96);
                 box-shadow: inset 0 0 14px rgba(var(--accent-rgb), 0.5),
                             0 0 6px rgba(var(--accent-rgb), 0.35); }
          100% { opacity: 0; transform: scale(0.22) rotate(12deg);
                 box-shadow: inset 0 0 0 rgba(var(--accent-rgb), 0); }
        }
        @keyframes pt-blur-clear {
          0%   { opacity: 1; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
          100% { opacity: 0; backdrop-filter: blur(0px);  -webkit-backdrop-filter: blur(0px); }
        }
        @keyframes pt-glyph-flash {
          0%   { opacity: 0; transform: scale(0.7); letter-spacing: 0.5em; }
          30%  { opacity: 0.5; transform: scale(1); letter-spacing: 0.32em; }
          70%  { opacity: 0.5; }
          100% { opacity: 0; transform: scale(1.15); letter-spacing: 0.2em; }
        }
        @keyframes pt-claude-stride {
          0%   { opacity: 0; transform: translateX(-50px) translateY(0)   scale(0.92); }
          18%  { opacity: 1; }
          50%  { transform: translateX(0)     translateY(-5px) scale(1.05); }
          82%  { opacity: 1; }
          100% { opacity: 0; transform: translateX(50px)  translateY(0)   scale(0.92); }
        }
        @keyframes pt-claude-bob {
          0%, 100% { transform: translateY(0)   rotate(-4deg); }
          50%      { transform: translateY(-3px) rotate(4deg); }
        }
        @keyframes pt-shadow-pulse {
          0%, 100% { opacity: 0.18; transform: scaleX(1); }
          50%      { opacity: 0.32; transform: scaleX(0.78); }
        }
      `}</style>

      {/* Soft blur sheet that clears as the page reveals */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(var(--accent-rgb), 0.04)",
          animation: `pt-blur-clear ${TOTAL_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both`,
        }}
      />

      {/* Mosaic tile grid — each tile flares accent then burns away */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {Array.from({ length: TILE_COUNT }).map((_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const delay = (col + row) * STAGGER_MS;
          return (
            <div
              key={i}
              style={{
                background: "var(--bg)",
                borderRadius: 3,
                transformOrigin: "center",
                willChange: "transform, opacity, box-shadow",
                animation: `pt-tile-ember ${TILE_ANIM_MS}ms cubic-bezier(0.45, 0, 0.55, 1) ${delay}ms both`,
              }}
            />
          );
        })}
      </div>

      {/* Brand glyph + Claude mascot striding across the centre */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Faint πρᾶξις glyph — the brand signature behind the mascot */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: "var(--font-display), serif",
            fontSize: 28,
            fontWeight: 400,
            color: "var(--accent)",
            textTransform: "lowercase",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            animation: `pt-glyph-flash ${TOTAL_MS}ms ease-out both`,
          }}
        >
          πρᾶξις
        </div>

        <div
          style={{
            position: "relative",
            animation: `pt-claude-stride ${TOTAL_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both`,
          }}
        >
          <div style={{ animation: "pt-claude-bob 0.36s ease-in-out infinite" }}>
            <svg
              viewBox="-1 -1 12 10"
              width={64}
              height={64}
              style={{
                shapeRendering: "crispEdges",
                overflow: "visible",
                filter:
                  "drop-shadow(0 0 7px rgba(var(--accent-rgb), 0.55)) drop-shadow(0 4px 8px rgba(0,0,0,0.22))",
              }}
            >
              <defs>
                <filter id="pt-border" x="-40%" y="-40%" width="180%" height="180%">
                  <feMorphology operator="dilate" radius="0.5" in="SourceAlpha" result="d" />
                  <feFlood floodColor="#faf9f5" floodOpacity="1" result="f" />
                  <feComposite in="f" in2="d" operator="in" result="o" />
                  <feMerge>
                    <feMergeNode in="o" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g filter="url(#pt-border)">
                {/* Head + body */}
                <rect x="1" y="0" width="8" height="2" fill="var(--accent)" />
                <rect x="0" y="2" width="3" height="1" fill="var(--accent)" />
                <rect x="4" y="2" width="2" height="1" fill="var(--accent)" />
                <rect x="7" y="2" width="3" height="1" fill="var(--accent)" />
                <rect x="0" y="3" width="10" height="1" fill="var(--accent)" />
                <rect x="1" y="4" width="8" height="1" fill="var(--accent)" />
                {/* Striding legs — staggered lengths read as a walk */}
                <rect x="1" y="5" width="1" height="3" fill="var(--accent)" />
                <rect x="3" y="5" width="1" height="2" fill="var(--accent)" />
                <rect x="6" y="5" width="1" height="2" fill="var(--accent)" />
                <rect x="8" y="5" width="1" height="3" fill="var(--accent)" />
                <rect x="4" y="5" width="2" height="1" fill="var(--accent)" />
                {/* Eyes */}
                <rect x="3" y="2" width="1" height="1" fill="#faf9f5" />
                <rect x="6" y="2" width="1" height="1" fill="#faf9f5" />
              </g>
            </svg>
          </div>
        </div>

        {/* Little ground shadow that pulses with the stride */}
        <div
          style={{
            width: 42,
            height: 5,
            borderRadius: "50%",
            background: "rgba(var(--accent-rgb), 0.5)",
            filter: "blur(2px)",
            animation: "pt-shadow-pulse 0.36s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
