// app/cable/page.tsx — Cable Sizing Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import ResultCard from "@/components/calc/ResultCard";
import { sizeCable, CableResult } from "@/lib/calc/cable";
import type { Phase, Insulation, Install } from "@/lib/calc/cable";

export default function CablePage() {
  const [current, setCurrent] = useState("63");
  const [length, setLength] = useState("50");
  const [voltage, setVoltage] = useState("400");
  const [phase, setPhase] = useState<Phase>("3ph");
  const [insulation, setInsulation] = useState<Insulation>("PVC");
  const [install, setInstall] = useState<Install>("tray");
  const [ambient, setAmbient] = useState("35");
  const [vdrop, setVdrop] = useState("3");
  const [pf, setPf] = useState("0.85");

  const [result, setResult] = useState<CableResult | null>(null);

  function handleCalc() {
    const r = sizeCable({
      current: parseFloat(current) || 0,
      lengthM: parseFloat(length) || 0,
      voltage: parseFloat(voltage) || 400,
      phase,
      insulation,
      install,
      ambientC: parseFloat(ambient) || 35,
      maxVdropPct: parseFloat(vdrop) || 3,
      powerFactor: parseFloat(pf) || 0.85,
    });
    setResult(r);
  }

  return (
    <CalcShell
      label="Cable Sizing"
      title="Cable Sizing Calculator"
      subtitle="IEC 60364-5-52 · PUIL 2011 · Cu conductor, PVC / XLPE, method C"
    >
      {/* ─── Inputs ──────────────────────────────────────────────────── */}
      <div
        className="vinci-card"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div className="sec-label">
          <span>Load Parameters</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <FieldNumber
            label="Design Current"
            unit="A"
            value={current}
            onChange={setCurrent}
            min={0.1}
            step={0.1}
            required
            hint="Full-load amps at motor terminal"
          />
          <FieldNumber
            label="Cable Length"
            unit="m"
            value={length}
            onChange={setLength}
            min={1}
            step={1}
            required
            hint="One-way run length (m)"
          />
          <FieldSelect
            label="System Voltage"
            value={voltage}
            onChange={setVoltage}
            options={[
              { value: "230", label: "230 V" },
              { value: "400", label: "400 V" },
              { value: "415", label: "415 V" },
            ]}
          />
          <FieldSelect
            label="Phase"
            value={phase}
            onChange={(v) => setPhase(v as Phase)}
            options={[
              { value: "3ph", label: "3-Phase" },
              { value: "1ph", label: "1-Phase" },
            ]}
          />
        </div>

        <div className="sec-label" style={{ marginTop: 4 }}>
          <span>Installation & Environment</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <FieldSelect
            label="Insulation"
            value={insulation}
            onChange={(v) => setInsulation(v as Insulation)}
            options={[
              { value: "PVC", label: "PVC (NYY / NYYHY)" },
              { value: "XLPE", label: "XLPE (N2XSY / FRC)" },
            ]}
            hint="XLPE handles higher ambient & short-circuit"
          />
          <FieldSelect
            label="Installation Method"
            value={install}
            onChange={(v) => setInstall(v as Install)}
            options={[
              { value: "air", label: "Clipped in Air" },
              { value: "tray", label: "Cable Tray" },
              { value: "conduit", label: "In Conduit" },
              { value: "buried", label: "Direct Buried" },
            ]}
            hint="IEC 60364 reference method — affects derating"
          />
          <FieldNumber
            label="Ambient Temperature"
            unit="°C"
            value={ambient}
            onChange={setAmbient}
            min={20}
            max={60}
            step={1}
            hint="Air temp at cable route (tropical default 35°C)"
          />
          <FieldNumber
            label="Max Voltage Drop"
            unit="%"
            value={vdrop}
            onChange={setVdrop}
            min={0.5}
            max={10}
            step={0.5}
            hint="IEC recommends ≤ 3% for motor circuits"
          />
          <FieldNumber
            label="Power Factor"
            value={pf}
            onChange={setPf}
            min={0.5}
            max={1.0}
            step={0.01}
            hint="Typical induction motor: 0.80–0.90"
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleCalc}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
        >
          Calculate Cable Size
        </button>
      </div>

      {/* ─── Result ──────────────────────────────────────────────────── */}
      {result && (
        <ResultCard
          title="Cable Selection"
          rows={[
            {
              label: "Phase Conductor",
              value: result.phaseSize > 0 ? `${result.phaseSize} mm²` : "—",
              accent: true,
            },
            {
              label: "Ground (PE) Conductor",
              value: result.groundSize > 0 ? `${result.groundSize} mm²` : "—",
              accent: true,
            },
            {
              label: "Derated Ampacity",
              value: result.ampacity > 0 ? `${result.ampacity} A` : "—",
            },
            {
              label: "Voltage Drop",
              value: result.vdropPct > 0 ? `${result.vdropPct} % (${result.vdropV} V)` : "—",
            },
            {
              label: "Combined Derating Factor",
              value: result.deratingFactor > 0 ? `k = ${result.deratingFactor}` : "—",
            },
            {
              label: "Suggested Cable",
              value: result.suggestion,
              accent: result.phaseSize > 0,
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
