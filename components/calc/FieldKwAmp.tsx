"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";

const SQRT3 = 1.7320508;

function kwToAmps(kw: number, v: number, ph: "3ph" | "1ph", pf: number): number {
  if (!kw || !v || !pf) return 0;
  return ph === "3ph"
    ? (kw * 1000) / (SQRT3 * v * pf)
    : (kw * 1000) / (v * pf);
}

function ampsToKw(a: number, v: number, ph: "3ph" | "1ph", pf: number): number {
  if (!a || !v || !pf) return 0;
  return ph === "3ph"
    ? (a * SQRT3 * v * pf) / 1000
    : (a * v * pf) / 1000;
}

interface Props {
  label: string;
  voltage: number;
  phase?: "3ph" | "1ph";
  pf?: number;
  defaultMode?: "a" | "kw";
  defaultAmps?: number;
  defaultKw?: number;
  onChange: (amps: number, kw: number) => void;
  required?: boolean;
  hint?: string;
  min?: number;
}

export default function FieldKwAmp({
  label, voltage, phase = "3ph", pf = 0.85,
  defaultMode = "a", defaultAmps, defaultKw,
  onChange, required, hint, min = 0,
}: Props) {
  const { t } = useLang();

  const initAmps = defaultAmps ?? (defaultKw ? kwToAmps(defaultKw, voltage, phase, pf) : 0);
  const initKw   = defaultKw  ?? (defaultAmps ? ampsToKw(defaultAmps, voltage, phase, pf) : 0);

  const [mode, setMode]   = useState<"a" | "kw">(defaultMode);
  const [aStr, setAStr]   = useState(initAmps > 0 ? initAmps.toFixed(1) : "");
  const [kwStr, setKwStr] = useState(initKw   > 0 ? initKw.toFixed(2)  : "");
  const [focused, setFocused] = useState(false);

  // Re-derive secondary value when voltage / phase / pf changes
  useEffect(() => {
    if (mode === "kw" && kwStr) {
      const a = kwToAmps(parseFloat(kwStr) || 0, voltage, phase, pf);
      setAStr(a > 0 ? a.toFixed(1) : "");
      onChange(a, parseFloat(kwStr) || 0);
    } else if (mode === "a" && aStr) {
      const kw = ampsToKw(parseFloat(aStr) || 0, voltage, phase, pf);
      setKwStr(kw > 0 ? kw.toFixed(2) : "");
      onChange(parseFloat(aStr) || 0, kw);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voltage, phase, pf]);

  function handleKwChange(v: string) {
    setKwStr(v);
    const kw = parseFloat(v) || 0;
    const a  = kwToAmps(kw, voltage, phase, pf);
    setAStr(a > 0 ? a.toFixed(1) : "");
    onChange(a, kw);
  }

  function handleAChange(v: string) {
    setAStr(v);
    const a  = parseFloat(v) || 0;
    const kw = ampsToKw(a, voltage, phase, pf);
    setKwStr(kw > 0 ? kw.toFixed(2) : "");
    onChange(a, kw);
  }

  const aVal  = parseFloat(aStr)  || 0;
  const kwVal = parseFloat(kwStr) || 0;

  const estHint = mode === "kw" && kwVal > 0
    ? t.kwamp.estimatedA(kwToAmps(kwVal, voltage, phase, pf), voltage, phase, pf)
    : mode === "a" && aVal > 0
      ? t.kwamp.estimatedKw(ampsToKw(aVal, voltage, phase, pf), voltage, phase, pf)
      : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Label row + pill toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <label style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-xs)",
          color: "var(--fg-soft)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {label}
          {required && <span style={{ color: "var(--accent)" }}>*</span>}
        </label>

        {/* Mode pill */}
        <div style={{
          display: "flex",
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--r-pill)",
          padding: 2,
          gap: 1,
          flexShrink: 0,
        }}>
          {(["a", "kw"] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                padding: "2px 9px",
                borderRadius: "var(--r-pill)",
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                background: mode === m ? "var(--accent)" : "transparent",
                color: mode === m ? "var(--bg-deep, #090807)" : "var(--muted)",
                fontWeight: mode === m ? 700 : 400,
                transition: "background 0.14s ease, color 0.14s ease",
                lineHeight: "18px",
              }}
            >
              {m === "a" ? "A" : "kW"}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <input
        type="number"
        inputMode="decimal"
        value={mode === "a" ? aStr : kwStr}
        onChange={e => mode === "a" ? handleAChange(e.target.value) : handleKwChange(e.target.value)}
        min={min}
        step="any"
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

      {/* Live conversion hint */}
      {estHint && (
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--accent)",
          opacity: 0.75,
          letterSpacing: "0.03em",
          transition: "opacity 0.18s ease",
        }}>
          {estHint}
        </div>
      )}

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
