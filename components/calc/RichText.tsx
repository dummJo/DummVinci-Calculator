import React from "react";

export default function RichText({ text }: { text: string }) {
  if (!text) return null;
  // Splits by **bold**, *italic*, and `code`
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return (
            <b key={i} style={{ fontWeight: 800, color: "var(--fg)", letterSpacing: "0.02em" }}>
              {p.slice(2, -2)}
            </b>
          );
        }
        if (p.startsWith("*") && p.endsWith("*")) {
          return (
            <i key={i} style={{ fontStyle: "italic", color: "var(--accent)", fontWeight: 500 }}>
              {p.slice(1, -1)}
            </i>
          );
        }
        if (p.startsWith("`") && p.endsWith("`")) {
          return (
            <code key={i} style={{ 
              fontFamily: "var(--font-mono)", fontSize: "0.9em", 
              color: "#e8a045", background: "rgba(232, 160, 69, 0.1)", 
              padding: "2px 6px", borderRadius: 4, fontWeight: 700 
            }}>
              {p.slice(1, -1)}
            </code>
          );
        }
        return p;
      })}
    </>
  );
}
