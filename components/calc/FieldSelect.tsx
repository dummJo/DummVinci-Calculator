"use client";
import { useState } from "react";

interface Option { value: string; label: string }

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  hint?: string;
}

export default function FieldSelect({ label, value, onChange, options, hint }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-xs)",
        color: "var(--fg-soft)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: "var(--bg-raised)",
          border: `1px solid ${focused ? "var(--accent)" : "var(--glass-border)"}`,
          borderRadius: "var(--r-md)",
          color: "var(--fg)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-sm)",
          padding: "10px 14px",
          width: "100%",
          outline: "none",
          cursor: "pointer",
          transition: "box-shadow 0.14s ease",
          boxShadow: focused
            ? "0 0 0 3px rgba(201,168,76,0.18)"
            : "none",
        } as React.CSSProperties}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-soft)", letterSpacing: "0.02em" }}>
          {hint}
        </div>
      )}
    </div>
  );
}
