"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TRIGGER_PX = 75;
const MAX_PULL_PX = 115;

type Phase = "idle" | "pulling" | "triggered" | "releasing" | "refreshing";

export default function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [swing, setSwing] = useState(0);

  const startY = useRef(0);
  const tracking = useRef(false);
  const rafRef = useRef<number>(0);
  const swingT = useRef(0);
  const lastPull = useRef(0);

  // Pendulum swing while hanging
  useEffect(() => {
    if (phase !== "pulling" && phase !== "triggered") {
      cancelAnimationFrame(rafRef.current);
      swingT.current = 0;
      setSwing(0);
      return;
    }
    const step = () => {
      swingT.current += 0.055;
      setSwing(Math.sin(swingT.current) * 10);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY > 3) return;
    startY.current = e.touches[0].clientY;
    tracking.current = true;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!tracking.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) {
      tracking.current = false;
      return;
    }
    // Rubber-band: diminishing returns so it never feels infinite
    const eased = MAX_PULL_PX * (1 - Math.exp(-dy / 90));
    lastPull.current = eased;
    setPull(eased);
    setPhase(eased >= TRIGGER_PX ? "triggered" : "pulling");
    if (dy > 6) e.preventDefault();
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!tracking.current) return;
    tracking.current = false;
    const p = lastPull.current;
    if (p >= TRIGGER_PX) {
      setPhase("refreshing");
      setTimeout(() => window.location.reload(), 870);
    } else {
      setPhase("releasing");
      setTimeout(() => {
        setPull(0);
        lastPull.current = 0;
        setPhase("idle");
      }, 480);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  if (phase === "idle") return null;

  const ropeH = phase === "releasing" ? 0 : pull;
  const isTriggered = phase === "triggered" || phase === "refreshing";
  const isRefreshing = phase === "refreshing";
  const charVisible = phase !== "releasing" && pull > 8;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9998,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>{`
        @keyframes ptr-spin {
          0%   { transform: rotate(0deg) scale(1); }
          40%  { transform: rotate(200deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes ptr-label-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 0.72; transform: translateY(0); }
        }
      `}</style>

      {/* Grip bar — the bar Claude is hanging from */}
      <div
        style={{
          width: 48,
          height: 4,
          borderRadius: 2,
          background: "var(--accent)",
          boxShadow: "0 0 8px rgba(var(--accent-rgb), 0.45)",
          opacity: pull > 5 ? 0.9 : 0,
          transition: "opacity 0.15s",
          flexShrink: 0,
        }}
      />

      {/* Rope (dashed, springs back on release) */}
      <div
        style={{
          width: 2,
          height: ropeH,
          background:
            "repeating-linear-gradient(to bottom, var(--accent) 0, var(--accent) 5px, transparent 5px, transparent 9px)",
          opacity: 0.6,
          flexShrink: 0,
          transition:
            phase === "releasing"
              ? "height 0.48s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "none",
        }}
      />

      {/* Claude mascot hanging at rope bottom */}
      <div
        style={{
          flexShrink: 0,
          opacity: charVisible ? 1 : 0,
          transformOrigin: "center top",
          transform: isRefreshing ? undefined : `rotate(${swing}deg)`,
          animation: isRefreshing ? "ptr-spin 0.87s ease-in-out forwards" : undefined,
          filter: isTriggered
            ? "drop-shadow(0 0 6px rgba(var(--accent-rgb), 0.7))"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
          transition: isRefreshing
            ? undefined
            : phase === "releasing"
            ? "opacity 0.18s"
            : "opacity 0.15s, filter 0.2s",
        }}
      >
        <svg
          viewBox="-2 -2 14 13"
          width={52}
          height={52}
          style={{ shapeRendering: "crispEdges", overflow: "visible" }}
        >
          <defs>
            <filter id="ptr-border" x="-40%" y="-40%" width="180%" height="180%">
              <feMorphology operator="dilate" radius="0.65" in="SourceAlpha" result="d" />
              <feFlood floodColor="#faf9f5" floodOpacity="1" result="f" />
              <feComposite in="f" in2="d" operator="in" result="o" />
              <feMerge>
                <feMergeNode in="o" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#ptr-border)">
            {/* Arms raised — hands gripping the bar above */}
            <rect x="0" y="-2" width="1" height="2" fill="var(--accent)" />
            <rect x="9" y="-2" width="1" height="2" fill="var(--accent)" />
            {/* Head */}
            <rect x="1" y="0" width="8" height="2" fill="var(--accent)" />
            {/* Shoulders / neck gaps */}
            <rect x="0" y="2" width="3" height="1" fill="var(--accent)" />
            <rect x="4" y="2" width="2" height="1" fill="var(--accent)" />
            <rect x="7" y="2" width="3" height="1" fill="var(--accent)" />
            {/* Body */}
            <rect x="0" y="3" width="10" height="1" fill="var(--accent)" />
            <rect x="1" y="4" width="8" height="1" fill="var(--accent)" />
            {/* Dangling legs */}
            <rect x="1" y="5" width="1" height="3" fill="var(--accent)" />
            <rect x="3" y="5" width="1" height="3" fill="var(--accent)" />
            <rect x="6" y="5" width="1" height="3" fill="var(--accent)" />
            <rect x="8" y="5" width="1" height="3" fill="var(--accent)" />
            <rect x="4" y="5" width="2" height="1" fill="var(--accent)" />
            {/* Eyes — normal vs excited (star eyes) when triggered */}
            {isTriggered ? (
              <>
                <rect x="3" y="1" width="1" height="1" fill="#faf9f5" />
                <rect x="3" y="2" width="1" height="1" fill="#faf9f5" />
                <rect x="3" y="3" width="1" height="1" fill="#faf9f5" />
                <rect x="2" y="2" width="1" height="1" fill="#faf9f5" />
                <rect x="4" y="2" width="1" height="1" fill="#faf9f5" />
                <rect x="6" y="1" width="1" height="1" fill="#faf9f5" />
                <rect x="6" y="2" width="1" height="1" fill="#faf9f5" />
                <rect x="6" y="3" width="1" height="1" fill="#faf9f5" />
                <rect x="5" y="2" width="1" height="1" fill="#faf9f5" />
                <rect x="7" y="2" width="1" height="1" fill="#faf9f5" />
              </>
            ) : (
              <>
                <rect x="3" y="2" width="1" height="1" fill="#faf9f5" />
                <rect x="6" y="2" width="1" height="1" fill="#faf9f5" />
              </>
            )}
          </g>
        </svg>
      </div>

      {/* Hint label */}
      {pull > 28 && phase !== "releasing" && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--accent)",
            opacity: 0.72,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            marginTop: 6,
            animation: "ptr-label-in 0.2s ease-out both",
          }}
        >
          {isRefreshing ? "Reloading…" : isTriggered ? "Let go!" : "Pull more…"}
        </div>
      )}
    </div>
  );
}
