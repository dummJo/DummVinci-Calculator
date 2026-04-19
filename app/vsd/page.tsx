// app/vsd/page.tsx — VSD + Airflow Sizing Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import FieldToggle from "@/components/calc/FieldToggle";
import FieldKwAmp from "@/components/calc/FieldKwAmp";
import ResultCard from "@/components/calc/ResultCard";
import { sizeVsd, VsdResult } from "@/lib/calc/vsd";
import type { DriveApp, Voltage } from "@/lib/calc/vsd";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";

export default function VsdPage() {
  const { t } = useLang();
  const tv = t.vsd;

  const [motorKw, setMotorKw] = useState("22");
  const [voltage, setVoltage] = useState<string>("400");
  const [app,     setApp]     = useState<DriveApp>("pump");
  const [heavy,   setHeavy]   = useState(false);
  const [deltaT,  setDeltaT]  = useState("12");
  const [ambient, setAmbient] = useState("35");
  const [variant, setVariant] = useState<"01" | "02" | "04" | "07" | "31">("01");

  const [result, setResult] = useState<VsdResult | null>(null);

  function handleCalc() {
    const r = sizeVsd({
      motorKw:      parseFloat(motorKw) || 0,
      voltage:      (parseInt(voltage) as Voltage) ?? 400,
      app,
      dutyHeavy:    heavy,
      panelDeltaT:  parseFloat(deltaT)  || 12,
      ambientC:     parseFloat(ambient) || 40,
      variant:      variant,
    });
    setResult(r);
  }

  const isCrane = app === "crane" || heavy;

  return (
    <CalcShell label={tv.label} title={tv.title} subtitle={tv.subtitle}>
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-label"><span>{tv.secMotor}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldKwAmp
            label={tv.motorPower}
            voltage={parseFloat(voltage) || 400}
            defaultMode="kw"
            defaultKw={parseFloat(motorKw)}
            onChange={(_, kw) => setMotorKw(kw.toFixed(2))}
            required
            hint={tv.motorPowerHint}
          />
          <FieldSelect
            label={tv.lineVoltage} value={voltage} onChange={setVoltage}
            options={[
              { value: "400", label: "400 V (IEC standard)" },
              { value: "480", label: "480 V (NEMA)" },
              { value: "690", label: "690 V (HV panel)" },
            ]}
          />
          <FieldSelect
            label={tv.app} value={app} onChange={v => setApp(v as DriveApp)}
            options={[
              { value: "pump",       label: tv.appPump },
              { value: "fan",        label: tv.appFan },
              { value: "crane",      label: tv.appCrane },
              { value: "conveyor",   label: tv.appConveyor },
              { value: "compressor", label: tv.appCompressor },
            ]}
            hint={isCrane ? tv.appHintCrane : tv.appHintAcq}
          />
          <FieldNumber
            label={tv.panelDt} unit="K"
            value={deltaT} onChange={setDeltaT}
            min={5} max={25} step={1} hint={tv.panelDtHint}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldToggle
            label={tv.heavy} checked={heavy} onChange={setHeavy} hint={tv.heavyHint}
          />
          <FieldNumber
            label={tv.ambient} unit="°C"
            value={ambient} onChange={setAmbient}
            min={10} max={55} step={1} hint={tv.ambientHint}
          />
          <FieldSelect
            label={tv.construction} value={variant} onChange={v => setVariant(v as any)}
            options={[
              { value: "01", label: tv.constWall },
              { value: "02", label: tv.constCompact },
              { value: "04", label: tv.constModule },
              { value: "07", label: tv.constCabinet },
              { value: "31", label: tv.constUlh },
            ]}
          />
        </div>

        {isCrane && (
          <div style={{
            padding: "10px 14px",
            background: "rgba(201,168,76,0.07)",
            border: "1px solid var(--gold-deep)",
            borderRadius: "var(--r-md)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-xs)",
            color: "var(--parchment-dim)",
            lineHeight: 1.65,
            letterSpacing: "0.02em",
          }}>
            {tv.craneNote}
          </div>
        )}

        <button className="btn-primary" onClick={handleCalc}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>
          {tv.btnCalc}
        </button>
      </div>

      {result && (
        <ResultCard
          title={tv.resTitle}
          rows={[
            { label: tv.resFamily,       value: result.family, accent: true },
            { label: tv.resPart,         value: result.partCode, accent: true },
            { label: tv.resFrame,        value: result.frame },
            { label: tv.resNomA,         value: result.nominalA > 0 ? `${result.nominalA} A` : "—" },
            { label: tv.resRatedKw,      value: result.ratedKw > 0 ? `${result.ratedKw} kW` : "—" },
            { label: tv.resPloss,        value: result.plossW > 0 ? `${result.plossW} W` : "—" },
            { label: tv.resHsAirflow,    value: result.heatsinkAirflow > 0 ? `${result.heatsinkAirflow} m³/h` : "—" },
            { label: tv.resPanelAirflow, value: result.panelAirflowRequired > 0 ? `${result.panelAirflowRequired} m³/h` : "—", accent: result.panelAirflowRequired > 0 },
          ]}
          recommendation={result.recommendation}
          warnings={result.warnings}
          features={result.keyFeatures}
          featuresLabel={tv.resFeatures}
        />
      )}

      <Footer />
    </CalcShell>
  );
}
