"use client";
import { useState } from "react";

interface Props {
  label: string;
  unit?: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  required?: boolean;
}

export default function FieldNumber({ label, unit, value, onChange, min, max, step, hint, required }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-xs)",
        color: "var(--fg-soft)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        {label}
        {unit && (
          <span style={{
            color: "var(--accent)",
            border: "1px solid var(--glass-border)",
            borderRadius: 4,
            padding: "1px 6px",
            fontSize: 9,
            letterSpacing: "0.04em",
          }}>
            {unit}
          </span>
        )}
        {required && <span style={{ color: "var(--accent)", marginLeft: 2 }}>*</span>}
      </label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
        step={step ?? "any"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: "var(--glass-bg)",
          border: `1px solid ${focused ? "var(--accent)" : "var(--glass-border)"}`,
          borderRadius: "var(--r-md)",
          color: "var(--fg)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-md)",
          padding: "10px 14px",
          width: "100%",
          outline: "none",
          WebkitAppearance: "none",
          MozAppearance: "textfield",
          transition: "box-shadow 0.14s ease",
          boxShadow: focused
            ? "0 0 0 3px rgba(201,168,76,0.18), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "none",
        } as React.CSSProperties}
      />
      {hint && (
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted-soft)",
          letterSpacing: "0.02em",
        }}>
          {hint}
        </div>
      )}
    </div>
  );
}
