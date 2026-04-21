// app/busbar/page.tsx — Busbar Sizing Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import FieldToggle from "@/components/calc/FieldToggle";
import FieldKwAmp from "@/components/calc/FieldKwAmp";
import ResultCard from "@/components/calc/ResultCard";
import { sizeBusbar, BusbarResult } from "@/lib/calc/busbar";
import type { Material } from "@/lib/calc/busbar";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";

export default function BusbarPage() {
  const { t } = useLang();
  const tbu = t.busbar;

  const [current,      setCurrent]      = useState("400");
  const [voltage,      setVoltage]      = useState("400");
  const [material,     setMaterial]     = useState<Material>("Cu");
  const [ambient,      setAmbient]      = useState("35");
  const [enclosed,     setEnclosed]     = useState(true);
  const [forcedCooling,setForcedCooling]= useState(false);

  const [result, setResult] = useState<BusbarResult | null>(null);

  function handleCalc() {
    const r = sizeBusbar({
      current:      parseFloat(current)  || 0,
      material,
      ambientC:     parseFloat(ambient)  || 35,
      enclosed,
      forcedCooling,
    });
    setResult(r);
  }

  return (
    <CalcShell 
      label={tbu.label} 
      title={tbu.title} 
      subtitle={tbu.subtitle}
      concept={tbu.concept}
    >
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-label"><span>{tbu.secParams}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldKwAmp
            label={tbu.current}
            voltage={parseFloat(voltage) || 400}
            defaultMode="a"
            defaultAmps={parseFloat(current)}
            onChange={(amps) => setCurrent(amps.toFixed(2))}
            required
            hint={tbu.currentHint}
          />
          <FieldSelect
            label={tbu.voltage} value={voltage} onChange={setVoltage}
            options={[
              { value: "400", label: "400 V" },
              { value: "415", label: "415 V" },
              { value: "690", label: "690 V" },
            ]}
          />
          <FieldSelect
            label={tbu.material} value={material} onChange={v => setMaterial(v as Material)}
            options={[
              { value: "Cu", label: tbu.matCu },
              { value: "Al", label: tbu.matAl },
            ]}
            hint={tbu.matHint}
          />
          <FieldNumber
            label={tbu.ambient} unit="°C"
            value={ambient} onChange={setAmbient}
            min={20} max={55} step={1} hint={tbu.ambientHint}
          />
        </div>

        <div className="sec-label" style={{ marginTop: 4 }}><span>{tbu.secInstall}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldToggle label={tbu.enclosed}     checked={enclosed}      onChange={setEnclosed}      hint={tbu.enclosedHint} />
          <FieldToggle label={tbu.forced}       checked={forcedCooling} onChange={setForcedCooling} hint={tbu.forcedHint} />
        </div>

        <button className="btn-primary" onClick={handleCalc}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>
          {tbu.btnCalc}
        </button>
      </div>

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ResultCard
            title={tbu.resTitle}
            rows={[
              { label: tbu.resSection,  value: `${result.sectionMm2} mm²`, accent: true },
              { label: tbu.resDim,      value: result.dimensionMm, accent: true },
              { label: tbu.resDerating, value: `k = ${result.derating}` },
              { label: tbu.resPart,     value: result.part },
              { label: tbu.resNote,     value: result.note },
            ]}
          />

          {result.options && result.options.length > 1 && (
            <div className="vinci-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent)", padding: "4px 8px", border: "1px solid var(--accent)", borderRadius: 12 }}>DIN 43671 / IEC 61439-1</span>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--fg)" }}>Alternative Dimensional Options</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.options.map((opt, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < result.options.length - 1 ? "1px solid var(--glass-border)" : "none", paddingBottom: i < result.options.length - 1 ? 8 : 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? "var(--accent)" : "var(--fg)" }}>{opt.h} × {opt.t} mm <span style={{ opacity: 0.5, fontWeight: 400 }}>({opt.mm2} mm²)</span></span>
                      <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>Max Capacity: {opt.capacityA} A continuous</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Footer />
    </CalcShell>
  );
}
