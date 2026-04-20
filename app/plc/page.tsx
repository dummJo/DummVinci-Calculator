// app/plc/page.tsx — Siemens S7-1200/1500 PLC I/O Module Calculator
"use client";
import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import ResultCard from "@/components/calc/ResultCard";
import Footer from "@/components/nav/Footer";
import { sizePlcModules, CPU_CATALOG } from "@/lib/calc/plc";
import type { PlcInput, PlcResult, CpuModel } from "@/lib/calc/plc";
import { CheckCircle, AlertTriangle, Cpu, Wifi } from "lucide-react";

const CPU_OPTIONS = Object.entries(CPU_CATALOG).map(([k, v]) => ({
  value: k,
  label: `${k} — ${v.partNo.split(" ")[0]} ${v.partNo.split(" ")[1]}`,
}));

export default function PlcPage() {
  const [cpuModel, setCpuModel] = useState<CpuModel>("CPU 1214C");
  const [di, setDi] = useState("32");
  const [doVal, setDoVal] = useState("24");
  const [ai, setAi] = useState("16");
  const [ao, setAo] = useState("8");
  const [spare, setSpare] = useState("20");
  const [result, setResult] = useState<PlcResult | null>(null);

  const cpu = CPU_CATALOG[cpuModel];

  function handleCalc() {
    const r = sizePlcModules({
      cpuModel,
      requiredDI: parseInt(di) || 0,
      requiredDO: parseInt(doVal) || 0,
      requiredAI: parseInt(ai) || 0,
      requiredAO: parseInt(ao) || 0,
      sparePct: parseInt(spare) || 20,
    } as PlcInput);
    setResult(r);
  }

  return (
    <CalcShell
      label="PLC"
      title="PLC I/O Module Sizing"
      subtitle="Siemens S7-1200 & S7-1500 Gen 2 — module count, expansion, power budget"
      concept="PLC adalah otak sistem kontrol. Setiap sensor (*DI/AI*) dan aktuator (*DO/AO*) butuh **satu kanal fisik** di modul I/O. Kurang spek modul = sistem mati saat commissioning. Kalkulator ini memastikan jumlah modul, ekspansi **ET 200SP**, dan **power budget** bus 24 VDC tidak under-spec sejak quotation."
    >
      <style>{`
        .plc-io-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .io-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px;
          border-radius: 14px;
          font-family: var(--font-mono); font-size: 10px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .io-badge-di  { background: rgba(59,130,246,0.15);  color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
        .io-badge-do  { background: rgba(34,197,94,0.15);   color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
        .io-badge-ai  { background: rgba(168,85,247,0.15);  color: #c084fc; border: 1px solid rgba(168,85,247,0.3); }
        .io-badge-ao  { background: rgba(251,146,60,0.15);  color: #fb923c; border: 1px solid rgba(251,146,60,0.3); }
        .power-bar-track {
          background: rgba(255,255,255,0.06);
          border-radius: 8px; height: 10px; width: 100%; overflow: hidden; margin-top: 6px;
        }
        .power-bar-fill {
          height: 100%; border-radius: 8px;
          transition: width 0.6s ease;
        }
        .module-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          transition: background 0.2s;
        }
        .module-row:hover { background: rgba(255,255,255,0.06); }
        .et200-card {
          padding: 20px;
          border: 1px solid rgba(59,130,246,0.3);
          background: rgba(59,130,246,0.06);
          border-radius: 20px;
          margin-top: 16px;
        }
      `}</style>

      {/* CPU SELECTOR */}
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-label"><span>PLC CPU Selection</span></div>

        <FieldSelect
          label="CPU Model"
          value={cpuModel}
          onChange={v => setCpuModel(v as CpuModel)}
          options={CPU_OPTIONS}
          hint="Select CPU based on project scale. S7-1200 for < 200 I/O, S7-1500 for complex projects."
        />

        {/* CPU Info Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          {[
            { label: "Series",    value: cpu.series },
            { label: "Part No",   value: cpu.partNo },
            { label: "Onboard DI/DO", value: `${cpu.onboardDI} / ${cpu.onboardDO}` },
            { label: "Onboard AI/AO", value: `${cpu.onboardAI} / ${cpu.onboardAO}` },
            { label: "Max SM Slots",  value: String(cpu.maxSmSlots) },
            { label: "Bus Power",     value: `${cpu.busPowerMa} mA` },
          ].map(item => (
            <div key={item.label} style={{ padding: "10px 14px", background: "rgba(201,168,76,0.06)", borderRadius: 12, border: "1px solid rgba(201,168,76,0.15)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div className="sec-label" style={{ marginTop: 4 }}><span>Required I/O Points</span></div>

        {/* IO TYPE COLOR GUIDE */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          <span className="io-badge io-badge-di">DI — Digital Input</span>
          <span className="io-badge io-badge-do">DO — Digital Output</span>
          <span className="io-badge io-badge-ai">AI — Analog Input</span>
          <span className="io-badge io-badge-ao">AO — Analog Output</span>
        </div>

        <div className="plc-io-grid">
          <FieldNumber label="Digital Inputs (DI)" value={di} onChange={setDi} min={0}
            hint="Push buttons, limit switches, level switches, motor feedback" />
          <FieldNumber label="Digital Outputs (DO)" value={doVal} onChange={setDoVal} min={0}
            hint="Contactors, solenoids, pilot lamps, relays" />
          <FieldNumber label="Analog Inputs (AI)" value={ai} onChange={setAi} min={0}
            hint="4-20 mA sensors: pressure, flow, temperature, level" />
          <FieldNumber label="Analog Outputs (AO)" value={ao} onChange={setAo} min={0}
            hint="4-20 mA control: VSD speed ref, control valve position" />
        </div>

        <div className="sec-label"><span>Sizing Parameters</span></div>
        <FieldNumber label="Spare Channel Margin (%)" value={spare} onChange={setSpare} min={10} max={50}
          hint="IEC 60848 recommends 20% spare — prevents costly re-order at handover" />

        <button className="btn-primary" onClick={handleCalc} style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>
          Calculate Modules & Power Budget
        </button>
      </div>

      {result && (
        <>
          {/* MODULE LIST */}
          <div className="vinci-card result-card-enter" style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="sec-label" style={{ marginBottom: 0 }}><span>Signal Module Bill of Quantity</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {result.powerOk
                  ? <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#4ade80", fontFamily: "var(--font-mono)", fontWeight: 700 }}><CheckCircle size={13} /> POWER OK</span>
                  : <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#fb923c", fontFamily: "var(--font-mono)", fontWeight: 700 }}><AlertTriangle size={13} /> POWER EXCEEDED</span>
                }
              </div>
            </div>

            {/* CPU row */}
            <div className="module-row">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Cpu size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, color: "var(--fg)" }}>{result.cpuModel}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>{result.cpuPartNo}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, color: "var(--accent)" }}>QTY: 1</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>CPU MAIN UNIT</div>
              </div>
            </div>

            {/* SM Modules */}
            {result.modulesUsed.map((m, i) => {
              const badgeCls = `io-badge io-badge-${m.type.toLowerCase()}`;
              return (
                <div key={i} className="module-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className={badgeCls}>{m.type}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{m.description}</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
                      {m.partNo} · {m.channels} ch/module · {m.powerMa / m.qty} mA each
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>×{m.qty}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{m.totalChannels} ch total</div>
                  </div>
                </div>
              );
            })}

            {/* Slot summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 8 }}>
              {[
                { label: "Slots Used", value: `${result.usedSmSlots} / ${result.totalSmSlots}`, ok: result.usedSmSlots <= result.totalSmSlots },
                { label: "Slots Free", value: String(result.freeSmSlots), ok: true },
                { label: "Bus Draw", value: `${result.totalPowerMa} mA`, ok: result.powerOk },
              ].map(s => (
                <div key={s.label} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 14, border: `1px solid ${s.ok ? "rgba(255,255,255,0.07)" : "rgba(251,146,60,0.4)"}` }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 15, color: s.ok ? "var(--accent)" : "#fb923c" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Power bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                <span>Bus Power Consumption</span>
                <span>{Math.round((result.totalPowerMa / result.busPowerMa) * 100)}% of budget</span>
              </div>
              <div className="power-bar-track">
                <div className="power-bar-fill" style={{
                  width: `${Math.min((result.totalPowerMa / result.busPowerMa) * 100, 100)}%`,
                  background: result.powerOk
                    ? "linear-gradient(90deg, var(--accent), #86efac)"
                    : "linear-gradient(90deg, #f87171, #fb923c)",
                }} />
              </div>
            </div>
          </div>

          {/* ET 200SP OVERFLOW CARD */}
          {result.overflowToEt200 && (
            <div className="et200-card result-card-enter">
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Wifi size={22} style={{ color: "#60a5fa", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, color: "#60a5fa", marginBottom: 6 }}>
                    ET 200SP PROFINET EXPANSION REQUIRED
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-soft)", lineHeight: 1.6 }}>
                    Add <strong style={{ color: "#60a5fa" }}>{result.et200Heads} × ET 200SP station</strong> on PROFINET to the rack.
                    Each head interface: <strong>6ES7 151-8AB01-0AB0</strong> (IM 151-8 PN).
                    Max 32 I/O modules per head. Connect via PROFINET coupler to CPU.
                  </div>
                  <div style={{ marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
                    TIP: Place ET 200SP at field junction box to minimize field wiring runs — reduces cable cost vs. star-wiring all I/O to central panel.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHANNEL SUMMARY */}
          <ResultCard
            title="Available Channel Summary (incl. onboard)"
            rows={[
              { label: "Total DI Available", value: `${result.channelSummary.di} channels`, accent: true },
              { label: "Total DO Available", value: `${result.channelSummary.do} channels`, accent: true },
              { label: "Total AI Available", value: `${result.channelSummary.ai} channels`, accent: true },
              { label: "Total AO Available", value: `${result.channelSummary.ao} channels`, accent: true },
            ]}
            warnings={result.warnings}
          />
        </>
      )}

      <Footer />
    </CalcShell>
  );
}
