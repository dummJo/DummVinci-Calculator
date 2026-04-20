// app/breaker/page.tsx — MCCB / MCB Selection Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import FieldToggle from "@/components/calc/FieldToggle";
import FieldKwAmp from "@/components/calc/FieldKwAmp";
import ResultCard from "@/components/calc/ResultCard";
import { sizeBreaker, BreakerResult } from "@/lib/calc/breaker";
import type { Curve } from "@/lib/calc/breaker";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";

export default function BreakerPage() {
  const { t } = useLang();
  const tb = t.breaker;

  const [loadCurrent, setLoadCurrent] = useState("63");
  const [faultCurrent, setFaultCurrent] = useState("10");
  const [voltage, setVoltage] = useState("400");
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
    <CalcShell label={tb.label} title={tb.title} subtitle={tb.subtitle}>
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-label"><span>{tb.secCircuit}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldKwAmp
            label={tb.loadCurrent}
            voltage={parseFloat(voltage) || 400}
            defaultMode="a"
            defaultAmps={parseFloat(loadCurrent)}
            onChange={(amps) => setLoadCurrent(amps.toFixed(2))}
            required
            hint={tb.loadCurrentHint}
          />
          <FieldNumber
            label={tb.faultCurrent} unit="kA"
            value={faultCurrent} onChange={setFaultCurrent}
            min={0.5} max={100} step={0.5} required hint={tb.faultCurrentHint}
          />
          <FieldSelect
            label={tb.voltage} value={voltage} onChange={setVoltage}
            options={[
              { value: "230", label: "230 V" },
              { value: "400", label: "400 V" },
              { value: "415", label: "415 V" },
            ]}
          />
          <FieldSelect
            label={tb.tripCurve} value={curve} onChange={v => setCurve(v as Curve)}
            options={[
              { value: "B", label: tb.curveB },
              { value: "C", label: tb.curveC },
              { value: "D", label: tb.curveD },
            ]}
            hint={driveLoad ? tb.curveHintOverride : tb.curveHint}
          />
          <FieldSelect
            label={tb.poles} value={poles} onChange={v => setPoles(v as "1" | "2" | "3" | "4")}
            options={[
              { value: "1", label: "1-Pole" },
              { value: "2", label: "2-Pole" },
              { value: "3", label: "3-Pole" },
              { value: "4", label: "4-Pole" },
            ]}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldToggle
            label={tb.vsdToggle} checked={driveLoad} onChange={setDriveLoad} hint={tb.vsdToggleHint}
          />
        </div>

        <button className="btn-primary" onClick={handleCalc}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>
          {tb.btnCalc}
        </button>
      </div>

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ResultCard
            title={tb.resTitle}
            rows={[
              { label: tb.resType, value: result.type, accent: true },
              { label: tb.resFamily, value: result.family, accent: true },
              { label: tb.resPart, value: result.partCode, accent: true },
              { label: tb.resNomA, value: result.nominalA > 0 ? `${result.nominalA} A` : "—" },
              { label: tb.resIcu, value: result.icuKa > 0 ? `${result.icuKa} kA` : "—" },
              { label: tb.resCurve, value: result.curve },
              { label: tb.resCoord, value: result.coordination },
            ]}
            warnings={result.warnings}
          />
          {result.options.length > 0 && (
            <div className="vinci-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent)", padding: "4px 8px", border: "1px solid var(--accent)", borderRadius: 12 }}>IEC 60947-2 / 60898</span>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--fg)" }}>Supplier Quote Options</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.options.map((opt, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < result.options.length - 1 ? "1px solid var(--glass-border)" : "none", paddingBottom: i < result.options.length - 1 ? 8 : 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{opt.family} {opt.partCode}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{opt.type} / {opt.nominalA}A / Icu: {opt.icuKa}kA</span>
                    </div>
                  </div>
                ))}
              </div>

              {result.equivalents && result.equivalents.length > 0 && (
                <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px dashed var(--glass-border)", display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-soft)" }}>Cross-Brand Equivalents (Indent Protection):</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.equivalents.map((eq, i) => (
                      <span key={i} style={{ fontSize: 10, fontFamily: "var(--font-mono)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 8, color: "var(--fg)" }}>
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Footer />
    </CalcShell>
  );
}
