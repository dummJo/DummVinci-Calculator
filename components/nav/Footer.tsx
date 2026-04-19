"use client";
import { useEffect, useState } from "react";

import { getRandomQuote } from "@/lib/quotes";

export default function Footer() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  return (
    <footer style={{
      marginTop: 48,
      textAlign: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      color: "var(--muted-soft)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      paddingBottom: 32,
      opacity: quote ? 1 : 0,
      transition: "opacity 0.5s ease",
    }}>
      <div style={{ marginBottom: 4, color: "var(--accent)", opacity: 0.6 }}>
        ◈ Managed by dummJo.
      </div>
      <div>{quote}</div>
    </footer>
  );
}
