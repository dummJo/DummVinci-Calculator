"use client";

import { useState, useEffect } from "react";
import { getRandomFact } from "@/lib/funFacts";
import { Info, RefreshCw } from "lucide-react";

export default function Footnote() {
  const [fact, setFact] = useState("");

  useEffect(() => {
    const tid = setTimeout(() => setFact(getRandomFact()), 0);
    return () => clearTimeout(tid);
  }, []);

  const refresh = () => setFact(getRandomFact());

  if (!fact) return null;

  return (
    <div style={{
      marginTop: 40,
      padding: "20px",
      background: "rgba(255,255,255,0.02)",
      border: "1px dashed var(--glass-border)",
      borderRadius: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)" }}>
          <Info size={14} />
          <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Field Engineering Trivia
          </span>
        </div>
        <button 
          onClick={refresh}
          style={{ 
            background: "none", 
            border: "none", 
            color: "var(--muted)", 
            cursor: "pointer",
            padding: 4,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
          title="New fact"
        >
          <RefreshCw size={12} />
        </button>
      </div>
      
      <p style={{ 
        margin: 0, 
        fontSize: 13, 
        lineHeight: 1.6, 
        color: "var(--fg-soft)", 
        fontFamily: "var(--font-body)",
        fontStyle: "italic"
      }}>
        &ldquo;{fact}&rdquo;
      </p>

      {/* Decorative background element */}
      <div style={{ 
        position: "absolute", 
        bottom: -20, 
        right: -20, 
        opacity: 0.03, 
        pointerEvents: "none",
        color: "var(--accent)"
      }}>
        <Info size={120} />
      </div>
    </div>
  );
}
