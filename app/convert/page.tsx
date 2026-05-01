"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";

// ─── Perspective SVG Illustrations ──────────────────────────────────────────

function SvgMotor() {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="16" y="20" width="32" height="24" rx="4" />
      <path d="M12 28v8M48 28v8M24 20v-4M30 20v-4M36 20v-4M40 20v-4M20 20v-4" />
      <circle cx="16" cy="32" r="2" fill="currentColor" />
      <path d="M48 32h8" strokeWidth="4" />
    </svg>
  );
}

function SvgPanel() {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="16" y="8" width="32" height="48" rx="2" />
      <path d="M16 20h32M16 48h32" />
      <circle cx="42" cy="34" r="3" />
      <path d="M42 28v3" />
      {/* Dimension lines to show POV */}
      <path d="M10 8v48M8 8h4M8 56h4" stroke="var(--accent)" strokeDasharray="2 2" strokeWidth="1" />
      <text x="5" y="34" fill="var(--accent)" fontSize="8" style={{ transform: "rotate(-90deg)", transformOrigin: "5px 34px" }}>H</text>
      <path d="M16 4h32M16 2h4M48 2h4" stroke="var(--accent)" strokeDasharray="2 2" strokeWidth="1" />
      <text x="30" y="2" fill="var(--accent)" fontSize="8">W</text>
    </svg>
  );
}

function SvgCableArea() {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="32" cy="32" r="16" />
      <circle cx="32" cy="32" r="8" fill="var(--accent)" stroke="none" opacity="0.3" />
      <circle cx="32" cy="32" r="8" strokeDasharray="2 2" stroke="var(--accent)" />
      <path d="M16 32H2M48 32h14" stroke="var(--muted)" strokeWidth="1" />
      <text x="4" y="30" fill="var(--muted)" fontSize="8">Cross</text>
      <text x="4" y="40" fill="var(--muted)" fontSize="8">Section</text>
    </svg>
  );
}

function SvgTransformer() {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="12" y="20" width="40" height="24" rx="2" />
      <circle cx="22" cy="14" r="6" />
      <circle cx="42" cy="14" r="6" />
      <path d="M22 20v8M42 20v8" />
      <path d="M12 44h40M16 44v8M48 44v8" />
    </svg>
  );
}

function SvgDistance() {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 32h40" strokeDasharray="4 4" stroke="var(--muted)" />
      <path d="M12 24v16M52 24v16" />
      <path d="M28 28l-16 4 16 4M36 28l16 4-16 4" />
    </svg>
  );
}

const CardRow = ({ children, title, icon }: { children: React.ReactNode, title: string, icon: React.ReactNode }) => (
  <div style={{
    display: "flex", flexDirection: "column", gap: 16,
    background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)",
    borderRadius: "var(--r-md)", padding: 24
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ 
        width: 64, height: 64, borderRadius: "50%", background: "rgba(201,168,76,0.08)", 
        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" 
      }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--fg)", margin: 0, fontWeight: 600 }}>{title}</h3>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "center" }}>
      {children}
    </div>
  </div>
);

