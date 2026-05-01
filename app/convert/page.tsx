"use client";

import { useState, useCallback } from "react";
import CalcShell from "@/components/calc/CalcShell";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";

// ─── Conversion Database ──────────────────────────────────────────────────────

type UnitDef = { label: string; factor: number; offset?: number };

type Category = {
  label: string;
  units: Record<string, UnitDef>;
  note?: string;
};

const CATEGORIES: Record<string, Category> = {
  power: {
    label: "Power",
    units: {
      kW:   { label: "Kilowatt (kW)",           factor: 1 },
      W:    { label: "Watt (W)",                 factor: 0.001 },
      MW:   { label: "Megawatt (MW)",             factor: 1000 },
      hp:   { label: "Horsepower — IEC (HP)",    factor: 0.74569987 },
      hpUS: { label: "Horsepower — US (hp)",     factor: 0.7457 },
      BTUh: { label: "BTU/hr",                   factor: 0.000293071 },
    },
    note: "1 HP (IEC metric) = 0.74569987 kW",
  },
  energy: {
    label: "Energy",
    units: {
      kWh:  { label: "Kilowatt-hour (kWh)",      factor: 1 },
      Wh:   { label: "Watt-hour (Wh)",           factor: 0.001 },
      MWh:  { label: "Megawatt-hour (MWh)",      factor: 1000 },
      kJ:   { label: "Kilojoule (kJ)",           factor: 0.000277778 },
      MJ:   { label: "Megajoule (MJ)",           factor: 0.277778 },
      BTU:  { label: "BTU",                      factor: 0.000293071 },
      kcal: { label: "Kilocalorie (kcal)",       factor: 0.001163 },
    },
    note: "1 kWh = 3600 kJ = 3412.14 BTU",
  },
  current: {
    label: "Current / Apparent Power",
    units: {
      A:    { label: "Ampere (A)",               factor: 1 },
      mA:   { label: "Milliampere (mA)",         factor: 0.001 },
      kA:   { label: "Kiloampere (kA)",          factor: 1000 },
    },
    note: "Use kVA↔Amps card below for 3-phase calculations",
  },
  voltage: {
    label: "Voltage",
    units: {
      V:    { label: "Volt (V)",                 factor: 1 },
      mV:   { label: "Millivolt (mV)",           factor: 0.001 },
      kV:   { label: "Kilovolt (kV)",            factor: 1000 },
    },
  },
  resistance: {
    label: "Resistance",
    units: {
      Ω:    { label: "Ohm (Ω)",                  factor: 1 },
      mΩ:   { label: "Milliohm (mΩ)",            factor: 0.001 },
      kΩ:   { label: "Kilohm (kΩ)",              factor: 1000 },
      MΩ:   { label: "Megaohm (MΩ)",             factor: 1000000 },
    },
    note: "IEC 60364-6: Insulation resistance > 1 MΩ required",
  },
  length: {
    label: "Length / Distance",
    units: {
      m:    { label: "Meter (m)",                factor: 1 },
      mm:   { label: "Millimeter (mm)",          factor: 0.001 },
      cm:   { label: "Centimeter (cm)",          factor: 0.01 },
      km:   { label: "Kilometer (km)",           factor: 1000 },
      ft:   { label: "Foot (ft)",                factor: 0.3048 },
      inch: { label: "Inch (in)",                factor: 0.0254 },
      yd:   { label: "Yard (yd)",                factor: 0.9144 },
      mi:   { label: "Mile (mi)",                factor: 1609.344 },
    },
    note: "1 m = 39.3701 in = 3.28084 ft",
  },
  area: {
    label: "Cable Cross-Section (Area)",
    units: {
      mm2:  { label: "mm² (metric standard)",    factor: 1 },
      cm2:  { label: "cm²",                      factor: 100 },
      in2:  { label: "in²",                      factor: 645.16 },
      kcmil:{ label: "kcmil / MCM",              factor: 0.5067 },
    },
    note: "AWG lookup: 1 AWG #10 = 5.26 mm², #8 = 8.36 mm², #4 = 21.15 mm²",
  },
  temperature: {
    label: "Temperature",
    units: {
      C:    { label: "Celsius (°C)",             factor: 1, offset: 0 },
      F:    { label: "Fahrenheit (°F)",          factor: 0, offset: 0 },
      K:    { label: "Kelvin (K)",               factor: 0, offset: 0 },
    },
    note: "Standard motor operating range: 0–40 °C (IEC 60034)",
  },
  pressure: {
    label: "Pressure",
    units: {
      bar:  { label: "Bar",                      factor: 1 },
      Pa:   { label: "Pascal (Pa)",              factor: 0.00001 },
      kPa:  { label: "Kilopascal (kPa)",        factor: 0.01 },
      MPa:  { label: "Megapascal (MPa)",         factor: 10 },
      psi:  { label: "PSI (lb/in²)",             factor: 0.0689476 },
      atm:  { label: "Atmosphere (atm)",         factor: 1.01325 },
    },
    note: "Pump & compressor ratings often in bar or PSI",
  },
  torque: {
    label: "Torque",
    units: {
      Nm:   { label: "Newton-meter (N·m)",       factor: 1 },
      kNm:  { label: "Kilonewton-meter (kN·m)", factor: 1000 },
      ftlb: { label: "Foot-pound (ft·lb)",       factor: 1.35582 },
      inlb: { label: "Inch-pound (in·lb)",       factor: 0.112985 },
    },
    note: "Motor nameplate torque: T = 9550 × P(kW) / n(rpm)",
  },
  flow: {
    label: "Flow Rate",
    units: {
      m3h:  { label: "m³/hour",                  factor: 1 },
      m3s:  { label: "m³/second",                factor: 3600 },
      lmin: { label: "L/min",                    factor: 0.06 },
      ls:   { label: "L/second",                 factor: 3.6 },
      GPM:  { label: "US GPM",                   factor: 0.227125 },
    },
    note: "Pump affinity: Q ∝ n, H ∝ n², P ∝ n³",
  },
};

