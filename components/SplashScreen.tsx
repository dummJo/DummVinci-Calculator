"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

// Claude Code-style flavor verbs + emoji prop. Picked at random on each mount.
type Scene = { verb: string; emoji: string };
const SCENES: Scene[] = [
  { verb: "Riding clouds",     emoji: "☁️" },
  { verb: "Drawing",           emoji: "✏️" },
  { verb: "Watching anime",    emoji: "🎌" },
  { verb: "Riding horse",      emoji: "🐴" },
  { verb: "Coding",            emoji: "💻" },
  { verb: "Reading scrolls",   emoji: "📜" },
  { verb: "Slurping ramen",    emoji: "🍜" },
  { verb: "Strumming guitar",  emoji: "🎸" },
  { verb: "Skateboarding",     emoji: "🛹" },
  { verb: "Painting",          emoji: "🎨" },
  { verb: "Stargazing",        emoji: "🔭" },
  { verb: "Napping",           emoji: "💤" },
  { verb: "Calculating",       emoji: "🧮" },
  { verb: "Adventuring",       emoji: "⚔️" },
  { verb: "Tinkering",         emoji: "🔧" },
  { verb: "Brewing coffee",    emoji: "☕" },
  { verb: "Inventing",         emoji: "💡" },
  { verb: "Drafting blueprint",emoji: "📐" },
  { verb: "Charging up",       emoji: "⚡" },
  { verb: "Casting spells",    emoji: "🪄" },
];

const SPLASH_DURATION_MS = 2000;
const FADE_DURATION_MS = 500;

