// app/vsd/page.tsx — VSD + Airflow Sizing Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import FieldToggle from "@/components/calc/FieldToggle";
import ResultCard from "@/components/calc/ResultCard";
import { sizeVsd, VsdResult } from "@/lib/calc/vsd";
import type { DriveApp, Voltage } from "@/lib/calc/vsd";

export default function VsdPage() {
  const [motorKw, setMotorKw] = useState("22");
  const [voltage, setVoltage] = useState<string>("400");
  const [app, setApp] = useState<DriveApp>("pump");
  const [heavy, setHeavy] = useState(false);
  const [deltaT, setDeltaT] = useState("12");

  const [result, setResult] = useState<VsdResult | null>(null);

  function handleCalc() {
    const r = sizeVsd({
      motorKw: parseFloat(motorKw) || 0,
      voltage: (parseInt(voltage) as Voltage) ?? 400,
      app,
      dutyHeavy: heavy,
      panelDeltaT: parseFloat(deltaT) || 12,
    });
    setResult(r);
  }

  // Crane app auto-forces ACS880 — give user a visual hint
  const isCrane = app === "crane" || heavy;

  return (
    <CalcShell
      label="VSD Sizing"
      title="VSD + Airflow Calculator"
      subtitle="ABB ACQ580 (HVAC-R) · ACS880 (Industrial / Crane) · Panel thermal sizing"
    >
      {/* ─── Inputs ──────────────────────────────────────────────────── */}
      <div
        className="vinci-card"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div className="sec-label">
          <span>Motor & Application</span>
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
            hint="Nameplate kW of driven motor"
          />
          <FieldSelect
            label="Line Voltage"
            value={voltage}
            onChange={setVoltage}
            options={[
              { value: "400", label: "400 V (IEC standard)" },
              { value: "480", label: "480 V (NEMA)" },
              { value: "690", label: "690 V (HV panel)" },
            ]}
          />
          <FieldSelect
            label="Application"
            value={app}
            onChange={(v) => setApp(v as DriveApp)}
            options={[
              { value: "pump", label: "Pump" },
              { value: "fan", label: "Fan / Blower" },
              { value: "crane", label: "Crane / Hoist" },
              { value: "conveyor", label: "Conveyor" },
              { value: "compressor", label: "Compressor" },
            ]}
            hint={isCrane ? "ACS880 selected — crane/heavy duty" : "ACQ580 for HVAC-R apps"}
          />
          <FieldNumber
            label="Panel ΔT"
            unit="K"
            value={deltaT}
            onChange={setDeltaT}
            min={5}
            max={25}
            step={1}
            hint="Allowed temp rise inside panel (typically 10–15 K)"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <FieldToggle
            label="Heavy Duty / High Inertia — Crane"
            checked={heavy}
            onChange={setHeavy}
            hint="Forces ACS880, 20% oversizing margin, braking resistor note"
          />
        </div>

        {isCrane && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(201,168,76,0.07)",
              border: "1px solid var(--gold-deep)",
              borderRadius: "var(--r-md)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--fs-xs)",
              color: "var(--parchment-dim)",
              lineHeight: 1.65,
              letterSpacing: "0.02em",
            }}
          >
            ◈ Crane / heavy-duty mode: ACS880 mandatory. Size braking resistor via the
            dedicated Braking Resistor calculator.
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleCalc}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
        >
          Size Drive
        </button>
      </div>

      {/* ─── Result ──────────────────────────────────────────────────── */}
      {result && (
        <ResultCard
          title="Drive Selection"
          rows={[
            { label: "Drive Family", value: result.family, accent: true },
            { label: "Part Code", value: result.partCode, accent: true },
            { label: "Frame", value: result.frame },
            { label: "Nominal Current", value: result.nominalA > 0 ? `${result.nominalA} A` : "—" },
            { label: "Rated Power", value: result.ratedKw > 0 ? `${result.ratedKw} kW` : "—" },
            {
              label: "Heat Dissipation",
              value: result.plossW > 0 ? `${result.plossW} W` : "—",
            },
            {
              label: "Heatsink Airflow (drive)",
              value: result.heatsinkAirflow > 0 ? `${result.heatsinkAirflow} m³/h` : "—",
            },
            {
              label: "Required Panel Airflow",
              value: result.panelAirflowRequired > 0 ? `${result.panelAirflowRequired} m³/h` : "—",
              accent: result.panelAirflowRequired > 0,
            },
          ]}
          recommendation={result.recommendation}
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
