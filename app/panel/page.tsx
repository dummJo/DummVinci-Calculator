// app/panel/page.tsx — Panel / Enclosure Sizing + Cooling Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import ResultCard from "@/components/calc/ResultCard";
import { sizePanel, PanelResult } from "@/lib/calc/panel";
import type { Location, IpClass, CoolingMode } from "@/lib/calc/panel";
import { estimatePanelLayout, LayoutResult } from "@/lib/calc/panel-layout";
import type { VsdFrame, BusbarTier, LayoutInput } from "@/lib/calc/panel-layout";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import { Layers, Ruler } from "lucide-react";

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

  // ── Panel Layout Estimator state ──────────────────────────────────────────
  const [vsdFrame, setVsdFrame] = useState<VsdFrame>("R3");
  const [vsdQty,   setVsdQty]   = useState("1");
  const [mcb3p,    setMcb3p]    = useState("12");
  const [mccbCnt,  setMccbCnt]  = useState("2");
  const [mccbFrm,  setMccbFrm]  = useState<"S"|"M"|"L">("S");
  const [bbTier,   setBbTier]   = useState<BusbarTier>("single");
  const [layoutSpace, setLayoutSpace] = useState<"compact"|"comfortable">("comfortable");
  const [layoutResult, setLayoutResult] = useState<LayoutResult | null>(null);

  function handleLayout() {
    const r = estimatePanelLayout({
      vsdFrame, vsdQty: parseInt(vsdQty) || 0,
      mcbCount3p: parseInt(mcb3p) || 0,
      mccbCount: parseInt(mccbCnt) || 0,
      mccbFrame: mccbFrm,
      busbarTier: bbTier,
      spacePreference: layoutSpace,
    } as LayoutInput);
    setLayoutResult(r);
  }

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
    <CalcShell 
      label={tp.label} 
      title={tp.title} 
      subtitle={tp.subtitle}
      concept={tp.concept}
    >
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

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL LAYOUT ESTIMATOR — IEC 61439-1 Annex N
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="vinci-card" style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Ruler size={18} style={{ color: "var(--accent)" }} />
          <div>
            <div className="sec-label" style={{ marginBottom: 0 }}><span>{t.panelLayout.title}</span></div>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0", fontFamily: "var(--font-body)" }}>
              {t.panelLayout.subtitle}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <FieldSelect label={t.panelLayout.vsdFrame} value={vsdFrame} onChange={v => setVsdFrame(v as VsdFrame)}
            options={[
              { value: "none", label: "No VSD" },
              { value: "R0", label: "R0 — ≤ 0.75 kW (68×245 mm)" },
              { value: "R1", label: "R1 — 1.1–2.2 kW (100×260 mm)" },
              { value: "R2", label: "R2 — 3–5.5 kW (125×340 mm)" },
              { value: "R3", label: "R3 — 7.5–15 kW (175×409 mm)" },
              { value: "R4", label: "R4 — 18.5–30 kW (210×502 mm)" },
              { value: "R5", label: "R5 — 37–75 kW (260×660 mm)" },
              { value: "R6", label: "R6 — 90–132 kW (384×702 mm)" },
              { value: "R9", label: "R9 — 160–250 kW (cabinet-mount)" },
            ]}
            hint="ABB ACS880/ACQ580 frame sizes from hardware manual" />
          <FieldNumber label={t.panelLayout.vsdQty} value={vsdQty} onChange={setVsdQty} min={0} max={20} />
          <FieldNumber label={t.panelLayout.mcb3p} value={mcb3p} onChange={setMcb3p} min={0}
            hint={t.panelLayout.mcb3pHint} />
          <FieldNumber label={t.panelLayout.mccbCount} value={mccbCnt} onChange={setMccbCnt} min={0} />
          <FieldSelect label={t.panelLayout.mccbFrame} value={mccbFrm} onChange={v => setMccbFrm(v as "S"|"M"|"L")}
            options={[
              { value: "S", label: "S — up to 250A (3VA1/5SL)" },
              { value: "M", label: "M — up to 400A (3VA2)" },
              { value: "L", label: "L — up to 630A (3VL)" },
            ]} />
          <FieldSelect label={t.panelLayout.busbarTier} value={bbTier} onChange={v => setBbTier(v as BusbarTier)}
            options={[
              { value: "none",   label: "No busbar (terminal block only)" },
              { value: "single", label: "Single-tier (100 mm)" },
              { value: "triple", label: "Triple-tier segregated (150 mm)" },
            ]}
            hint="Triple-tier: L1/L2/L3 separated per IEC 61439 Form 3b" />
          <FieldSelect label={t.panelLayout.spacePreference} value={layoutSpace} onChange={v => setLayoutSpace(v as "compact"|"comfortable")}
            options={[
              { value: "comfortable", label: "Comfortable (×1.3 margin)" },
              { value: "compact",     label: "Compact (×1.1 margin)" },
            ]}
            hint="Comfortable leaves 30% spare — recommended for tropical maintenance" />
        </div>

        <button className="btn-primary" onClick={handleLayout}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>
          {t.panelLayout.btnCalc}
        </button>
      </div>

      {layoutResult && (
        <div className="vinci-card result-card-enter" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Layers size={18} style={{ color: "var(--accent)" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>
              {t.panelLayout.resTitle}
            </span>
          </div>

          {/* DIMENSION HERO */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, textAlign: "center" }}>
            {[
              { label: t.panelLayout.resH, value: `${layoutResult.enclosureHmm} mm`, sub: "H — IEC 61439" },
              { label: t.panelLayout.resW, value: `${layoutResult.enclosureWmm} mm`, sub: "W — std column" },
              { label: t.panelLayout.resD, value: `${layoutResult.enclosureDmm} mm`, sub: "D — door clearance" },
            ].map(d => (
              <div key={d.label} style={{ padding: "18px 12px", background: "rgba(201,168,76,0.08)", borderRadius: 16, border: "1px solid rgba(201,168,76,0.2)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{d.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{d.value}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted-soft)", marginTop: 4 }}>{d.sub}</div>
              </div>
            ))}
          </div>

          {/* COMPONENT STACK BREAKDOWN */}
          <div className="sec-label"><span>{t.panelLayout.breakdown}</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {layoutResult.breakdown.map((b, i) => {
              const pct = Math.round((b.heightMm / layoutResult.enclosureHmm) * 100);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg)", flex: 1 }}>{b.item}</div>
                  <div style={{ width: 120, background: "rgba(255,255,255,0.05)", borderRadius: 6, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 6 }} />
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--accent)", width: 60, textAlign: "right" }}>{b.heightMm} mm</div>
                </div>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 8, borderTop: "1px dashed rgba(255,255,255,0.08)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#4ade80", flex: 1, fontWeight: 700 }}>{t.panelLayout.freeSpace}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#4ade80", width: 60, textAlign: "right" }}>{layoutResult.freeHeightMm} mm</div>
            </div>
          </div>

          {layoutResult.warnings.length > 0 && (
            <div style={{ padding: 14, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.3)", borderRadius: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              {layoutResult.warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 11, fontFamily: "var(--font-body)", color: "#fb923c", lineHeight: 1.5 }}>⚠ {w}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
    </CalcShell>
  );
}
