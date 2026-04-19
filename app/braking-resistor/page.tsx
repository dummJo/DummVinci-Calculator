// app/braking-resistor/page.tsx — Braking Resistor Sizing Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import ResultCard from "@/components/calc/ResultCard";
import { sizeBrakingResistor, BrResult } from "@/lib/calc/braking-resistor";

type LineVoltage = 400 | 480 | 690;
type EdPct = 15 | 25 | 40 | 60;

export default function BrakingResistorPage() {
  const [motorKw, setMotorKw] = useState("22");
  const [lineVoltage, setLineVoltage] = useState<string>("400");
  const [edPct, setEdPct] = useState<string>("25");
  const [peakFactor, setPeakFactor] = useState("1.5");

  const [result, setResult] = useState<BrResult | null>(null);

  function handleCalc() {
    const r = sizeBrakingResistor({
      motorKw: parseFloat(motorKw) || 0,
      lineVoltage: (parseInt(lineVoltage) as LineVoltage) ?? 400,
      edPct: (parseInt(edPct) as EdPct) ?? 25,
      cranePeakFactor: parseFloat(peakFactor) || 1.5,
    });
    setResult(r);
  }

  return (
    <CalcShell
      label="Braking Resistor"
      title="Braking Resistor Sizing"
      subtitle="STAHL CraneSystems Standard · ABB ACS880 R+/R- · Crane hoist & traverse"
    >
      {/* ─── Inputs ──────────────────────────────────────────────────── */}
      <div
        className="vinci-card"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div className="sec-label">
          <span>Drive & Motor Parameters</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <FieldNumber
            label="Motor Power"
            unit="kW"
            value={motorKw}
            onChange={setMotorKw}
            min={0.37}
            step={0.1}
            required
            hint="Nameplate kW of crane motor"
          />
          <FieldSelect
            label="Line Voltage"
            value={lineVoltage}
            onChange={setLineVoltage}
            options={[
              { value: "400", label: "400 V" },
              { value: "480", label: "480 V" },
              { value: "690", label: "690 V" },
            ]}
          />
        </div>

        <div className="sec-label" style={{ marginTop: 4 }}>
          <span>Duty & Peak Parameters</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <FieldSelect
            label="Duty Cycle ED%"
            value={edPct}
            onChange={setEdPct}
            options={[
              { value: "15", label: "15% ED — Light / Conveyor" },
              { value: "25", label: "25% ED — Typical Crane" },
              { value: "40", label: "40% ED — Heavy Lifting (Port)" },
              { value: "60", label: "60% ED — Continuous Regen" },
            ]}
            hint="STAHL / ABB duty class — determines continuous BR power"
          />
          <FieldNumber
            label="Peak Factor"
            value={peakFactor}
            onChange={setPeakFactor}
            min={1.0}
            max={3.0}
            step={0.1}
            hint="1.5× for crane hoist typical (STAHL standard)"
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleCalc}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
        >
          Size Braking Resistor
        </button>
      </div>

      {/* ─── Result ──────────────────────────────────────────────────── */}
      {result && (
        <ResultCard
          title="Braking Resistor Selection"
          rows={[
            {
              label: "DC Bus Voltage Udc",
              value: `${result.udcV} V`,
            },
            {
              label: "Chopper Threshold Uchop",
              value: `${result.uchopV} V`,
            },
            {
              label: "R Min",
              value: `${result.rMinOhm} Ω`,
            },
            {
              label: "R Max",
              value: `${result.rMaxOhm} Ω`,
            },
            {
              label: "R Target (geometric mean)",
              value: `${result.rTargetOhm} Ω`,
              accent: true,
            },
            {
              label: "Peak Braking Power",
              value: `${result.pPeakKw} kW`,
            },
            {
              label: "Continuous Braking Power",
              value: `${result.pContKw} kW`,
              accent: true,
            },
            {
              label: "STAHL Part",
              value: result.part,
              accent: true,
            },
            {
              label: "Wiring Note",
              value: result.wiring,
            },
          ]}
          warnings={result.warnings}
        />
      )}

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer
        style={{
          marginTop: 48,
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--muted-soft)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          paddingBottom: 16,
        }}
      >
        Engineered by dummJo · DummVinci Calculator · ABB Value Partner Standard
      </footer>
    </CalcShell>
  );
}
