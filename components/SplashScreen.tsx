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
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
      }}>
        {/* Chibi Claude / Anthropic Star Animation */}
        <div style={{
          position: "relative",
          width: 80,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "claudeFloat 3s ease-in-out infinite",
        }}>
          {/* Sparkles / Aura */}
          <div style={{
            position: "absolute",
            inset: -20,
            background: "radial-gradient(circle, rgba(var(--accent-rgb), 0.2) 0%, transparent 70%)",
            animation: "claudePulse 2s ease-in-out infinite alternate",
            borderRadius: "50%",
          }} />
          
          {/* Main Body (Anthropic Star / Chibi Head) */}
          <svg
            width="72"
            height="72"
            viewBox="0 0 100 100"
            fill="var(--accent)"
            style={{
              zIndex: 1,
              animation: "claudeSpin 12s linear infinite",
              filter: "drop-shadow(0 8px 16px rgba(var(--accent-rgb), 0.3))"
            }}
          >
            {/* Plump, cute 4-pointed star (Anthropic style) */}
            <path d="M50 5 C50 40 60 50 95 50 C60 50 50 60 50 95 C50 60 40 50 5 50 C40 50 50 40 50 5 Z" />
          </svg>
          
          {/* Cute Face (Chibi) - stays upright, doesn't spin */}
          <div style={{
            position: "absolute",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}>
            {/* Blushing cheeks and eyes */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <div style={{ width: 8, height: 4, borderRadius: "50%", background: "rgba(255,100,100,0.6)" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--bg)", animation: "claudeBlink 4s infinite" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--bg)", animation: "claudeBlink 4s infinite" }} />
              <div style={{ width: 8, height: 4, borderRadius: "50%", background: "rgba(255,100,100,0.6)" }} />
            </div>
            {/* Happy cat smile */}
            <svg width="16" height="8" viewBox="0 0 16 8" fill="none" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 2 Q4 6 8 4 Q12 6 14 2" />
            </svg>
          </div>
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
