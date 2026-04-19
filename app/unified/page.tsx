"use client";
import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import FieldToggle from "@/components/calc/FieldToggle";
import ResultCard from "@/components/calc/ResultCard";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import { sizeMotorStarter, UnifiedResult, estimateAmps } from "@/lib/calc/unified";
import type { Voltage, DriveApp } from "@/lib/calc/vsd";
import type { Insulation, Install } from "@/lib/calc/cable";

export default function UnifiedPage() {
  const { t } = useLang();
  const tu = t.unified;

  // State
  const [motorKw, setMotorKw] = useState("7.5");
  const [motorAmps, setMotorAmps] = useState("");
  const [voltage, setVoltage] = useState<Voltage>(400);
  const [app, setApp] = useState<DriveApp>("pump");
  const [heavy, setHeavy] = useState(false);
  const [cableLen, setCableLen] = useState("30");
  const [insulation, setInsulation] = useState<Insulation>("PVC");
  const [install, setInstall] = useState<Install>("tray");
  const [ambient, setAmbient] = useState("35");
  const [fault, setFault] = useState("10");
  const [result, setResult] = useState<UnifiedResult | null>(null);

  const calculate = () => {
    const res = sizeMotorStarter({
      motorKw: parseFloat(motorKw) || 0,
      motorAmps: motorAmps ? parseFloat(motorAmps) : undefined,
      voltage,
      app,
      dutyHeavy: heavy,
      cableLengthM: parseFloat(cableLen) || 0,
      cableInsulation: insulation,
      cableInstall: install,
      ambientC: parseFloat(ambient) || 0,
      faultCurrentKa: parseFloat(fault) || 0,
      panelDeltaT: 10,
    });
    setResult(res);
  };

  const estA = estimateAmps(parseFloat(motorKw) || 0, voltage);

  return (
    <CalcShell title={tu.title} subtitle={tu.subtitle}>
      <div className="calc-grid">
        <div className="calc-col-input">
          <div className="sec-label"><span>{tu.secMotor}</span></div>
          <FieldNumber
            label={tu.motorKw} value={motorKw} onChange={setMotorKw}
            hint={`Estimated FLA: ${estA.toFixed(1)} A`}
          />
          <FieldNumber
            label={tu.motorAmps} value={motorAmps} onChange={setMotorAmps}
            hint="Leave empty to use estimated FLA"
          />
          <FieldSelect
            label={tu.voltage} value={voltage.toString()} onChange={v => setVoltage(parseInt(v) as Voltage)}
            options={[
              { value: "380", label: "380 V" },
              { value: "400", label: "400 V" },
              { value: "415", label: "415 V" },
              { value: "480", label: "480 V" },
            ]}
          />
          <FieldSelect
            label={tu.app} value={app} onChange={v => setApp(v as DriveApp)}
            options={[
              { value: "pump", label: t.vsd.appPump },
              { value: "fan", label: t.vsd.appFan },
              { value: "crane", label: t.vsd.appCrane },
              { value: "conveyor", label: t.vsd.appConveyor },
            ]}
          />
          <FieldToggle
            label={tu.heavy} active={heavy} onClick={() => setHeavy(!heavy)}
            hint={t.vsd.heavyHint}
          />

          <div className="sec-label" style={{ marginTop: 24 }}><span>{t.cable.secInstall}</span></div>
          <FieldNumber label={tu.cableLen} value={cableLen} onChange={setCableLen} />
          <FieldSelect
            label={t.cable.insulation} value={insulation} onChange={v => setInsulation(v as Insulation)}
            options={[
              { value: "PVC", label: t.cable.insulPvc },
              { value: "XLPE", label: t.cable.insulXlpe },
            ]}
          />
          <FieldSelect
            label={t.cable.installMethod} value={install} onChange={v => setInstall(v as Install)}
            options={[
              { value: "air", label: t.cable.methodAir },
              { value: "tray", label: t.cable.methodTray },
              { value: "conduit", label: t.cable.methodConduit },
              { value: "buried", label: t.cable.methodBuried },
            ]}
          />
          <FieldNumber label={tu.ambient} value={ambient} onChange={setAmbient} />

          <div className="sec-label" style={{ marginTop: 24 }}><span>{t.breaker.secCircuit}</span></div>
          <FieldNumber label={tu.fault} value={fault} onChange={setFault} />

          <button className="btn-primary" style={{ marginTop: 32 }} onClick={calculate}>
            {tu.btnCalc}
          </button>
        </div>

        <div className="calc-col-result">
          {result ? (
            <>
              <ResultCard
                title={tu.resTitle}
                rows={[
                  { label: tu.resAmps, value: `${result.estimatedMotorAmps} A`, accent: true },
                ]}
              />

              <div style={{ marginTop: 24 }}>
                <ResultCard
                  title={tu.resVsd}
                  rows={[
                    { label: t.vsd.resPart, value: result.vsd.partCode, accent: true },
                    { label: t.vsd.resFrame, value: result.vsd.frame },
                    { label: t.vsd.resRatedKw, value: `${result.vsd.ratedKw} kW` },
                  ]}
                  warnings={result.vsd.warnings}
                />
              </div>

              <div style={{ marginTop: 24 }}>
                <ResultCard
                  title={tu.resCable}
                  rows={[
                    { label: t.cable.resSuggestion, value: result.cable.suggestion, accent: true },
                    { label: t.cable.resPhase, value: `${result.cable.phaseSize} mm²` },
                    { label: t.cable.resGround, value: `${result.cable.groundSize} mm²` },
                    { label: t.cable.resVdrop, value: `${result.cable.vdropPct}%` },
                  ]}
                  warnings={result.cable.warnings}
                />
              </div>

              <div style={{ marginTop: 24 }}>
                <ResultCard
                  title={tu.resBreaker}
                  rows={[
                    { label: t.breaker.resPart, value: result.breaker.partCode, accent: true },
                    { label: t.breaker.resNomA, value: `${result.breaker.nominalA} A` },
                    { label: t.breaker.resIcu, value: `${result.breaker.icuKa} kA` },
                  ]}
                  warnings={result.breaker.warnings}
                />
              </div>
            </>
          ) : (
            <div className="result-placeholder">
              {t.common.resultLabel}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </CalcShell>
  );
}
