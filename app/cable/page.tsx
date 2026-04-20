// app/cable/page.tsx — Cable Sizing Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import FieldKwAmp from "@/components/calc/FieldKwAmp";
import ResultCard from "@/components/calc/ResultCard";
import { sizeCable, CableResult } from "@/lib/calc/cable";
import type { Phase, Insulation, Install } from "@/lib/calc/cable";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import { Info } from "lucide-react";

const INSTALL_LEGEND: Record<string, { title: string, desc: string }> = {
  air: { title: "Clipped in Air (Kabel Terbuka)", desc: "Kabel dipasang telanjang ke dinding/siku. Karena terekspos udara bebas, suhu kabel terjaga dan arus yg boleh dilewati paling besar." },
  tray: { title: "Cable Tray (Rak Kabel Berlubang)", desc: "Dipasang teratur di atas rak. Standar terbaik dan terbanyak di industri pabrik & mall. Udara masih bisa sirkulasi." },
  conduit: { title: "In Conduit (Dalam Pipa Tertutup)", desc: "Kabel dirapikan di dalam pipa PVC/Besi. Panas listrik akan terperangkap! Karena itu, kapasitas/kemampuan hantar arusnya dipaksa turun (Derated)." },
  buried: { title: "Direct Buried (Kabel Tanam Tanah)", desc: "Ditanam murni di dalam tanah. Disipasi panas sulit sehingga kabel harus dilindungi pelindung baja (armor) khusus." },
};

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

  const [result, setResult] = useState<CableResult | null>(null);

  function handleCalc() {
    const r = sizeCable({
      current:      parseFloat(current)  || 0,
      lengthM:      parseFloat(length)   || 0,
      voltage:      parseFloat(voltage)  || 400,
      phase, insulation, install,
      ambientC:     parseFloat(ambient)  || 35,
      maxVdropPct:  parseFloat(vdrop)    || 3,
      powerFactor:  parseFloat(pf)       || 0.85,
    });
    setResult(r);
  }

  return (
    <CalcShell 
      label={tc.label} 
      title={tc.title} 
      subtitle={tc.subtitle}
      concept="Ukuran kabel listrik ibarat saluran air; ia harus disesuaikan dengan besar **beban arusnya**. Kabel yang ditutup rapat (*Conduit/Pipa*) lebih mudah panas ketimbang di udara terbuka, sehingga kemampuannya dipaksa turun (`Derated`). Kalkulator ini mengamankan kabel dari **resiko terbakar** (Sizing) dan meredam **Drop Voltage**."
    >
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-label"><span>{tc.secLoad}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <FieldKwAmp
            label={tc.current}
            voltage={parseFloat(voltage) || 400}
            phase={phase}
            pf={parseFloat(pf) || 0.85}
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

        <div className="sec-label" style={{ marginTop: 4 }}><span>{tc.secInstall}</span></div>

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
            label={tc.pf}
            value={pf} onChange={setPf}
            min={0.5} max={1.0} step={0.01} hint={tc.pfHint}
          />
        </div>

        <div style={{ marginTop: 4, padding: 16, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, display: "flex", gap: 12 }}>
          <div style={{ color: "var(--accent)", marginTop: 2 }}><Info size={18} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>METODE: {INSTALL_LEGEND[install].title}</span>
            <span style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.5, opacity: 0.9 }}>{INSTALL_LEGEND[install].desc}</span>
          </div>
        </div>

        <button className="btn-primary" onClick={handleCalc}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>
          {tc.btnCalc}
        </button>
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

      <Footer />
    </CalcShell>
  );
}