// ─── Temperature special-case converter ──────────────────────────────────────
function convertTemp(value: number, from: string, to: string): number {
  let celsius: number;
  switch (from) {
    case "F": celsius = (value - 32) * 5 / 9; break;
    case "K": celsius = value - 273.15; break;
    default:  celsius = value;
  }
  switch (to) {
    case "F": return celsius * 9 / 5 + 32;
    case "K": return celsius + 273.15;
    default:  return celsius;
  }
}

// ─── Generic factor-based converter ──────────────────────────────────────────
function convertValue(value: number, from: string, to: string, catKey: string): number {
  if (catKey === "temperature") return convertTemp(value, from, to);
  const cat = CATEGORIES[catKey];
  const fromFactor = cat.units[from]?.factor ?? 1;
  const toFactor   = cat.units[to]?.factor   ?? 1;
  // Convert to base unit first, then to target
  return (value * fromFactor) / toFactor;
}

// ─── Format output ────────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  if (Math.abs(n) >= 1e6)  return n.toExponential(4);
  if (Math.abs(n) >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  if (Math.abs(n) >= 1)    return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  return n.toPrecision(6);
}

// ─── Swap icon ───────────────────────────────────────────────────────────────
function SwapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4" />
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConvertPage() {
  const { t } = useLang();
  const tc = t.convert;

  const catLabels: Record<string, string> = {
    power:       tc.catPower,
    energy:      tc.catEnergy,
    current:     tc.catCurrent,
    voltage:     tc.catVoltage,
    resistance:  tc.catResistance,
    length:      tc.catLength,
    area:        tc.catArea,
    temperature: tc.catTemp,
    pressure:    tc.catPressure,
    torque:      tc.catTorque,
    flow:        tc.catFlow,
  };

  const catKeys = Object.keys(CATEGORIES);
  const [catKey, setCatKey] = useState(catKeys[0]);
  const cat = CATEGORIES[catKey];
  const unitKeys = Object.keys(cat.units);

  const [from, setFrom] = useState(unitKeys[0]);
  const [to,   setTo]   = useState(unitKeys[1] ?? unitKeys[0]);
  const [input, setInput] = useState("1");

  const handleCatChange = (key: string) => {
    setCatKey(key);
    const units = Object.keys(CATEGORIES[key].units);
    setFrom(units[0]);
    setTo(units[1] ?? units[0]);
    setInput("1");
  };

  const handleSwap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const numVal = parseFloat(input);
  const result = !isNaN(numVal) ? convertValue(numVal, from, to, catKey) : null;

  const selectStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid var(--glass-border)",
    borderRadius: 8,
    color: "var(--fg)",
    padding: "10px 14px",
    fontSize: 14,
    fontFamily: "var(--font-mono)",
    width: "100%",
    cursor: "pointer",
    outline: "none",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
  };

  return (
    <CalcShell label="Convert" title={tc.title} subtitle={tc.subtitle} concept={tc.concept}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Category Grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {catKeys.map(k => (
            <button
              key={k}
              onClick={() => handleCatChange(k)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "1px solid",
                borderColor: catKey === k ? "var(--accent)" : "var(--glass-border)",
                background: catKey === k ? "rgba(228,199,89,0.15)" : "transparent",
                color: catKey === k ? "var(--accent)" : "var(--fg-soft)",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                fontWeight: catKey === k ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {catLabels[k] ?? CATEGORIES[k].label}
            </button>
          ))}
        </div>

        {/* Converter Card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--glass-border)",
          borderRadius: 12,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 18, color: "var(--accent)" }}>
            {catLabels[catKey] ?? cat.label}
          </h3>

          {/* Input Row */}
          <div>
            <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              {tc.value ?? "Value"}
            </label>
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{
                ...selectStyle,
                fontSize: 24,
                fontWeight: 600,
                color: "var(--fg)",
                letterSpacing: "-0.02em",
                padding: "12px 16px",
              }}
            />
          </div>

          {/* From / Swap / To */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                From
              </label>
              <div style={{ position: "relative" }}>
                <select value={from} onChange={e => setFrom(e.target.value)} style={selectStyle}>
                  {unitKeys.map(k => (
                    <option key={k} value={k} style={{ background: "#0b0e14" }}>
                      {CATEGORIES[catKey].units[k].label}
                    </option>
                  ))}
                </select>
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)", fontSize: 10 }}>▼</span>
              </div>
            </div>

            <button
              onClick={handleSwap}
              style={{
                padding: "10px",
                borderRadius: 8,
                border: "1px solid var(--glass-border)",
                background: "rgba(228,199,89,0.08)",
                color: "var(--accent)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
              title="Swap units"
            >
              <SwapIcon />
            </button>

            <div>
              <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                To
              </label>
              <div style={{ position: "relative" }}>
                <select value={to} onChange={e => setTo(e.target.value)} style={selectStyle}>
                  {unitKeys.map(k => (
                    <option key={k} value={k} style={{ background: "#0b0e14" }}>
                      {CATEGORIES[catKey].units[k].label}
                    </option>
                  ))}
                </select>
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)", fontSize: 10 }}>▼</span>
              </div>
            </div>
          </div>

          {/* Result */}
          <div style={{
            marginTop: 4,
            padding: "20px 20px",
            background: "linear-gradient(135deg, rgba(228,199,89,0.08), rgba(228,199,89,0.03))",
            border: "1px solid rgba(228,199,89,0.25)",
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {tc.result ?? "Result"}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 36, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--accent)", lineHeight: 1 }}>
                {result !== null ? fmt(result) : "—"}
              </span>
              <span style={{ fontSize: 16, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                {cat.units[to]?.label}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--fg-soft)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
              {!isNaN(numVal) && result !== null
                ? `${numVal} ${cat.units[from]?.label} = ${fmt(result)} ${cat.units[to]?.label}`
                : "Enter a value above"}
            </div>
          </div>

          {/* Note */}
          {cat.note && (
            <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, borderLeft: "2px solid var(--accent)" }}>
              📐 {cat.note}
            </div>
          )}
        </div>

      </div>
      <Footer />
    </CalcShell>
  );
}
