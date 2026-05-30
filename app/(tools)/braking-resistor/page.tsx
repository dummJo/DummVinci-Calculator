// app/braking-resistor/page.tsx — Braking Resistor Sizing Calculator
"use client";

import { useState, useMemo, useCallback } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import FieldKwAmp from "@/components/calc/FieldKwAmp";
import ResultCard from "@/components/calc/ResultCard";
import RecentDropdown from "@/components/calc/RecentDropdown";
import ShareButton from "@/components/share/ShareButton";
import { sizeBrakingResistor, BrResult } from "@/lib/calc/braking-resistor";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import Footnote from "@/components/calc/Footnote";
import { useToolHistory } from "@/lib/use-tool-history";

type LineVoltage = 400 | 480 | 690;
type EdPct       = 15 | 25 | 40 | 60;

export default function BrakingResistorPage() {
  const { t } = useLang();
  const tr = t.br;

  const [motorKw,     setMotorKw]     = useState("22");
  const [lineVoltage, setLineVoltage] = useState<string>("400");
  const [edPct,       setEdPct]       = useState<string>("25");
  const [peakFactor,  setPeakFactor]  = useState("1.5");
  const [cycleTime,   setCycleTime]   = useState("");
  const [brakeTime,   setBrakeTime]   = useState("");

  const [result, setResult] = useState<BrResult | null>(null);

  const formInputs = useMemo(() => ({
    motorKw, lineVoltage, edPct, peakFactor, cycleTime, brakeTime,
  }), [motorKw, lineVoltage, edPct, peakFactor, cycleTime, brakeTime]);

  const applyInputs = useCallback((i: Record<string, unknown>) => {
    if (typeof i.motorKw     === "string") setMotorKw(i.motorKw);
    if (typeof i.lineVoltage === "string") setLineVoltage(i.lineVoltage);
    if (typeof i.edPct       === "string") setEdPct(i.edPct);
    if (typeof i.peakFactor  === "string") setPeakFactor(i.peakFactor);
    if (typeof i.cycleTime   === "string") setCycleTime(i.cycleTime);
    if (typeof i.brakeTime   === "string") setBrakeTime(i.brakeTime);
  }, []);

  const { saveSnapshot, restoreSnapshot } = useToolHistory("br", formInputs, applyInputs);

  function handleCalc() {
    const cycleS = parseFloat(cycleTime);
    const brakeS = parseFloat(brakeTime);
    const r = sizeBrakingResistor({
      motorKw:         parseFloat(motorKw)     || 0,
      lineVoltage:     ((parseInt(lineVoltage) || 400) as LineVoltage),
      edPct:           ((parseInt(edPct)       || 25)  as EdPct),
      cranePeakFactor: parseFloat(peakFactor)  || 1.5,
      cycleTimeS:      cycleS > 0 ? cycleS : undefined,
      brakingTimeS:    brakeS > 0 ? brakeS : undefined,
    });
    setResult(r);
    saveSnapshot(`${motorKw}kW @ ${edPct}% ED → ${r.pContKw}kW cont, ${r.rTargetOhm}Ω`);
  }

  return (
    <CalcShell 
      label={tr.label} 
      title={tr.title} 
      subtitle={tr.subtitle}
      concept={tr.concept}
    >
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-label"><span>{tr.secDrive}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldKwAmp
            label={tr.motorPower}
            voltage={parseFloat(lineVoltage) || 400}
            defaultMode="kw"
            defaultKw={parseFloat(motorKw)}
            onChange={(_, kw) => setMotorKw(kw.toFixed(2))}
            required
            hint={tr.motorPowerHint}
          />
          <FieldSelect
            label={tr.lineVoltage} value={lineVoltage} onChange={setLineVoltage}
            options={[
              { value: "400", label: "400 V" },
              { value: "480", label: "480 V" },
              { value: "690", label: "690 V" },
            ]}
          />
        </div>

        <div className="sec-label" style={{ marginTop: 4 }}><span>{tr.secDuty}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldSelect
            label={tr.dutyCycle} value={edPct} onChange={setEdPct}
            options={[
              { value: "15", label: tr.dutyLight },
              { value: "25", label: tr.dutyTypical },
              { value: "40", label: tr.dutyHeavy },
              { value: "60", label: tr.dutyCont },
            ]}
            hint={tr.dutyHint}
          />
          <FieldNumber
            label={tr.peakFactor}
            value={peakFactor} onChange={setPeakFactor}
            min={1.0} max={3.0} step={0.1} hint={tr.peakHint}
          />
          <FieldNumber
            label="Cycle time" unit="s"
            value={cycleTime} onChange={setCycleTime}
            min={0} step={10}
            hint="Optional — full hoist cycle (s). Leave blank to use ED class only."
          />
          <FieldNumber
            label="Braking time" unit="s"
            value={brakeTime} onChange={setBrakeTime}
            min={0} step={1}
            hint="Optional — braking active per cycle (s). Pairs with cycle time."
          />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
          <button className="btn-primary" onClick={handleCalc}
            style={{ flex: "1 1 200px", justifyContent: "center" }}>
            {tr.btnCalc}
          </button>
          <RecentDropdown tool="br" onRestore={restoreSnapshot} />
          <ShareButton tool="br" inputs={formInputs} enabled={result !== null} />
        </div>
      </div>

      {result && (
        <ResultCard
          title={tr.resTitle}
          rows={[
            { label: tr.resUdc,    value: `${result.udcV} V` },
            { label: tr.resUchop,  value: `${result.uchopV} V` },
            { label: tr.resRmin,   value: `${result.rMinOhm} Ω` },
            { label: tr.resRmax,   value: `${result.rMaxOhm} Ω` },
            { label: tr.resRtarget,value: `${result.rTargetOhm} Ω`, accent: true },
            { label: tr.resPpeak,  value: `${result.pPeakKw} kW` },
            { label: tr.resPcont,  value: `${result.pContKw} kW`, accent: true },
            ...(result.edActualPct !== undefined ? [{ label: "Actual duty (ED)", value: `${result.edActualPct}%` }] : []),
            { label: tr.resPart,   value: result.part, accent: true },
            { label: tr.resWiring, value: result.wiring },
          ]}
          warnings={result.warnings}
        />
      )}

      <Footnote />
      <Footer />
    </CalcShell>
  );
}
