"use client";

import { useState } from "react";
import { Calculator, X } from "lucide-react";

/**
 * Persistent floating mini-calculator. Collapsed by default as a small FAB
 * positioned above the bottom nav. Click to expand a popover with the most
 * common ad-hoc conversions an engineer wants without leaving their current
 * tool: kW ↔ A (3φ or 1φ at 230/400 V) and °F ↔ °C.
 *
 * Scope is intentionally narrow — anything more complex (vdrop, conduit fill)
 * lives in its dedicated tool.
 */
export default function QuickCalcBar() {
  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState("");
  const [voltage, setVoltage] = useState<"230" | "400">("400");
  const [phase, setPhase] = useState<"3ph" | "1ph">("3ph");
  const [celsius, setCelsius] = useState("");

  const kwN = parseFloat(kw);
  const vN = parseFloat(voltage);
  const ampere = kwN && vN
    ? phase === "3ph"
      ? (kwN * 1000) / (Math.sqrt(3) * vN * 0.85)
      : (kwN * 1000) / (vN * 0.85)
    : 0;

  const cN = parseFloat(celsius);
  const fahrenheit = Number.isFinite(cN) ? cN * 9 / 5 + 32 : null;

  return (
    <>
      {/* Trigger FAB */}
      <button
        type="button"
        aria-label={open ? "Close quick calculator" : "Open quick calculator"}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed",
          right: 16,
          bottom: "calc(112px + env(safe-area-inset-bottom, 0px))",
          zIndex: 140,
          width: 44, height: 44,
          borderRadius: "50%",
          border: "1px solid var(--accent)",
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          color: "var(--accent)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(0,0,0,0.18), 0 0 0 4px rgba(var(--accent-rgb), 0.05)",
          transition: "transform 0.16s ease, box-shadow 0.16s ease",
        }}
      >
        {open ? <X size={18} strokeWidth={2.4} /> : <Calculator size={18} strokeWidth={2.4} />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Quick conversions"
          style={{
            position: "fixed",
            right: 16,
            bottom: "calc(168px + env(safe-area-inset-bottom, 0px))",
            zIndex: 140,
            width: 280,
            maxWidth: "calc(100vw - 32px)",
            background: "var(--popout-bg)",
            color: "var(--popout-fg)",
            border: "1px solid var(--popout-border)",
            borderRadius: 16,
            padding: 14,
            boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* kW → A */}
          <div>
            <Label>kW → A</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 64px 64px", gap: 6, marginTop: 6 }}>
              <input
                type="number" inputMode="decimal" placeholder="kW"
                value={kw} onChange={e => setKw(e.target.value)}
                style={inputStyle}
              />
              <select value={voltage} onChange={e => setVoltage(e.target.value as "230" | "400")} style={inputStyle}>
                <option value="230">230 V</option>
                <option value="400">400 V</option>
              </select>
              <select value={phase} onChange={e => setPhase(e.target.value as "3ph" | "1ph")} style={inputStyle}>
                <option value="3ph">3φ</option>
                <option value="1ph">1φ</option>
              </select>
            </div>
            <Output value={ampere ? `${ampere.toFixed(1)} A` : "—"} hint="pf 0.85" />
          </div>

          {/* °C → °F */}
          <div>
            <Label>°C → °F</Label>
            <input
              type="number" inputMode="decimal" placeholder="°C"
              value={celsius} onChange={e => setCelsius(e.target.value)}
              style={{ ...inputStyle, marginTop: 6, width: "100%" }}
            />
            <Output value={fahrenheit !== null ? `${fahrenheit.toFixed(1)} °F` : "—"} />
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid var(--popout-border)",
  background: "rgba(var(--accent-rgb), 0.04)",
  color: "var(--popout-fg)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--popout-muted)",
      fontWeight: 700,
    }}>{children}</div>
  );
}

function Output({ value, hint }: { value: string; hint?: string }) {
  return (
    <div style={{
      marginTop: 8,
      padding: "8px 10px",
      borderRadius: 8,
      background: "rgba(var(--accent-rgb), 0.08)",
      border: "1px solid rgba(var(--accent-rgb), 0.16)",
      fontFamily: "var(--font-mono)",
      fontSize: 14,
      fontWeight: 700,
      color: "var(--accent)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
    }}>
      <span>{value}</span>
      {hint && <span style={{ fontSize: 9, opacity: 0.6, fontWeight: 500 }}>{hint}</span>}
    </div>
  );
}
