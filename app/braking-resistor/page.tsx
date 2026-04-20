// app/braking-resistor/page.tsx — Braking Resistor Sizing Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import FieldKwAmp from "@/components/calc/FieldKwAmp";
import ResultCard from "@/components/calc/ResultCard";
import { sizeBrakingResistor, BrResult } from "@/lib/calc/braking-resistor";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";

type LineVoltage = 400 | 480 | 690;
type EdPct       = 15 | 25 | 40 | 60;

export default function BrakingResistorPage() {
  const { t } = useLang();
  const tr = t.br;

  const [motorKw,     setMotorKw]     = useState("22");
  const [lineVoltage, setLineVoltage] = useState<string>("400");
  const [edPct,       setEdPct]       = useState<string>("25");
  const [peakFactor,  setPeakFactor]  = useState("1.5");

  const [result, setResult] = useState<BrResult | null>(null);

  function handleCalc() {
    const r = sizeBrakingResistor({
      motorKw:         parseFloat(motorKw)     || 0,
      lineVoltage:     (parseInt(lineVoltage)  as LineVoltage) ?? 400,
      edPct:           (parseInt(edPct)        as EdPct)       ?? 25,
      cranePeakFactor: parseFloat(peakFactor)  || 1.5,
    });
    setResult(r);
  }

  return (
    <CalcShell 
      label={tr.label} 
      title={tr.title} 
      subtitle={tr.subtitle}
      concept="Saat Crane menurunkan palet beban berton-ton, gravitasi memaksa motor bekerja berbalik arah menjadi mesin sekring pembangkit listrik ('generator'). Energi listrik berbahaya ini akan mengalir masuk dan meledakkan panel Drive jika tidak ditangani! Oleh karena itu energi tersebut dipaksa melewai jembatan Braking Resistor agar dihanguskan ke udara sebagai panas radiasi murni."
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
        </div>

        <button className="btn-primary" onClick={handleCalc}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>
          {tr.btnCalc}
        </button>
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
            { label: tr.resPart,   value: result.part, accent: true },
            { label: tr.resWiring, value: result.wiring },
          ]}
          warnings={result.warnings}
        />
      )}

      <Footer />
    </CalcShell>
  );
}
