"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Ensure the initial layout is painted, then hold the splash screen
    // for a short duration before fading it out.
    const timer = setTimeout(() => {
      setIsFading(true);
      // Wait for the fade-out animation to complete before removing from DOM
      setTimeout(() => {
        setIsVisible(false);
      }, 500); // matches the CSS transition duration
    }, 1500);

    return () => clearTimeout(timer);
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
            width="64"
            height="64"
            viewBox="0 0 100 100"
            fill="var(--accent)"
            style={{
              zIndex: 1,
              animation: "claudeSpin 12s linear infinite",
            }}
          >
            {/* Minimalist 4-pointed star (Anthropic style) */}
            <path d="M50 0 C50 40 60 50 100 50 C60 50 50 60 50 100 C50 60 40 50 0 50 C40 50 50 40 50 0 Z" />
          </svg>
          
          {/* Cute Face (Chibi) - stays upright, doesn't spin */}
          <div style={{
            position: "absolute",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--bg)", animation: "claudeBlink 4s infinite" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--bg)", animation: "claudeBlink 4s infinite" }} />
            </div>
            {/* Tiny smile */}
            <svg width="12" height="6" viewBox="0 0 12 6" fill="none" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2 Q6 6 10 2" />
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
          <span style={{ fontWeight: 300, fontStyle: "italic", opacity: 0.65 }}>Dumm</span>
          <span style={{ fontWeight: 800, color: "var(--accent)" }}>Vinci</span>
        </div>

        {/* Loading Text */}
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--accent)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          opacity: 0.5,
          animation: "claudePulse 1.5s ease-in-out infinite alternate",
        }}>
          INITIALIZING...
        </div>
      </div>
    </div>
  );
}
