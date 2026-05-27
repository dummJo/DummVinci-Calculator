/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

export default function SplashScreen() {
  const { t } = useLang();
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fake loading progress
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 18) + 4; // jump between 4 and 22
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
      }
      setProgress(currentProgress);
    }, 120);

    // Ensure the initial layout is painted, then hold the splash screen
    // for a short duration before fading it out.
    const timer = setTimeout(() => {
      setIsFading(true);
      // Wait for the fade-out animation to complete before removing from DOM
      setTimeout(() => {
        setIsVisible(false);
      }, 500); // matches the CSS transition duration
    }, 1800); // slightly longer to let progress reach 100

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
        pointerEvents: "none", // ensure it doesn't block interactions while fading
      }}
    >
      <style>{`
        @keyframes claudeFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes claudePulse {
          0% {
            transform: scale(0.9);
            opacity: 0.35;
          }
          100% {
            transform: scale(1.1);
            opacity: 0.75;
          }
        }
        @keyframes claudeBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes eyeBlink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          93%, 97% {
            transform: scaleY(0.15);
          }
        }
        .mascot-eye-left {
          transform-origin: 3.5px 2.5px;
          animation: eyeBlink 3s infinite;
        }
        .mascot-eye-right {
          transform-origin: 6.5px 2.5px;
          animation: eyeBlink 3s infinite;
        }
      `}</style>

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
      }}>
        {/* Animated 8-bit Mascot */}
        <div style={{
          position: "relative",
          width: 96,
          height: 96,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "claudeFloat 3s ease-in-out infinite",
        }}>
          {/* Sparkles / Aura */}
          <div style={{
            position: "absolute",
            inset: -24,
            background: "radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%)",
            animation: "claudePulse 2s ease-in-out infinite alternate",
            borderRadius: "50%",
            pointerEvents: "none",
          }} />
          
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
              {/* Outline filter to create the white sticker outline */}
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
              {/* Main Body */}
              {/* Row 1-2 (y=0, 1): Top of head */}
              <rect x="1" y="0" width="8" height="2" fill="var(--accent)" />
              
              {/* Row 3 (y=2): Eye row */}
              <rect x="0" y="2" width="3" height="1" fill="var(--accent)" />
              <rect x="4" y="2" width="2" height="1" fill="var(--accent)" />
              <rect x="7" y="2" width="3" height="1" fill="var(--accent)" />
              
              {/* Row 4 (y=3): Arm row */}
              <rect x="0" y="3" width="10" height="1" fill="var(--accent)" />
              
              {/* Row 5 (y=4): Mid body */}
              <rect x="1" y="4" width="8" height="1" fill="var(--accent)" />
              
              {/* Legs & Gaps */}
              {/* Leg A (Col 1) */}
              <rect x="1" y="5" width="1" height="3" fill="var(--accent)" />
              {/* Leg B (Col 3) */}
              <rect x="3" y="5" width="1" height="3" fill="var(--accent)" />
              {/* Leg C (Col 6) */}
              <rect x="6" y="5" width="1" height="3" fill="var(--accent)" />
              {/* Leg D (Col 8) */}
              <rect x="8" y="5" width="1" height="3" fill="var(--accent)" />
              {/* Mid connector above center gap */}
              <rect x="4" y="5" width="2" height="1" fill="var(--accent)" />

              {/* Dynamic 8-bit eyes based on progress */}
              {progress < 35 ? (
                <>
                  {/* Normal Blinking Eyes */}
                  <rect x="3" y="2" width="1" height="1" fill="black" className="mascot-eye-left" />
                  <rect x="6" y="2" width="1" height="1" fill="black" className="mascot-eye-right" />
                </>
              ) : progress < 70 ? (
                <>
                  {/* Happy/Squinting Eyes ^ ^ */}
                  <path
                    d="M 3.0,2.8 L 3.5,2.2 L 4.0,2.8"
                    stroke="black"
                    strokeWidth="0.85"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 6.0,2.8 L 6.5,2.2 L 7.0,2.8"
                    stroke="black"
                    strokeWidth="0.85"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                <>
                  {/* Sparkle/Star Eyes ✧ ✧ */}
                  {/* Left Star */}
                  <rect x="3" y="2" width="1" height="1" fill="black" />
                  <rect x="3" y="1" width="1" height="1" fill="black" />
                  <rect x="3" y="3" width="1" height="1" fill="black" />
                  <rect x="2" y="2" width="1" height="1" fill="black" />
                  <rect x="4" y="2" width="1" height="1" fill="black" />
                  {/* Right Star */}
                  <rect x="6" y="2" width="1" height="1" fill="black" />
                  <rect x="6" y="1" width="1" height="1" fill="black" />
                  <rect x="6" y="3" width="1" height="1" fill="black" />
                  <rect x="5" y="2" width="1" height="1" fill="black" />
                  <rect x="7" y="2" width="1" height="1" fill="black" />
                </>
              )}
            </g>
          </svg>
        </div>

        {/* DummVinci Logo */}
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

        {/* Loading Text & 8-bit Progress */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 800,
            color: "var(--accent)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.8,
          }}>
            {t.common.initializing}
            <span style={{ animation: "claudeBlink 1.5s infinite" }}>_</span>
          </div>
          
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--accent)",
            opacity: 0.5,
            display: "flex",
            gap: 4,
            alignItems: "center"
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
