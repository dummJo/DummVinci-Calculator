"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * PageTransition — a mosaic-blur reveal that fires on every App Router route
 * change, with the pixel-art Claude mascot striding across the screen.
 *
 * How it works: Next.js App Router navigation is effectively instant (the new
 * page is already painted by the time `usePathname()` updates). So rather than
 * a "cover" we play a *reveal*: an opaque mosaic of `var(--bg)` tiles drops over
 * the fresh page, then dissolves tile-by-tile in a diagonal wave while a soft
 * backdrop blur clears — uncovering the new page. Claude walks through the
 * middle as it clears.
 *
 * The whole overlay is `pointer-events:none` and self-unmounts once the wave
 * finishes, so it never traps taps on the page underneath.
 */

const COLS = 6;
const ROWS = 10;
const TILE_COUNT = COLS * ROWS;

// Timing — keep the total snappy so navigation never feels gated.
const STAGGER_MS = 24;          // per-tile diagonal delay step
const TILE_ANIM_MS = 440;       // single-tile dissolve duration
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
        zIndex: 9990, // above all chrome (nav 100, feedback 142, watermark 150); below splash 9999
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes pt-tile-dissolve {
          0%   { opacity: 1; transform: scale(1);    filter: blur(0px); }
          60%  { opacity: 1; }
          100% { opacity: 0; transform: scale(0.28) rotate(10deg); filter: blur(2px); }
        }
        @keyframes pt-blur-clear {
          0%   { opacity: 1; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
          100% { opacity: 0; backdrop-filter: blur(0px);  -webkit-backdrop-filter: blur(0px); }
        }
        @keyframes pt-claude-stride {
          0%   { opacity: 0; transform: translateX(-46px) translateY(0)   scale(0.92); }
          18%  { opacity: 1; }
          50%  { transform: translateX(0)     translateY(-5px) scale(1); }
          82%  { opacity: 1; }
          100% { opacity: 0; transform: translateX(46px)  translateY(0)   scale(0.92); }
        }
        @keyframes pt-claude-bob {
          0%, 100% { transform: translateY(0)   rotate(-3deg); }
          50%      { transform: translateY(-3px) rotate(3deg); }
        }
        @keyframes pt-shadow-pulse {
          0%, 100% { opacity: 0.18; transform: scaleX(1); }
          50%      { opacity: 0.30; transform: scaleX(0.8); }
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

      {/* Mosaic tile grid */}
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
                boxShadow: "inset 0 0 0 0.5px rgba(var(--accent-rgb), 0.06)",
                borderRadius: 3,
                transformOrigin: "center",
                willChange: "transform, opacity",
                animation: `pt-tile-dissolve ${TILE_ANIM_MS}ms cubic-bezier(0.45, 0, 0.55, 1) ${delay}ms both`,
              }}
            />
          );
        })}
      </div>

      {/* Claude mascot striding across the centre */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            animation: `pt-claude-stride ${TOTAL_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both`,
          }}
        >
          <div style={{ animation: "pt-claude-bob 0.38s ease-in-out infinite" }}>
            <svg
              viewBox="-1 -1 12 10"
              width={64}
              height={64}
              style={{
                shapeRendering: "crispEdges",
                overflow: "visible",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.22))",
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
            width: 40,
            height: 5,
            borderRadius: "50%",
            background: "rgba(var(--accent-rgb), 0.5)",
            filter: "blur(2px)",
            animation: "pt-shadow-pulse 0.38s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