export default function SplashScreen() {
  const { t } = useLang();
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Pick a single random scene per mount via a lazy initializer (runs exactly once).
  const [sceneIndex] = useState(() => Math.floor(Math.random() * SCENES.length));
  const scene = SCENES.at(sceneIndex)!;

  useEffect(() => {
    // Progress ticker — aims to reach 100 by ~1800ms (before fade starts at 2000ms).
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 6) + 3; // 3-8 per tick
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
      }
      setProgress(currentProgress);
    }, 80);

    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setIsVisible(false), FADE_DURATION_MS);
    }, SPLASH_DURATION_MS);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: isFading ? 0 : 1,
        transition: "opacity 0.5s ease-out, filter 0.5s ease-out, transform 0.5s ease-out",
        filter: isFading ? "blur(10px)" : "blur(0px)",
        transform: isFading ? "scale(1.05)" : "scale(1)",
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes claudeFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes claudePulse {
          0%   { transform: scale(0.9); opacity: 0.35; }
          100% { transform: scale(1.1); opacity: 0.75; }
        }
        @keyframes claudeBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        @keyframes eyeBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          93%, 97%      { transform: scaleY(0.15); }
        }
        @keyframes propWobble {
          0%, 100% { transform: translate(0, 0) rotate(-8deg); }
          50%      { transform: translate(4px, -6px) rotate(8deg); }
        }
        .mascot-eye-left  { transform-origin: 3.5px 2.5px; animation: eyeBlink 3s infinite; }
        .mascot-eye-right { transform-origin: 6.5px 2.5px; animation: eyeBlink 3s infinite; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        {/* Mascot + scene prop */}
        <div style={{
          position: "relative",
          width: 96,
          height: 96,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "claudeFloat 3s ease-in-out infinite",
        }}>
          {/* Aura */}
          <div style={{
            position: "absolute",
            inset: -24,
            background: "radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%)",
            animation: "claudePulse 2s ease-in-out infinite alternate",
            borderRadius: "50%",
            pointerEvents: "none",
          }} />

          {/* Themed prop emoji — floats top-right of mascot */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -8,
              right: -18,
              fontSize: 28,
              animation: "propWobble 1.6s ease-in-out infinite",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
              zIndex: 3,
              lineHeight: 1,
            }}
          >
            {scene.emoji}
          </div>

          <svg
            viewBox="-1 -1 12 10"
            style={{
              width: "100%",
              height: "100%",
              shapeRendering: "crispEdges",
              overflow: "visible",
              filter: "drop-shadow(0px 6px 12px rgba(0, 0, 0, 0.25))",
              zIndex: 2,
            }}
          >
            <defs>
              <filter id="sticker-outline" x="-30%" y="-30%" width="160%" height="160%">
                <feMorphology operator="dilate" radius="0.45" in="SourceAlpha" result="dilated" />
                <feFlood floodColor="#faf9f5" floodOpacity="1" result="flood" />
                <feComposite in="flood" in2="dilated" operator="in" result="outline" />
                <feMerge>
                  <feMergeNode in="outline" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g filter="url(#sticker-outline)">
              {/* Head + body */}
              <rect x="1" y="0" width="8" height="2" fill="var(--accent)" />
              <rect x="0" y="2" width="3" height="1" fill="var(--accent)" />
              <rect x="4" y="2" width="2" height="1" fill="var(--accent)" />
              <rect x="7" y="2" width="3" height="1" fill="var(--accent)" />
              <rect x="0" y="3" width="10" height="1" fill="var(--accent)" />
              <rect x="1" y="4" width="8" height="1" fill="var(--accent)" />
              {/* Legs */}
              <rect x="1" y="5" width="1" height="3" fill="var(--accent)" />
              <rect x="3" y="5" width="1" height="3" fill="var(--accent)" />
              <rect x="6" y="5" width="1" height="3" fill="var(--accent)" />
              <rect x="8" y="5" width="1" height="3" fill="var(--accent)" />
              <rect x="4" y="5" width="2" height="1" fill="var(--accent)" />

              {/* Eyes evolve with progress.
                  Eyes use #faf9f5 (the same cream as the sticker-outline filter) so they
                  contrast against the body in both themes (body is black in light,
                  orange in dark). Hard-coded hex avoids the SVG attribute / CSS variable
                  resolution quirk that made fill="var(--bg)" fall back to black on some
                  rendering paths, which made the eyes vanish into the black light-mode body. */}
              {progress < 35 ? (
                <>
                  <rect x="3" y="2" width="1" height="1" fill="#faf9f5" className="mascot-eye-left" />
                  <rect x="6" y="2" width="1" height="1" fill="#faf9f5" className="mascot-eye-right" />
                </>
              ) : progress < 70 ? (
                <>
                  <path d="M 3.0,2.8 L 3.5,2.2 L 4.0,2.8" stroke="#faf9f5" strokeWidth="0.85" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 6.0,2.8 L 6.5,2.2 L 7.0,2.8" stroke="#faf9f5" strokeWidth="0.85" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : (
                <>
                  <rect x="3" y="2" width="1" height="1" fill="#faf9f5" />
                  <rect x="3" y="1" width="1" height="1" fill="#faf9f5" />
                  <rect x="3" y="3" width="1" height="1" fill="#faf9f5" />
                  <rect x="2" y="2" width="1" height="1" fill="#faf9f5" />
                  <rect x="4" y="2" width="1" height="1" fill="#faf9f5" />
                  <rect x="6" y="2" width="1" height="1" fill="#faf9f5" />
                  <rect x="6" y="1" width="1" height="1" fill="#faf9f5" />
                  <rect x="6" y="3" width="1" height="1" fill="#faf9f5" />
                  <rect x="5" y="2" width="1" height="1" fill="#faf9f5" />
                  <rect x="7" y="2" width="1" height="1" fill="#faf9f5" />
                </>
              )}
            </g>
          </svg>
        </div>

        {/* Brand */}
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          fontWeight: 400,
          color: "var(--fg)",
          letterSpacing: "-0.05em",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>
          <span style={{ fontWeight: 300, fontStyle: "italic", opacity: 0.65 }}>{t.nav.brandDumm}</span>
          <span style={{ fontWeight: 800, color: "var(--accent)" }}>{t.nav.brandVinci}</span>
        </div>

        {/* Verb + percent + loading bar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 800,
            color: "var(--accent)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}>
            {scene.verb}
            <span style={{ animation: "claudeBlink 1.5s infinite" }}>_</span>
          </div>

          {/* Loading bar */}
          <div style={{
            width: 200,
            height: 4,
            background: "rgba(var(--accent-rgb), 0.15)",
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: "var(--accent)",
              boxShadow: "0 0 8px rgba(var(--accent-rgb), 0.6)",
              transition: "width 0.12s linear",
            }} />
          </div>

          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--accent)",
            opacity: 0.55,
            display: "flex",
            gap: 4,
            alignItems: "center",
          }}>
            <span>[</span>
            <span style={{ width: "24px", textAlign: "right" }}>{progress}</span>
            <span>%]</span>
          </div>
        </div>
      </div>
    </div>
  );
}
