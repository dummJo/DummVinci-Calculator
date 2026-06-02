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
import {
  checkSelectivity,
  type SelectivityResult,
  type BreakerKind,
} from "@/lib/calc/selectivity";
import { useToolHistory } from "@/lib/use-tool-history";

const KIND_OPTIONS = [
  { value: "MCB",                 label: "MCB" },
  { value: "MCCB-thermomag",      label: "MCCB (thermal-mag)" },
  { value: "MCCB-electronic",     label: "MCCB (electronic trip)" },
  { value: "ACB",                 label: "ACB" },
];

const RATING_STYLE: Record<"full" | "partial" | "none", { color: string; label: string }> = {
  full:    { color: "#22c55e", label: "✓ Full selectivity" },
  partial: { color: "#f59e0b", label: "△ Partial selectivity" },
  none:    { color: "#ef4444", label: "✗ No selectivity" },
};

export default function SelectivityPage() {
  const [upKind,  setUpKind]  = useState<BreakerKind>("MCCB-thermomag");
  const [upIn,    setUpIn]    = useState("250");
  const [upIcu,   setUpIcu]   = useState("36");
  const [dnKind,  setDnKind]  = useState<BreakerKind>("MCCB-thermomag");
  const [dnIn,    setDnIn]    = useState("63");
  const [dnIcu,   setDnIcu]   = useState("25");
  const [fault,   setFault]   = useState("15");

  const [result, setResult] = useState<SelectivityResult | null>(null);

  const formInputs = useMemo(() => ({
    upKind, upIn, upIcu, dnKind, dnIn, dnIcu, fault,
  }), [upKind, upIn, upIcu, dnKind, dnIn, dnIcu, fault]);

  const applyInputs = useCallback((i: Record<string, unknown>) => {
    if (typeof i.upKind === "string") setUpKind(i.upKind as BreakerKind);
    if (typeof i.upIn   === "string") setUpIn(i.upIn);
    if (typeof i.upIcu  === "string") setUpIcu(i.upIcu);
    if (typeof i.dnKind === "string") setDnKind(i.dnKind as BreakerKind);
    if (typeof i.dnIn   === "string") setDnIn(i.dnIn);
    if (typeof i.dnIcu  === "string") setDnIcu(i.dnIcu);
    if (typeof i.fault  === "string") setFault(i.fault);
  }, []);

  const { saveSnapshot, restoreSnapshot } = useToolHistory("selectivity", formInputs, applyInputs);

  function handleCalc() {
    const r = checkSelectivity({
      upstreamKind:       upKind,
      upstreamInA:        parseFloat(upIn)   || 0,
      upstreamIcuKa:      parseFloat(upIcu)  || 0,
      downstreamKind:     dnKind,
      downstreamInA:      parseFloat(dnIn)   || 0,
      downstreamIcuKa:    parseFloat(dnIcu)  || 0,
      faultIccKa:         parseFloat(fault)  || 0,
    });
    setResult(r);
    saveSnapshot(`${upIn}A ↔ ${dnIn}A · ratio ${r.ratioInIn} → ${r.rating}`);
  }

  return (
    <CalcShell label="Selectivity" title="Breaker Selectivity Study" subtitle="Upstream-downstream discrimination per IEC 60947-2" concept="Verify that a downstream fault trips only the downstream breaker. Rule-of-thumb In ratio (≥ 2.5 full, 1.6–2.5 partial). Manufacturer tables refine.">
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-label"><span>UPSTREAM BREAKER</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <FieldSelect label="Kind" value={upKind} onChange={v => setUpKind(v as BreakerKind)} options={KIND_OPTIONS} />
          <FieldNumber label="Rated current In" unit="A" value={upIn}  onChange={setUpIn}  min={1} step={10} required />
          <FieldNumber label="Breaking capacity Icu" unit="kA" value={upIcu} onChange={setUpIcu} min={1} step={1} required />
        </div>

        <div className="sec-label"><span>DOWNSTREAM BREAKER</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <FieldSelect label="Kind" value={dnKind} onChange={v => setDnKind(v as BreakerKind)} options={KIND_OPTIONS} />
          <FieldNumber label="Rated current In" unit="A" value={dnIn}  onChange={setDnIn}  min={1} step={5} required />
          <FieldNumber label="Breaking capacity Icu" unit="kA" value={dnIcu} onChange={setDnIcu} min={1} step={1} required />
        </div>

        <div className="sec-label"><span>SITE FAULT</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <FieldNumber label="Fault Icc at downstream" unit="kA" value={fault} onChange={setFault} min={0} step={1} required
            hint="Use the Icc calculator output for this point on the bus" />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
          <button className="btn-primary" onClick={handleCalc} style={{ flex: "1 1 200px", justifyContent: "center" }}>
            CHECK SELECTIVITY
          </button>
          <RecentDropdown tool="selectivity" onRestore={restoreSnapshot} />
          <ShareButton tool="selectivity" inputs={formInputs} enabled={result !== null} />
        </div>
      </div>

      {result && (
        <ResultCard
          title="Discrimination Result"
          rows={[
            { label: "Rating",              value: RATING_STYLE[result.rating].label, accent: true },
            { label: "In ratio (up / down)", value: `${result.ratioInIn} ×` },
            { label: "Selectivity limit",   value: `${result.selectivityLimitKa} kA` },
            { label: "Recommendation",      value: result.recommendation, accent: result.rating !== "none" },
          ]}
          warnings={result.notes}
        />
      )}

      {result && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Calculated per
          </span>
          <StandardsRef code="iec60947-selectivity" />
        </div>
      )}

      {result && <AuditFooter inputs={formInputs} standards="IEC 60947-2 §7.2" />}

      <Footnote />
      <Footer />
    </CalcShell>
  );
}
