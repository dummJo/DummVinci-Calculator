// app/breaker/page.tsx — MCCB / MCB Selection Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import FieldToggle from "@/components/calc/FieldToggle";
import ResultCard from "@/components/calc/ResultCard";
import { sizeBreaker, BreakerResult } from "@/lib/calc/breaker";
import type { Curve } from "@/lib/calc/breaker";

export default function BreakerPage() {
  const [loadCurrent, setLoadCurrent] = useState("63");
  const [faultCurrent, setFaultCurrent] = useState("10");
  const [curve, setCurve] = useState<Curve>("C");
  const [poles, setPoles] = useState<"1" | "2" | "3" | "4">("3");
  const [driveLoad, setDriveLoad] = useState(false);

  const [result, setResult] = useState<BreakerResult | null>(null);

  function handleCalc() {
    const r = sizeBreaker({
      loadCurrent: parseFloat(loadCurrent) || 0,
      faultCurrent: parseFloat(faultCurrent) || 0,
      curve: driveLoad ? "D" : curve,
      poles: parseInt(poles) as 1 | 2 | 3 | 4,
      driveLoad,
    });
    setResult(r);
  }

  return (
    <CalcShell
      label="Breaker Selection"
      title="MCCB / MCB Selector"
      subtitle="Siemens 5SL · 5SY · 3VA — IEC 60947-2 · IEC 60898 · Curve B/C/D"
    >
      {/* ─── Inputs ──────────────────────────────────────────────────── */}
      <div
        className="vinci-card"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div className="sec-label">
          <span>Circuit Parameters</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <FieldNumber
            label="Load Current"
            unit="A"
            value={loadCurrent}
            onChange={setLoadCurrent}
            min={0.5}
            step={0.5}
            required
            hint="Full-load operating current (FLA)"
          />
          <FieldNumber
            label="Prospective Fault Current"
            unit="kA"
            value={faultCurrent}
            onChange={setFaultCurrent}
            min={0.5}
            max={100}
            step={0.5}
            required
            hint="Available short-circuit current at MDB"
          />
          <FieldSelect
            label="Trip Curve"
            value={curve}
            onChange={(v) => setCurve(v as Curve)}
            options={[
              { value: "B", label: "Curve B — 3–5× In (resistive loads)" },
              { value: "C", label: "Curve C — 5–10× In (general purpose)" },
              { value: "D", label: "Curve D — 10–20× In (VSD / transformer)" },
            ]}
            hint={driveLoad ? "Overridden to D by VSD toggle" : "Select per IEC 60898-1"}
          />
          <FieldSelect
            label="Poles"
            value={poles}
            onChange={(v) => setPoles(v as "1" | "2" | "3" | "4")}
            options={[
              { value: "1", label: "1-Pole" },
              { value: "2", label: "2-Pole" },
              { value: "3", label: "3-Pole" },
              { value: "4", label: "4-Pole" },
            ]}
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
            label="VSD / Drive Load — Force Curve D"
            checked={driveLoad}
            onChange={setDriveLoad}
            hint="Drives have high inrush — curve D prevents nuisance trips"
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleCalc}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
        >
          Select Breaker
        </button>
      </div>

      {/* ─── Result ──────────────────────────────────────────────────── */}
      {result && (
        <ResultCard
          title="Breaker Selection"
          rows={[
            { label: "Type", value: result.type, accent: true },
            { label: "Family", value: result.family, accent: true },
            { label: "Part Code", value: result.partCode, accent: true },
            { label: "Nominal Rating", value: result.nominalA > 0 ? `${result.nominalA} A` : "—" },
            { label: "Breaking Capacity Icu", value: result.icuKa > 0 ? `${result.icuKa} kA` : "—" },
            { label: "Trip Curve", value: result.curve },
            { label: "Coordination Note", value: result.coordination },
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