export default function ConvertPage() {
  const { t } = useLang();
  const tc = t.convert || {
    title: "Electrical Converter", subtitle: "Quick conversions for field engineering", concept: "Convert standard units.",
    motorKw: "kW", motorHp: "HP", panelMm: "mm", panelInch: "inch",
    cableAwg: "AWG", cableMm2: "mm²",
    kva: "kVA", amps: "Amps",
    secMotor: "Motor Power (POV: Motor Nameplate)",
    secPanel: "Enclosure Dimensions (POV: Panel Builder)",
    secCable: "Conductor Size (POV: Wiring/Cabling)",
    secPower: "Apparent Power (POV: Transformer/Genset)",
    distMeter: "Meter (m)", distInch: "Inch (in)", secDist: "Routing Distance (POV: Cable Pulling)",
  };

  // State for Motor
  const [kw, setKw] = useState("11");
  const [hp, setHp] = useState((11 * 1.34102).toFixed(2));

  const handleKwChange = (val: string) => {
    setKw(val);
    const num = parseFloat(val);
    if (!isNaN(num)) setHp((num * 1.34102).toFixed(2));
    else setHp("");
  };
  const handleHpChange = (val: string) => {
    setHp(val);
    const num = parseFloat(val);
    if (!isNaN(num)) setKw((num / 1.34102).toFixed(2));
    else setKw("");
  };

  // State for Panel
  const [mm, setMm] = useState("1000");
  const [inch, setInch] = useState((1000 / 25.4).toFixed(2));

  const handleMmChange = (val: string) => {
    setMm(val);
    const num = parseFloat(val);
    if (!isNaN(num)) setInch((num / 25.4).toFixed(2));
    else setInch("");
  };
  const handleInchChange = (val: string) => {
    setInch(val);
    const num = parseFloat(val);
    if (!isNaN(num)) setMm((num * 25.4).toFixed(2));
    else setMm("");
  };

  // State for Cable
  const [awg, setAwg] = useState("8");
  const [mm2, setMm2] = useState("8.36");

  const calcMm2 = (a: number) => 53.475 * Math.pow(Math.E, -0.1159 * a);
  const calcAwg = (m: number) => -8.628 * Math.log(m / 53.475);

  const handleAwgChange = (val: string) => {
    setAwg(val);
    const num = parseFloat(val);
    if (!isNaN(num)) setMm2(calcMm2(num).toFixed(2));
    else setMm2("");
  };
  const handleMm2Change = (val: string) => {
    setMm2(val);
    const num = parseFloat(val);
    if (!isNaN(num)) setAwg(Math.round(calcAwg(num)).toString());
    else setAwg("");
  };

  // State for kVA <-> Amps
  const [kva, setKva] = useState("100");
  const [amps, setAmps] = useState("144.3");
  const [volts, setVolts] = useState("400");
  const [phase, setPhase] = useState("3");

  const calcAmps = (k: number, v: number, p: string) => p === "3" ? (k * 1000) / (v * Math.sqrt(3)) : (k * 1000) / v;
  const calcKva = (a: number, v: number, p: string) => p === "3" ? (a * v * Math.sqrt(3)) / 1000 : (a * v) / 1000;

  const handleKvaChange = (val: string) => {
    setKva(val);
    const k = parseFloat(val); const v = parseFloat(volts);
    if (!isNaN(k) && !isNaN(v)) setAmps(calcAmps(k, v, phase).toFixed(1));
    else setAmps("");
  };
  const handleAmpsChange = (val: string) => {
    setAmps(val);
    const a = parseFloat(val); const v = parseFloat(volts);
    if (!isNaN(a) && !isNaN(v)) setKva(calcKva(a, v, phase).toFixed(1));
    else setKva("");
  };
  const handleVoltsChange = (val: string) => {
    setVolts(val);
    const k = parseFloat(kva); const v = parseFloat(val);
    if (!isNaN(k) && !isNaN(v)) setAmps(calcAmps(k, v, phase).toFixed(1));
  };
  const handlePhaseChange = (val: string) => {
    setPhase(val);
    const k = parseFloat(kva); const v = parseFloat(volts);
    if (!isNaN(k) && !isNaN(v)) setAmps(calcAmps(k, v, val).toFixed(1));
  };

  // State for Distance
  const [meter, setMeter] = useState("1");
  const [inchLen, setInchLen] = useState((1 * 39.3701).toFixed(2));

  const handleMeterChange = (val: string) => {
    setMeter(val);
    const num = parseFloat(val);
    if (!isNaN(num)) setInchLen((num * 39.3701).toFixed(2));
    else setInchLen("");
  };
  const handleInchLenChange = (val: string) => {
    setInchLen(val);
    const num = parseFloat(val);
    if (!isNaN(num)) setMeter((num / 39.3701).toFixed(2));
    else setMeter("");
  };



  return (
    <CalcShell
      label="Convert"
      title={tc.title}
      subtitle={tc.subtitle}
      concept={tc.concept}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        
        <CardRow title={tc.secMotor} icon={<SvgMotor />}>
          <FieldNumber label={tc.motorKw} value={kw} onChange={handleKwChange} />
          <FieldNumber label={tc.motorHp} value={hp} onChange={handleHpChange} />
        </CardRow>

        <CardRow title={tc.secPanel} icon={<SvgPanel />}>
          <FieldNumber label={tc.panelMm} value={mm} onChange={handleMmChange} />
          <FieldNumber label={tc.panelInch} value={inch} onChange={handleInchChange} />
        </CardRow>

        <CardRow title={tc.secCable} icon={<SvgCableArea />}>
          <FieldNumber label={tc.cableAwg} value={awg} onChange={handleAwgChange} />
          <FieldNumber label={tc.cableMm2} value={mm2} onChange={handleMm2Change} />
        </CardRow>

        <CardRow title={tc.secPower} icon={<SvgTransformer />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, gridColumn: "1 / -1" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FieldSelect label="Voltage (V)" value={volts} onChange={handleVoltsChange} options={[
                { value: "230", label: "230V" }, { value: "380", label: "380V" }, 
                { value: "400", label: "400V" }, { value: "690", label: "690V" }
              ]} />
              <FieldSelect label="Phase" value={phase} onChange={handlePhaseChange} options={[
                { value: "1", label: "1-Phase" }, { value: "3", label: "3-Phase" }
              ]} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FieldNumber label={tc.kva} value={kva} onChange={handleKvaChange} />
              <FieldNumber label={tc.amps} value={amps} onChange={handleAmpsChange} />
            </div>
          </div>
        </CardRow>

        <CardRow title={tc.secDist} icon={<SvgDistance />}>
          <FieldNumber label={tc.distMeter} value={meter} onChange={handleMeterChange} />
          <FieldNumber label={tc.distInch} value={inchLen} onChange={handleInchLenChange} />
        </CardRow>

      </div>
      <Footer />
    </CalcShell>
  );
}
