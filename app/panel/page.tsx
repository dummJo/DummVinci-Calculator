// app/panel/page.tsx — Panel / Enclosure Sizing + Cooling Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import ResultCard from "@/components/calc/ResultCard";
import { sizePanel, PanelResult } from "@/lib/calc/panel";
import type { Location, IpClass, CoolingMode } from "@/lib/calc/panel";
import { useLang } from "@/lib/i18n";

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      padding: "12px 14px",
      border: "1px solid var(--hairline-soft)",
      borderRadius: "var(--r-md)",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)",
        color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase",
      }}>{label}</span>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: accent ? "var(--fs-md)" : "var(--fs-sm)",
        color: accent ? "var(--accent)" : "var(--fg)",
        fontWeight: accent ? 600 : 400, lineHeight: 1.4,
      }}>{value}</span>
    </div>
  );
}

export default function PanelPage() {
  const { t } = useLang();
  const tp = t.panel;

  const [heatW,       setHeatW]       = useState("800");
  const [ambient,     setAmbient]     = useState("35");
  const [location,    setLocation]    = useState<Location>("indoor");
  const [ip,          setIp]          = useState<IpClass>("IP54");
  const [coolingMode, setCoolingMode] = useState<CoolingMode>("fan");
  const [space,       setSpace]       = useState<"compact"|"comfortable">("comfortable");

  const [result, setResult] = useState<PanelResult | null>(null);

  function handleCalc() {
    const r = sizePanel({
      totalHeatW:     parseFloat(heatW)   || 0,
      ambientC:       parseFloat(ambient) || 35,
      location, ip, coolingMode,
      spacePreference: space,
    });
    setResult(r);
  }

  return (
    <CalcShell label={tp.label} title={tp.title} subtitle={tp.subtitle}>
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-label"><span>{tp.secHeat}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldNumber
            label={tp.heat} unit="W"
            value={heatW} onChange={setHeatW}
            min={10} step={10} required hint={tp.heatHint}
          />
          <FieldNumber
            label={tp.ambient} unit="°C"
            value={ambient} onChange={setAmbient}
            min={20} max={55} step={1} hint={tp.ambientHint}
          />
          <FieldSelect
            label={tp.location} value={location} onChange={v => setLocation(v as Location)}
            options={[
              { value: "indoor",  label: tp.locIndoor },
              { value: "outdoor", label: tp.locOutdoor },
            ]}
            hint={tp.locHint}
          />
          <FieldSelect
            label={tp.ip} value={ip} onChange={v => setIp(v as IpClass)}
            options={[
              { value: "IP54", label: tp.ip54 },
              { value: "IP55", label: tp.ip55 },
              { value: "IP66", label: tp.ip66 },
            ]}
            hint={tp.ipHint}
          />
        </div>

        <div className="sec-label" style={{ marginTop: 4 }}><span>{tp.secCooling}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldSelect
            label={tp.coolingMode} value={coolingMode} onChange={v => setCoolingMode(v as CoolingMode)}
            options={[
              { value: "natural", label: tp.coolNatural },
              { value: "fan",     label: tp.coolFan },
              { value: "ac",      label: tp.coolAc },
            ]}
            hint={tp.coolHint}
          />
          <FieldSelect
            label={tp.space} value={space} onChange={v => setSpace(v as "compact"|"comfortable")}
            options={[
              { value: "comfortable", label: tp.spaceComfort },
              { value: "compact",     label: tp.spaceCompact },
            ]}
            hint={tp.spaceHint}
          />
        </div>

        <button className="btn-primary" onClick={handleCalc}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>
          {tp.btnCalc}
        </button>
      </div>

      {result && (
        <>
          <ResultCard
            title={tp.resPanelTitle}
            rows={[
              { label: tp.resPart,    value: result.part,         accent: true },
              { label: tp.resDim,     value: result.dimMm,        accent: true },
              { label: tp.resSurface, value: `${result.surfaceM2} m²` },
              { label: tp.resDiss,    value: `${result.naturalDissW} W` },
              { label: tp.resCooling, value: result.cooling.toUpperCase() },
            ]}
            warnings={result.warnings}
          />

          {result.fan && (
            <div className="vinci-card result-card-enter" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="sec-label"><span>{tp.secFan}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <InfoRow label={tp.fanAirflow} value={`${result.fan.airflowM3h} m³/h`} accent />
                <InfoRow label={tp.fanRittal}  value={result.fan.rittalCode} accent />
                <InfoRow label={tp.fanXltc}    value={result.fan.xltcCode}   accent />
                <InfoRow label={tp.fanPosition}value={result.fan.position} />
              </div>

              <div className="sec-label" style={{ marginTop: 8 }}><span>{tp.secIntake}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <InfoRow label={tp.filterArea}  value={`${result.fan.intake.filterAreaCm2} cm²`} accent />
                <InfoRow label={tp.filterRittal}value={result.fan.intake.rittalCode} accent />
                <InfoRow label={tp.filterXltc}  value={result.fan.intake.xltcCode}   accent />
                <InfoRow label={tp.filterNote}  value={result.fan.intake.note} />
              </div>

              <div className="sec-label" style={{ marginTop: 8 }}><span>{tp.secExhaust}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <InfoRow label={tp.filterArea}  value={`${result.fan.exhaust.filterAreaCm2} cm²`} accent />
                <InfoRow label={tp.filterRittal}value={result.fan.exhaust.rittalCode} accent />
                <InfoRow label={tp.filterXltc}  value={result.fan.exhaust.xltcCode}   accent />
                <InfoRow label={tp.filterNote}  value={result.fan.exhaust.note} />
              </div>
            </div>
          )}

          {result.ac && (
            <div className="vinci-card result-card-enter" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="sec-label"><span>{tp.secAc}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <InfoRow label={tp.acHeatLoad} value={`${result.ac.heatLoadW} W (${result.ac.heatLoadBtu} BTU/h)`} />
                <InfoRow label={tp.acCapacity} value={`${result.ac.nominalW} W`} accent />
                <InfoRow label={tp.acBtu}      value={`${result.ac.nominalBtu} BTU/h`} accent />
                <InfoRow label={tp.acRittal}   value={result.ac.rittalCode} accent />
                <InfoRow label={tp.acXltc}     value={result.ac.xltcCode}   accent />
                <InfoRow label={tp.acMode}     value={result.ac.mode} />
                <InfoRow label={tp.acNote}     value={result.ac.note} />
              </div>
            </div>
          )}
        </>
      )}

      <footer style={{
        marginTop: 48, textAlign: "center",
        fontFamily: "var(--font-mono)", fontSize: 9,
        color: "var(--muted-soft)", letterSpacing: "0.16em",
        textTransform: "uppercase", paddingBottom: 16,
      }}>
        {t.common.engineeredBy}
      </footer>
    </CalcShell>
  );
}
