"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import CalcShell from "@/components/calc/CalcShell";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import { ChevronDown, Layers, ArrowUpDown } from "lucide-react";

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
    label: "Current",
    units: {
      A:    { label: "Ampere (A)",               factor: 1 },
      mA:   { label: "Milliampere (mA)",         factor: 0.001 },
      kA:   { label: "Kiloampere (kA)",          factor: 1000 },
    },
    note: "Amperage at rated voltage",
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
    label: "Cable Area",
    units: {
      mm2:  { label: "mm² (metric standard)",    factor: 1 },
      cm2:  { label: "cm²",                      factor: 100 },
      in2:  { label: "in²",                      factor: 645.16 },
      kcmil:{ label: "kcmil / MCM",              factor: 0.5067 },
    },
    note: "AWG lookup: #10 = 5.26 mm², #4 = 21.15 mm²",
  },
  temperature: {
    label: "Temperature",
    units: {
      C:    { label: "Celsius (°C)",             factor: 1, offset: 0 },
      F:    { label: "Fahrenheit (°F)",          factor: 0, offset: 0 },
      K:    { label: "Kelvin (K)",               factor: 0, offset: 0 },
    },
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
  },
  torque: {
    label: "Torque",
    units: {
      Nm:   { label: "Newton-meter (N·m)",       factor: 1 },
      kNm:  { label: "Kilonewton-meter (kN·m)", factor: 1000 },
      ftlb: { label: "Foot-pound (ft·lb)",       factor: 1.35582 },
      inlb: { label: "Inch-pound (in·lb)",       factor: 0.112985 },
    },
  },
  flow: {
    label: "Flow Rate",
    units: {
      m3h:  { label: "m³/hour",                  factor: 1 },
      lmin: { label: "L/min",                    factor: 0.06 },
      ls:   { label: "L/second",                 factor: 3.6 },
      GPM:  { label: "US GPM",                   factor: 0.227125 },
    },
  },
};

// ─── Converters ──────────────────────────────────────────────────────────────

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

function convertValue(value: number, from: string, to: string, catKey: string): number {
  if (catKey === "temperature") return convertTemp(value, from, to);
  const cat = CATEGORIES[catKey];
  const fromFactor = cat.units[from]?.factor ?? 1;
  const toFactor   = cat.units[to]?.factor   ?? 1;
  return (value * fromFactor) / toFactor;
}

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  if (Math.abs(n) >= 1e6)  return n.toExponential(4);
  if (Math.abs(n) >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  if (Math.abs(n) >= 1)    return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  return n.toPrecision(6);
}

// ─── Main Component ──────────────────────────────────────────────────────────

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const cat = CATEGORIES[catKey];
  const unitKeys = Object.keys(cat.units);

  const [from, setFrom] = useState(unitKeys[0]);
  const [to,   setTo]   = useState(unitKeys[1] ?? unitKeys[0]);
  const [input, setInput] = useState("1");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCatChange = (key: string) => {
    setCatKey(key);
    const units = Object.keys(CATEGORIES[key].units);
    setFrom(units[0]);
    setTo(units[1] ?? units[0]);
    setInput("1");
    setIsMenuOpen(false);
  };

  const handleSwap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const numVal = parseFloat(input);
  const result = !isNaN(numVal) ? convertValue(numVal, from, to, catKey) : null;

  return (
    <CalcShell label="Convert" title={tc.title} subtitle={tc.subtitle} concept={tc.concept}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* COMPACT POPOUT SELECTOR */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              background: "rgba(228,199,89,0.12)",
              border: "1px solid var(--accent)",
              borderRadius: 14,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Layers size={18} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)", fontFamily: "var(--font-display)" }}>
                {catLabels[catKey] ?? cat.label}
              </span>
            </div>
            <ChevronDown 
              size={18} 
              style={{ 
                color: "var(--muted)", 
                transform: isMenuOpen ? "rotate(180deg)" : "rotate(0)", 
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)" 
              }} 
            />
          </button>

          {/* POPOUT MENU */}
          {isMenuOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              background: "var(--bg-raised)",
              backdropFilter: "blur(40px)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: "8px",
              zIndex: 100,
              boxShadow: "var(--glass-shadow)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px",
              animation: "popIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            }}>
              {catKeys.map(k => (
                <button
                  key={k}
                  onClick={() => handleCatChange(k)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: catKey === k ? "var(--accent-pill-bg)" : "transparent",
                    color: catKey === k ? "var(--accent)" : "var(--fg-soft)",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: catKey === k ? 700 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {catLabels[k] ?? CATEGORIES[k].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MAIN CONVERTER CARD */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--glass-border)",
          borderRadius: 20,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}>
          
          {/* VALUE INPUT */}
          <div>
            <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
              {tc.value ?? "Value"}
            </label>
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--glass-border)",
                borderRadius: 12,
                color: "var(--fg)",
                padding: "16px 20px",
                fontSize: 32,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--glass-border)"}
            />
          </div>

          {/* UNIT SELECTORS */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>{tc.from ?? "From"}</label>
              <select 
                value={from} 
                onChange={e => setFrom(e.target.value)} 
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: 10, color: "var(--fg)", padding: "10px 14px", fontSize: 14, outline: "none", cursor: "pointer" }}
              >
                {unitKeys.map(k => (
                  <option key={k} value={k} style={{ background: "#16181d" }}>{cat.units[k].label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSwap}
              style={{
                marginTop: 20,
                width: 44, height: 44,
                borderRadius: 12,
                border: "1px solid var(--glass-border)",
                background: "rgba(228,199,89,0.1)",
                color: "var(--accent)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <ArrowUpDown size={20} />
            </button>

            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>{tc.to ?? "To"}</label>
              <select 
                value={to} 
                onChange={e => setTo(e.target.value)} 
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: 10, color: "var(--fg)", padding: "10px 14px", fontSize: 14, outline: "none", cursor: "pointer" }}
              >
                {unitKeys.map(k => (
                  <option key={k} value={k} style={{ background: "#16181d" }}>{cat.units[k].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* RESULT BOX */}
          <div style={{
            marginTop: 8,
            padding: "24px",
            background: "linear-gradient(135deg, rgba(228,199,89,0.1) 0%, rgba(228,199,89,0.03) 100%)",
            border: "1px solid rgba(228,199,89,0.3)",
            borderRadius: 16,
            textAlign: "center"
          }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
              {tc.result ?? "CONVERSION RESULT"}
            </div>
            <div style={{ fontSize: 42, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--fg)", lineHeight: 1.1 }}>
              {result !== null ? fmt(result) : "—"}
            </div>
            <div style={{ fontSize: 16, color: "var(--muted)", fontWeight: 500, marginTop: 8 }}>
              {cat.units[to]?.label}
            </div>
            
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "var(--fg-soft)", fontFamily: "var(--font-mono)", opacity: 0.8 }}>
              {!isNaN(numVal) && result !== null
                ? `${numVal} ${cat.units[from]?.label} ≈ ${fmt(result)} ${cat.units[to]?.label}`
                : "Awaiting input..."}
            </div>
          </div>

          {/* STANDARDS / NOTES */}
          {cat.note && (
            <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, borderLeft: "3px solid var(--accent)", fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
               <span style={{ color: "var(--accent)", fontWeight: 700, marginRight: 8 }}>NOTE:</span> {cat.note}
            </div>
          )}
        </div>

      </div>
      <Footer />

      <style jsx global>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.96) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </CalcShell>
  );
}
