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
        {/* Claude Code CLI Style ASCII Face */}
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
            background: "radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%)",
            animation: "claudePulse 2s ease-in-out infinite alternate",
            borderRadius: "50%",
          }} />
          
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 32,
            fontWeight: 800,
            color: "var(--accent)",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            textAlign: "center",
          }}>
            {progress < 25 ? "(・_・)" :
             progress < 50 ? "(>_<)" :
             progress < 75 ? "(^.^)" :
             "(✧_✧)"}
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
