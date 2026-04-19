// app/busbar/page.tsx — Busbar Sizing Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import FieldToggle from "@/components/calc/FieldToggle";
import ResultCard from "@/components/calc/ResultCard";
import { sizeBusbar, BusbarResult } from "@/lib/calc/busbar";
import type { Material } from "@/lib/calc/busbar";

export default function BusbarPage() {
  const [current, setCurrent] = useState("400");
  const [material, setMaterial] = useState<Material>("Cu");
  const [ambient, setAmbient] = useState("35");
  const [enclosed, setEnclosed] = useState(true);
  const [forcedCooling, setForcedCooling] = useState(false);

  const [result, setResult] = useState<BusbarResult | null>(null);

  function handleCalc() {
    const r = sizeBusbar({
      current: parseFloat(current) || 0,
      material,
      ambientC: parseFloat(ambient) || 35,
      enclosed,
      forcedCooling,
    });
    setResult(r);
  }

  return (
    <CalcShell
      label="Busbar Sizing"
      title="Busbar Sizing Calculator"
      subtitle="DIN 43671 · IEC 61439-1 Annex N · Rectangular flat bar, Cu / Al"
    >
      {/* ─── Inputs ──────────────────────────────────────────────────── */}
      <div
        className="vinci-card"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div className="sec-label">
          <span>Busbar Parameters</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <FieldNumber
            label="Continuous Current"
            unit="A"
            value={current}
            onChange={setCurrent}
            min={10}
            step={10}
            required
            hint="Rated continuous current at busbar (not short-circuit)"
          />
          <FieldSelect
            label="Conductor Material"
            value={material}
            onChange={(v) => setMaterial(v as Material)}
            options={[
              { value: "Cu", label: "Copper (Cu) — 1.6 A/mm²" },
              { value: "Al", label: "Aluminium (Al) — 1.0 A/mm²" },
            ]}
            hint="Cu standard for switchgear; Al for MV/HV busbars"
          />
          <FieldNumber
            label="Ambient Temperature"
            unit="°C"
            value={ambient}
            onChange={setAmbient}
            min={20}
            max={55}
            step={1}
            hint="Panel interior ambient (typically 35°C)"
          />
        </div>

        <div className="sec-label" style={{ marginTop: 4 }}>
          <span>Installation Conditions</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <FieldToggle
            label="Enclosed in Panel (default ON)"
            checked={enclosed}
            onChange={setEnclosed}
            hint="Enclosed = panel interior. Unenclosed = free air (+10% capacity)"
          />
          <FieldToggle
            label="Forced Cooling / Ventilation"
            checked={forcedCooling}
            onChange={setForcedCooling}
            hint="Forced air adds ~20% capacity margin"
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleCalc}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
        >
          Size Busbar
        </button>
      </div>

      {/* ─── Result ──────────────────────────────────────────────────── */}
      {result && (
        <ResultCard
          title="Busbar Selection"
          rows={[
            {
              label: "Cross-Section",
              value: `${result.sectionMm2} mm²`,
              accent: true,
            },
            {
              label: "Flat Bar Dimension",
              value: result.dimensionMm,
              accent: true,
            },
            {
              label: "Combined Derating Factor",
              value: `k = ${result.derating}`,
            },
            {
              label: "Part Description",
              value: result.part,
            },
            {
              label: "Installation Note",
              value: result.note,
            },
          ]}
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
