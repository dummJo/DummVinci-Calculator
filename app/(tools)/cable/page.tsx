// app/cable/page.tsx — Cable Sizing Calculator
"use client";

import { useState, useMemo, useCallback } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import FieldKwAmp from "@/components/calc/FieldKwAmp";
import ResultCard from "@/components/calc/ResultCard";
import RecentDropdown from "@/components/calc/RecentDropdown";
import ShareButton from "@/components/share/ShareButton";
import StandardsRef from "@/components/calc/StandardsRef";
import AuditFooter from "@/components/calc/AuditFooter";
import { sizeCable, CableResult } from "@/lib/calc/cable";
import type { Phase, Insulation, Install } from "@/lib/calc/cable";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import Footnote from "@/components/calc/Footnote";
import { Info } from "lucide-react";
import { useToolHistory } from "@/lib/use-tool-history";

export default function CablePage() {
  const { t } = useLang();
  const tc = t.cable;

  const [current, setCurrent] = useState("63");
  const [length,  setLength]  = useState("50");
  const [voltage, setVoltage] = useState("400");
  const [phase,   setPhase]   = useState<Phase>("3ph");
  const [insulation, setInsulation] = useState<Insulation>("PVC");
  const [install, setInstall] = useState<Install>("tray");
  const [ambient, setAmbient] = useState("35");
  const [vdrop,   setVdrop]   = useState("3");
  const [pf,      setPf]      = useState("0.85");
  const [groupedCircuits, setGroupedCircuits] = useState("1");

  const [result, setResult] = useState<CableResult | null>(null);

  const voltageNum = useMemo(() => parseFloat(voltage) || 400, [voltage]);
  const pfNum = useMemo(() => parseFloat(pf) || 0.85, [pf]);

  // Form inputs as a flat record — used for snapshot save + share encoding
  // and (in reverse) restore from a recent snapshot or shared URL.
  const formInputs = useMemo(() => ({
    current, length, voltage, phase, insulation, install,
    ambient, vdrop, pf, groupedCircuits,
  }), [current, length, voltage, phase, insulation, install, ambient, vdrop, pf, groupedCircuits]);

  // Restore form state from a snapshot-like inputs record (typed loosely so
  // both share-link and Recent-dropdown payloads flow through the same path).
  const applyInputs = useCallback((inputs: Record<string, unknown>) => {
    if (typeof inputs.current    === "string") setCurrent(inputs.current);
    if (typeof inputs.length     === "string") setLength(inputs.length);
    if (typeof inputs.voltage    === "string") setVoltage(inputs.voltage);
    if (inputs.phase === "1ph" || inputs.phase === "3ph") setPhase(inputs.phase);
    if (inputs.insulation === "PVC" || inputs.insulation === "XLPE") setInsulation(inputs.insulation);
    if (["air","tray","conduit","buried"].includes(inputs.install as string)) setInstall(inputs.install as Install);
    if (typeof inputs.ambient    === "string") setAmbient(inputs.ambient);
    if (typeof inputs.vdrop      === "string") setVdrop(inputs.vdrop);
    if (typeof inputs.pf         === "string") setPf(inputs.pf);
    if (typeof inputs.groupedCircuits === "string") setGroupedCircuits(inputs.groupedCircuits);
  }, []);

  // On mount: share-link wins, otherwise smart defaults from histogram.
  // Hardcoded defaults stay as the useState initial values so SSR matches
  // the first client render — these setters only override afterwards.
  // Reading client-only storage in a useState initializer would cause a
  // hydration mismatch, so a one-shot effect is the right pattern here.
  const { saveSnapshot, restoreSnapshot } = useToolHistory("cable", formInputs, applyInputs);

  function handleCalc() {
    const r = sizeCable({
      current:         parseFloat(current)  || 0,
      lengthM:         parseFloat(length)   || 0,
      voltage:         voltageNum,
      phase, insulation, install,
      ambientC:        parseFloat(ambient)  || 35,
      maxVdropPct:     parseFloat(vdrop)    || 3,
      powerFactor:     pfNum,
      groupedCircuits: Math.max(1, parseInt(groupedCircuits) || 1),
    });
    setResult(r);
    saveSnapshot(
      r.phaseSize > 0
        ? `${current}A · ${length}m → ${r.phaseSize}mm² (${r.vdropPct}%)`
        : `${current}A · ${length}m — no match`,
    );
  }

  return (
    <CalcShell 
      label={tc.label} 
      title={tc.title} 
      subtitle={tc.subtitle}
      concept={tc.concept}
    >
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-label"><span>{tc.secLoad.toUpperCase()}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldKwAmp
            label={tc.current}
            voltage={voltageNum}
            phase={phase}
            pf={pfNum}
            defaultMode="a"
            defaultAmps={parseFloat(current)}
            onChange={(amps) => setCurrent(amps.toFixed(2))}
            required
            hint={tc.currentHint}
          />
          <FieldNumber
            label={tc.length} unit="m"
            value={length} onChange={setLength}
            min={1} step={1} required hint={tc.lengthHint}
          />
          <FieldSelect
            label={tc.voltage} value={voltage} onChange={setVoltage}
            options={[
              { value: "230", label: "230 V" },
              { value: "400", label: "400 V" },
              { value: "415", label: "415 V" },
            ]}
          />
          <FieldSelect
            label={tc.phase} value={phase} onChange={v => setPhase(v as Phase)}
            options={[
              { value: "3ph", label: tc.phase3 },
              { value: "1ph", label: tc.phase1 },
            ]}
          />
        </div>

        <div style={{ height: 1, background: "var(--glass-border)", marginBottom: 20 }} />
        <div className="sec-label"><span>{tc.secInstall.toUpperCase()}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldSelect
            label={tc.insulation} value={insulation} onChange={v => setInsulation(v as Insulation)}
            options={[
              { value: "PVC",  label: tc.insulPvc },
              { value: "XLPE", label: tc.insulXlpe },
            ]}
            hint={tc.insulXlpeHint}
          />
          <FieldSelect
            label={tc.installMethod} value={install} onChange={v => setInstall(v as Install)}
            options={[
              { value: "air",     label: tc.methodAir },
              { value: "tray",    label: tc.methodTray },
              { value: "conduit", label: tc.methodConduit },
              { value: "buried",  label: tc.methodBuried },
            ]}
            hint={tc.methodHint}
          />
          <FieldNumber
            label={tc.ambient} unit="°C"
            value={ambient} onChange={setAmbient}
            min={20} max={60} step={1} hint={tc.ambientHint}
          />
          <FieldNumber
            label={tc.vdrop} unit="%"
            value={vdrop} onChange={setVdrop}
            min={0.5} max={10} step={0.5} hint={tc.vdropHint}
          />
          <FieldNumber
            label={tc.groupedCircuits}
            value={groupedCircuits} onChange={setGroupedCircuits}
            min={1} max={20} step={1}
            hint={tc.groupedCircuitsHint}
          />
          <FieldNumber
            label={tc.pf}
            value={pf} onChange={setPf}
            min={0.5} max={1.0} step={0.01} hint={tc.pfHint}
          />
        </div>

        <div style={{ marginTop: 4, padding: 16, background: "rgba(var(--accent-rgb), 0.08)", border: "1px solid rgba(var(--accent-rgb), 0.2)", borderRadius: 16, display: "flex", gap: 12 }}>
          <div style={{ color: "var(--accent)", marginTop: 2 }}><Info size={18} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{tc.codePrefix}{(Reflect.get(tc.methodLegend, install) || tc.methodLegend.air).title}</span>
            <span style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.5, opacity: 0.9 }}>{(Reflect.get(tc.methodLegend, install) || tc.methodLegend.air).desc}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
          <button className="btn-primary" onClick={handleCalc}
            style={{ flex: "1 1 200px", justifyContent: "center" }}>
            {tc.btnCalc}
          </button>
          <RecentDropdown tool="cable" onRestore={restoreSnapshot} />
          <ShareButton tool="cable" inputs={formInputs} enabled={result !== null} />
        </div>
      </div>

      {result && (
        <ResultCard
          title={tc.resTitle}
          rows={[
            { label: tc.resPhase,     value: result.phaseSize > 0 ? `${result.phaseSize} mm²` : "—", accent: true },
            { label: tc.resGround,    value: result.groundSize > 0 ? `${result.groundSize} mm²` : "—", accent: true },
            { label: tc.resAmpacity,  value: result.ampacity > 0 ? `${result.ampacity} A` : "—" },
            { label: tc.resVdrop,     value: result.vdropPct > 0 ? `${result.vdropPct} % (${result.vdropV} V)` : "—" },
            { label: tc.resDerating,  value: result.deratingFactor > 0 ? `k = ${result.deratingFactor}` : "—" },
            { label: tc.resSuggestion, value: result.suggestion, accent: result.phaseSize > 0 },
          ]}
          warnings={result.warnings}
        />
      )}

      {result && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {tc.calculatedPer}
          </span>
          <StandardsRef code="iec60364-cable-ampacity" />
          <StandardsRef code="iec60364-vdrop" />
          {Math.max(1, parseInt(groupedCircuits) || 1) > 1 && <StandardsRef code="iec60364-grouping" />}
        </div>
      )}

      {result && (
        <AuditFooter inputs={formInputs} standards="IEC 60364-5-52:2020" />
      )}

      <Footnote />
      <Footer />
    </CalcShell>
  );
}
