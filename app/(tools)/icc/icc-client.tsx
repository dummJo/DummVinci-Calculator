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
import { calcIcc, type IccResult } from "@/lib/calc/icc";
import { useToolHistory } from "@/lib/use-tool-history";

export default function IccPage() {
  const [sourceMva,    setSourceMva]    = useState("500");
  const [primaryKv,    setPrimaryKv]    = useState("20");
  const [secondaryV,   setSecondaryV]   = useState("400");
  const [trKva,        setTrKva]        = useState("1000");
  const [trZpct,       setTrZpct]       = useState("6");
  const [cableLen,     setCableLen]     = useState("");
  const [cableMm2,     setCableMm2]     = useState("");
  const [cableMat,     setCableMat]     = useState<"Cu" | "Al">("Cu");

  const [result, setResult] = useState<IccResult | null>(null);

  const formInputs = useMemo(() => ({
    sourceMva, primaryKv, secondaryV, trKva, trZpct, cableLen, cableMm2, cableMat,
  }), [sourceMva, primaryKv, secondaryV, trKva, trZpct, cableLen, cableMm2, cableMat]);

  const applyInputs = useCallback((i: Record<string, unknown>) => {
    if (typeof i.sourceMva  === "string") setSourceMva(i.sourceMva);
    if (typeof i.primaryKv  === "string") setPrimaryKv(i.primaryKv);
    if (typeof i.secondaryV === "string") setSecondaryV(i.secondaryV);
    if (typeof i.trKva      === "string") setTrKva(i.trKva);
    if (typeof i.trZpct     === "string") setTrZpct(i.trZpct);
    if (typeof i.cableLen   === "string") setCableLen(i.cableLen);
    if (typeof i.cableMm2   === "string") setCableMm2(i.cableMm2);
    if (i.cableMat === "Cu" || i.cableMat === "Al") setCableMat(i.cableMat);
  }, []);

  const { saveSnapshot, restoreSnapshot } = useToolHistory("icc", formInputs, applyInputs);

  function handleCalc() {
    const cableL = parseFloat(cableLen);
    const cableS = parseFloat(cableMm2);
    const r = calcIcc({
      sourceMva:        parseFloat(sourceMva)  || 500,
      primaryKv:        parseFloat(primaryKv)  || 20,
      secondaryV:       parseFloat(secondaryV) || 400,
      transformerKva:   parseFloat(trKva)      || 1000,
      transformerZpct:  parseFloat(trZpct)     || 6,
      cableLengthM:     cableL > 0 ? cableL : undefined,
      cableMm2:         cableS > 0 ? cableS : undefined,
      cableMaterial:    cableMat,
    });
    setResult(r);
    saveSnapshot(`${sourceMva}MVA · ${trKva}kVA → ${r.icc3Ka} kA Icc, ${r.recommendedIcuKa} kA Icu`);
  }

  return (
    <CalcShell label="Icc" title="Short-circuit Icc" subtitle="Three-phase fault current per IEC 60909" concept="Icc determines required breaker breaking capacity Icu. Impedance chain: utility → transformer → cable.">
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-label"><span>UPSTREAM SOURCE</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <FieldNumber label="Utility S″k" unit="MVA" value={sourceMva} onChange={setSourceMva} min={10} step={50} required
            hint="Short-circuit MVA at HV side. Urban: 250–500. Rural: 50–150." />
          <FieldNumber label="Primary voltage" unit="kV" value={primaryKv} onChange={setPrimaryKv} min={1} step={1} required />
          <FieldNumber label="Secondary voltage" unit="V" value={secondaryV} onChange={setSecondaryV} min={100} step={10} required />
        </div>

        <div className="sec-label"><span>TRANSFORMER</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <FieldNumber label="Rated power" unit="kVA" value={trKva} onChange={setTrKva} min={10} step={50} required />
          <FieldNumber label="Impedance" unit="%Z" value={trZpct} onChange={setTrZpct} min={2} max={10} step={0.5} required
            hint="Typical: 4 % (≤250 kVA), 5 % (≤630), 6 % (≤1250), 7 % (≥1600)" />
        </div>

        <div className="sec-label"><span>CABLE TO FAULT (OPTIONAL)</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <FieldNumber label="Cable length" unit="m" value={cableLen} onChange={setCableLen} min={0} step={1}
            hint="Leave blank for fault at transformer terminals" />
          <FieldNumber label="Cross-section" unit="mm²" value={cableMm2} onChange={setCableMm2} min={0} step={1} />
          <FieldSelect label="Material" value={cableMat} onChange={v => setCableMat(v as "Cu" | "Al")}
            options={[ { value: "Cu", label: "Copper" }, { value: "Al", label: "Aluminium" } ]} />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
          <button className="btn-primary" onClick={handleCalc} style={{ flex: "1 1 200px", justifyContent: "center" }}>
            CALCULATE Icc
          </button>
          <RecentDropdown tool="icc" onRestore={restoreSnapshot} />
          <ShareButton tool="icc" inputs={formInputs} enabled={result !== null} />
        </div>
      </div>

      {result && (
        <ResultCard
          title="Fault Current"
          rows={[
            { label: "Source impedance",       value: `${result.zSourceMOhm} mΩ` },
            { label: "Transformer impedance",  value: `${result.zTransformerMOhm} mΩ` },
            { label: "Cable impedance",        value: result.zCableMOhm > 0 ? `${result.zCableMOhm} mΩ` : "—" },
            { label: "Total impedance",        value: `${result.zTotalMOhm} mΩ` },
            { label: "Icc 3-phase symmetric",  value: `${result.icc3Ka} kA`, accent: true },
            { label: "Peak current Ip (κ=1.8)", value: `${result.ipKa} kA` },
            { label: "1-s thermal Icw",        value: `${result.icw1sKa} kA` },
            { label: "Recommended breaker Icu", value: `${result.recommendedIcuKa} kA (1.25 × Icc, next standard)`, accent: true },
          ]}
          warnings={result.warnings}
        />
      )}

      {result && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Calculated per
          </span>
          <StandardsRef code="iec60909-icc" />
        </div>
      )}

      {result && <AuditFooter inputs={formInputs} standards="IEC 60909-0" />}

      <Footnote />
      <Footer />
    </CalcShell>
  );
}
