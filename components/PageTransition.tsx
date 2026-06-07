"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";

/**
 * PageTransition — a SpongeBob-style swarm reveal.
 *
 * Mini pixel-art Claude characters stampede in from all screen edges,
 * pile up jostling to cover the page, then pop-scatter off in every
 * direction — uncovering the new route underneath.
 *
 * z-index 99: above page content + TopBar (90), BELOW bottom nav (100),
 * feedback FAB (142), and watermark (150) — those stay crisp and
 * untouched throughout the transition.
 */

const CHAR_COUNT = 52;

// Phase timings (ms)
const RUSH_START  = 0;
const RUSH_END    = 280;   // all chars landed by here
const HOLD_END    = 480;   // jiggle while covering
const POP_END     = 680;   // all chars gone
const TOTAL_MS    = POP_END + 60; // +buffer before unmount

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────
// Deterministic per runId so the keyframes match the rendered positions
// even if React re-renders mid-animation.
function makePrng(seed: number) {
  let s = (seed + 1) * 2654435761;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= (s >>> 16);
    return (s >>> 0) / 0x100000000;
  };
}

interface CharData {
  id:       number;
  // Start: off-screen (vw/vh fraction, -0.25 to 1.25 on chosen edge)
  sx: number; sy: number;
  // Land: on-screen (5-95% in each axis)
  lx: number; ly: number;
  // Exit: back off-screen in a random direction
  ex: number; ey: number;
  size:     number; // px, 16–34
  inDelay:  number; // 0–180 ms
  outDelay: number; // HOLD_END – HOLD_END+120 ms
  rot:      number; // deg spin during rush (-60 to 60)
  bobAmp:   number; // px vertical bob during hold (4–10)
  bobDur:   number; // ms per bob cycle (120–220)
}

function buildChars(seed: number): CharData[] {
  const rand = makePrng(seed);
  return Array.from({ length: CHAR_COUNT }, (_, i) => {
    // Pick a screen edge to spawn from (0=top 1=right 2=bottom 3=left)
    const edge = Math.floor(rand() * 4);
    let sx: number, sy: number;
    if      (edge === 0) { sx = rand();         sy = -0.18; }
    else if (edge === 1) { sx = 1.18;           sy = rand(); }
    else if (edge === 2) { sx = rand();         sy = 1.18;  }
    else                 { sx = -0.18;          sy = rand(); }

    // Landing position — random on-screen, clustered toward centre-ish
    const lx = 0.05 + rand() * 0.90;
    const ly = 0.05 + rand() * 0.88;

    // Exit toward the opposite side from entry, pushed far off-screen
    const ex = sx < 0 ? 1.3 + rand() * 0.4
             : sx > 1 ? -0.3 - rand() * 0.4
             : lx + (rand() - 0.5) * 1.4;
    const ey = sy < 0 ? 1.3 + rand() * 0.4
             : sy > 1 ? -0.3 - rand() * 0.4
             : ly + (rand() - 0.5) * 1.4;

    return {
      id:       i,
      sx, sy, lx, ly, ex, ey,
      size:     16 + Math.floor(rand() * 18),   // 16–34 px
      inDelay:  Math.floor(rand() * 180),        // 0–180 ms
      outDelay: HOLD_END + Math.floor(rand() * 120), // stagger the pop
      rot:      (rand() - 0.5) * 120,            // –60 to +60 deg
      bobAmp:   4 + rand() * 6,                  // 4–10 px
      bobDur:   120 + Math.floor(rand() * 100),  // 120–220 ms
    };
  });
}

