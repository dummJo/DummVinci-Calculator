"use client";
import { useEffect, useState } from "react";

import { getRandomQuote, type Quote } from "@/lib/quotes";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLang();
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const q = getRandomQuote();
    const timeoutId = setTimeout(() => setQuote(q), 0);
    return () => clearTimeout(timeoutId);
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
        {t.common.managedBy}
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

      {/* PTTS Credit */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 8, marginTop: 16, opacity: 0.45
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", overflow: "hidden",
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.ptts.co.id/uploads/1/3/3/7/133745061/logo-web_orig.png"
            alt="PTTS"
            style={{ width: "90%", height: "90%", objectFit: "contain" }}
          />
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 8,
          color: "var(--muted-soft)", letterSpacing: "0.06em",
          textTransform: "uppercase"
        }}>
          Supported by PT Prima Tekindo Tirta Sejahtera
        </span>
      </div>
    </footer>
  );
}
