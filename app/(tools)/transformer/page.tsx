"use client";

import { useState, useMemo, useCallback } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import ResultCard from "@/components/calc/ResultCard";
import RecentDropdown from "@/components/calc/RecentDropdown";
import ShareButton from "@/components/share/ShareButton";
import StandardsRef from "@/components/calc/StandardsRef";
import AuditFooter from "@/components/calc/AuditFooter";
import Footer from "@/components/nav/Footer";
import Footnote from "@/components/calc/Footnote";
import { sizeTransformer, type TransformerResult, type TransformerType } from "@/lib/calc/transformer";
import { useToolHistory } from "@/lib/use-tool-history";

export default function TransformerPage() {
  const [loadKw,    setLoadKw]    = useState("500");
  const [pf,        setPf]        = useState("0.85");
  const [primaryKv, setPrimaryKv] = useState("20");
  const [secV,      setSecV]      = useState("400");
  const [demand,    setDemand]    = useState("0.85");
  const [growth,    setGrowth]    = useState("1.15");
  const [type,      setType]      = useState<TransformerType>("oil");

  const [result, setResult] = useState<TransformerResult | null>(null);

  const formInputs = useMemo(() => ({
    loadKw, pf, primaryKv, secV, demand, growth, type,
  }), [loadKw, pf, primaryKv, secV, demand, growth, type]);

  const applyInputs = useCallback((i: Record<string, unknown>) => {
    if (typeof i.loadKw    === "string") setLoadKw(i.loadKw);
    if (typeof i.pf        === "string") setPf(i.pf);
    if (typeof i.primaryKv === "string") setPrimaryKv(i.primaryKv);
    if (typeof i.secV      === "string") setSecV(i.secV);
    if (typeof i.demand    === "string") setDemand(i.demand);
    if (typeof i.growth    === "string") setGrowth(i.growth);
    if (i.type === "dry" || i.type === "oil") setType(i.type);
  }, []);

  const { saveSnapshot, restoreSnapshot } = useToolHistory("transformer", formInputs, applyInputs);

  function handleCalc() {
    const r = sizeTransformer({
      loadKw:        parseFloat(loadKw)    || 0,
      powerFactor:   parseFloat(pf)        || 0.85,
      primaryKv:     parseFloat(primaryKv) || 20,
      secondaryV:    parseFloat(secV)      || 400,
      demandFactor:  parseFloat(demand)    || 0.85,
      growthFactor:  parseFloat(growth)    || 1.15,
      type,
    });
    setResult(r);
    saveSnapshot(`${loadKw}kW → ${r.selectedKva} kVA (${r.pctZ}% Z, ${r.iccSecondaryKa} kA Icc-sec)`);
  }

  return (
    <CalcShell label="Transformer" title="Transformer Sizing" subtitle="Distribution transformer kVA selection per IEC 60076" concept="Design kVA = load × demand × growth → smallest standard frame ≥ design. Output also gives terminal Icc for downstream breaker sizing.">
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-label"><span>LOAD</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <FieldNumber label="Connected load" unit="kW" value={loadKw} onChange={setLoadKw} min={1} step={10} required />
          <FieldNumber label="Power factor" value={pf} onChange={setPf} min={0.5} max={1.0} step={0.01} required />
        </div>

        <div className="sec-label"><span>VOLTAGE</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <FieldNumber label="Primary" unit="kV" value={primaryKv} onChange={setPrimaryKv} min={1} step={1} required />
          <FieldNumber label="Secondary" unit="V" value={secV} onChange={setSecV} min={100} step={10} required
            hint="LL voltage on LV side (typ. 400 / 415)" />
        </div>

        <div className="sec-label"><span>SIZING FACTORS</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <FieldNumber label="Demand factor" value={demand} onChange={setDemand} min={0.4} max={1.0} step={0.05}
            hint="Coincident peak / connected. Typical 0.7–0.9." />
          <FieldNumber label="Growth factor" value={growth} onChange={setGrowth} min={1.0} max={1.5} step={0.05}
            hint="Future expansion margin. 1.15 = 15 % headroom." />
          <FieldSelect label="Type" value={type} onChange={v => setType(v as TransformerType)}
            options={[ { value: "oil", label: "Oil-immersed" }, { value: "dry", label: "Dry-type cast resin" } ]} />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
          <button className="btn-primary" onClick={handleCalc} style={{ flex: "1 1 200px", justifyContent: "center" }}>
            SIZE TRANSFORMER
          </button>
          <RecentDropdown tool="transformer" onRestore={restoreSnapshot} />
          <ShareButton tool="transformer" inputs={formInputs} enabled={result !== null} />
        </div>
      </div>

      {result && (
        <ResultCard
          title="Transformer Selection"
          rows={[
            { label: "Apparent load",        value: `${result.loadKva} kVA` },
            { label: "Design kVA",            value: `${result.designKva} kVA (demand × growth)` },
            { label: "Selected frame",        value: `${result.selectedKva} kVA`, accent: true },
            { label: "Impedance",             value: `${result.pctZ} %Z` },
            { label: "Primary current",       value: `${result.primaryAmpsA} A` },
            { label: "Secondary current",     value: `${result.secondaryAmpsA} A`, accent: true },
            { label: "Regulation @ full load", value: `${result.regulationPct} %` },
            { label: "Secondary terminal Icc", value: `${result.iccSecondaryKa} kA (downstream breaker Icu reference)`, accent: true },
            { label: "Part code",             value: result.partCode, accent: true },
          ]}
          warnings={result.warnings}
        />
      )}

      {result && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Calculated per
          </span>
          <StandardsRef code="iec60076-trf" />
        </div>
      )}

      {result && <AuditFooter inputs={formInputs} standards="IEC 60076-1 / 60076-2" />}

      <Footnote />
      <Footer />
    </CalcShell>
  );
}