// ─── Tiny mascot SVG (reuses accent fill + cream outline) ────────────────────
function MiniClaude({ size }: { size: number }) {
  return (
    <svg
      viewBox="-1 -1 12 10"
      width={size}
      height={size}
      style={{ shapeRendering: "crispEdges", overflow: "visible", display: "block" }}
    >
      <defs>
        <filter id="mc-outline" x="-50%" y="-50%" width="200%" height="200%">
          <feMorphology operator="dilate" radius="0.55" in="SourceAlpha" result="d" />
          <feFlood floodColor="#faf9f5" result="f" />
          <feComposite in="f" in2="d" operator="in" result="o" />
          <feMerge>
            <feMergeNode in="o" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#mc-outline)">
        <rect x="1" y="0" width="8" height="2" fill="var(--accent)" />
        <rect x="0" y="2" width="3" height="1" fill="var(--accent)" />
        <rect x="4" y="2" width="2" height="1" fill="var(--accent)" />
        <rect x="7" y="2" width="3" height="1" fill="var(--accent)" />
        <rect x="0" y="3" width="10" height="1" fill="var(--accent)" />
        <rect x="1" y="4" width="8" height="1" fill="var(--accent)" />
        {/* Striding legs — alternating for walk illusion */}
        <rect x="1" y="5" width="1" height="3" fill="var(--accent)" />
        <rect x="3" y="5" width="1" height="2" fill="var(--accent)" />
        <rect x="6" y="5" width="1" height="2" fill="var(--accent)" />
        <rect x="8" y="5" width="1" height="3" fill="var(--accent)" />
        <rect x="4" y="5" width="2" height="1" fill="var(--accent)" />
        <rect x="3" y="2" width="1" height="1" fill="#faf9f5" />
        <rect x="6" y="2" width="1" height="1" fill="#faf9f5" />
      </g>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PageTransition() {
  const pathname = usePathname();
  const [active, setActive]   = useState(false);
  const [runId, setRunId]     = useState(0);
  const firstMount = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (firstMount.current) { firstMount.current = false; return; }
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) return;

    setRunId(id => id + 1);
    setActive(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(false), TOTAL_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [pathname]);

  // Rebuild characters only when runId changes (deterministic per run)
  const chars = useMemo(() => buildChars(runId), [runId]);

  if (!active) return null;

  // Build per-character keyframe CSS + rendered divs
  const rushDuration  = RUSH_END - RUSH_START;           // 280 ms

  const css = chars.map(c => {
    const inEnd  = Math.min(100, Math.round((c.inDelay + rushDuration) / TOTAL_MS * 100));
    const holdPct = Math.round(HOLD_END / TOTAL_MS * 100);
    const outEnd = Math.min(100, Math.round((c.outDelay + 160) / TOTAL_MS * 100));

    // vw/vh units so the positions are viewport-relative regardless of scroll
    return `
    @keyframes ptc-${runId}-${c.id} {
      0%   {
        transform: translate(${c.sx * 100}vw, ${c.sy * 100}vh) rotate(${c.rot}deg) scale(0.3);
        opacity: 0;
      }
      ${Math.round(c.inDelay / TOTAL_MS * 100)}% {
        opacity: 0;
        transform: translate(${c.sx * 100}vw, ${c.sy * 100}vh) rotate(${c.rot}deg) scale(0.3);
      }
      ${inEnd}% {
        transform: translate(${c.lx * 100}vw, ${c.ly * 100}vh) rotate(0deg) scale(1);
        opacity: 1;
      }
      ${holdPct}% {
        transform: translate(${c.lx * 100}vw, calc(${c.ly * 100}vh - ${c.bobAmp}px)) rotate(${c.rot * 0.15}deg) scale(1);
        opacity: 1;
      }
      ${Math.round(c.outDelay / TOTAL_MS * 100)}% {
        transform: translate(${c.lx * 100}vw, ${c.ly * 100}vh) rotate(0deg) scale(1);
        opacity: 1;
      }
      ${outEnd}% {
        transform: translate(${c.ex * 100}vw, ${c.ey * 100}vh) rotate(${c.rot * 2}deg) scale(0);
        opacity: 0;
      }
      100% {
        transform: translate(${c.ex * 100}vw, ${c.ey * 100}vh) rotate(${c.rot * 2}deg) scale(0);
        opacity: 0;
      }
    }`;
  }).join("\n");

  // Soft bg overlay that covers the page while chars are present
  const bgFadeInEnd  = Math.round(RUSH_END  / TOTAL_MS * 100);
  const bgFadeOutStart = Math.round(HOLD_END / TOTAL_MS * 100);

  return (
    <div
      aria-hidden="true"
      key={runId}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes pt-bg {
          0%                  { opacity: 0; }
          ${bgFadeInEnd}%     { opacity: 1; }
          ${bgFadeOutStart}%  { opacity: 1; }
          100%                { opacity: 0; }
        }
        ${css}
      `}</style>

      {/* Semi-opaque background that fills as chars pile up */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--bg)",
          opacity: 0,
          animation: `pt-bg ${TOTAL_MS}ms ease both`,
        }}
      />

      {/* Character stampede */}
      {chars.map(c => (
        <div
          key={c.id}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            willChange: "transform, opacity",
            filter: `drop-shadow(0 0 ${Math.round(c.size * 0.18)}px rgba(var(--accent-rgb), 0.55))`,
            animation: `ptc-${runId}-${c.id} ${TOTAL_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`,
          }}
        >
          <MiniClaude size={c.size} />
        </div>
      ))}
    </div>
  );
}
