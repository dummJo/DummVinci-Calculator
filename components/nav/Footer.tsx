"use client";
import { useEffect, useState } from "react";

import { getRandomQuote, type Quote } from "@/lib/quotes";

export default function Footer() {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  return (
    <footer style={{
      marginTop: 64,
      textAlign: "center",
      paddingBottom: 40,
      opacity: quote ? 1 : 0,
      transition: "opacity 1s ease",
    }}>
      <div style={{ 
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: "var(--accent)", 
        opacity: 0.5,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        marginBottom: 12
      }}>
        ◈ Managed by dummJo.
      </div>
      
      <div style={{
        maxWidth: 400,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 2
      }}>
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          fontStyle: "italic",
          color: "var(--fg-soft)",
          lineHeight: 1.5
        }}>
          &ldquo;{quote?.text}&rdquo;
        </div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--muted-soft)",
          textTransform: "uppercase",
          letterSpacing: "0.1em"
        }}>
          — {quote?.author}
        </div>
      </div>
    </footer>
  );
}
