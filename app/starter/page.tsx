// app/starter/page.tsx — DOL & Star-Delta Motor Starter Sizing (Siemens SIRIUS)
"use client";
import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import Footer from "@/components/nav/Footer";
import { sizeStarter } from "@/lib/calc/starter";
import type { StarterInput, StarterResult, StarterType, Voltage } from "@/lib/calc/starter";
import { Zap, ShieldCheck, Timer, CircuitBoard, AlertTriangle, CheckCircle, Copy } from "lucide-react";

const CATEGORY_STYLES: Record<string, { bg: string; border: string; color: string; label: string }> = {
  MPCB:      { bg: "rgba(201,168,76,0.1)",  border: "rgba(201,168,76,0.3)",  color: "var(--accent)", label: "MPCB" },
  CONTACTOR: { bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.3)",  color: "#60a5fa",       label: "Contactor" },
  KIT:       { bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.3)",  color: "#c084fc",       label: "Compact Kit" },
  TIMER:     { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   color: "#4ade80",       label: "Timer" },
  AUXILIARY: { bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.3)",  color: "#fb923c",       label: "Auxiliary" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px", color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}
    >
      {copied ? <CheckCircle size={12} style={{ color: "#4ade80" }} /> : <Copy size={12} />}
    </button>
  );
}

export default function StarterPage() {
  const [motorKw, setMotorKw]       = useState("15");
  const [voltage, setVoltage]       = useState<Voltage>(400);
  const [flaOverride, setFlaOverride] = useState("");
  const [starterType, setStarterType] = useState<StarterType>("STAR_DELTA");
  const [timerSec, setTimerSec]     = useState("10");
  const [result, setResult]         = useState<StarterResult | null>(null);

  function handleCalc() {
    const r = sizeStarter({
      motorKw: parseFloat(motorKw) || 0,
      voltage,
      fla: flaOverride ? parseFloat(flaOverride) : undefined,
      starterType,
      timerSec: parseFloat(timerSec) || 10,
    } as StarterInput);
    setResult(r);
  }

  return (
    <CalcShell
      label="STARTER"
      title="Motor Starter Sizing"
      subtitle="DOL & Star-Delta — Siemens SIRIUS 3RV2 MPCB · 3RT2 Contactor · 3RA2 Compact Kit"
      concept="Direct starter (**DOL / Star-Delta**) masih mendominasi proyek pompa, *fire pump*, dan conveyor di Indonesia. Kesalahan paling umum: teknisi memakai contactor berdasarkan rating *AC1* (resistive) — bukan **AC3** (motor duty), sehingga contactor 40A hanya mampu menanggung motor ~18.5 kW nyatanya. Kalkulator ini memastikan `MPCB trip setting`, `contactor AC3 rating`, dan `auxiliary wiring` sudah sesuai **IEC 60947-4-1** sebelum quotation keluar."
    >
      <style>{`
        .bom-row {
          display: flex; flex-direction: column; gap: 8px;
          padding: 16px 18px;
          border-radius: 16px;
          border: 1px solid;
          transition: transform 0.2s ease;
        }
        .bom-row:hover { transform: translateY(-2px); }
        .bom-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .bom-badge {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 10px;
          font-family: var(--font-mono); font-size: 9px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap;
        }
        .bom-partnumber {
          font-family: var(--font-mono); font-size: 13px; font-weight: 700;
          color: var(--accent); display: flex; align-items: center; gap: 4px;
        }
        .bom-note {
          font-family: var(--font-body); font-size: 11px; color: var(--fg-soft);
          line-height: 1.55; opacity: 0.85;
        }
        .mpcb-hero {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px; margin-bottom: 24px;
        }
        .mpcb-cell {
          padding: 16px 12px; border-radius: 14px;
          background: rgba(201,168,76,0.06);
          border: 1px solid rgba(201,168,76,0.2);
          display: flex; flex-direction: column; gap: 4px;
        }
        .startype-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 24px; font-weight: 700;
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.05em;
          cursor: pointer; transition: all 0.2s ease;
        }
        .wiring-tip {
          background: rgba(59,130,246,0.06);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 16px; padding: 16px;
          font-family: var(--font-mono); font-size: 10px;
          color: var(--fg); line-height: 1.8;
          display: flex; flex-direction: column; gap: 6px;
        }
      `}</style>

      {/* INPUT CARD */}
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-label"><span>Motor Specification</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <FieldNumber label="Motor Power (kW)" value={motorKw} onChange={setMotorKw} min={0.37} step={0.37}
            hint="From nameplate — 4-pole squirrel cage standard" />
          <FieldSelect label="Supply Voltage" value={String(voltage)} onChange={v => setVoltage(parseInt(v) as Voltage)}
            options={[
              { value: "400", label: "400 V (TN-S/TNS Indonesia)" },
              { value: "415", label: "415 V (legacy 50Hz grid)" },
              { value: "690", label: "690 V (MV switchgear)" },
              { value: "230", label: "230 V (single-phase equiv.)" },
            ]} />
          <FieldNumber label="FLA Override (A)" value={flaOverride} onChange={setFlaOverride} min={0}
            hint="Leave blank to auto-estimate from kW/voltage (IEC 60034)" />
        </div>

        <div className="sec-label"><span>Starter Type</span></div>

        {/* STARTER TYPE VISUAL PICKER */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {(["DOL", "STAR_DELTA"] as StarterType[]).map(type => (
            <button key={type}
              onClick={() => setStarterType(type)}
              className="startype-pill"
              style={{
                background: starterType === type ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)",
                border: starterType === type ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,0.1)",
                color: starterType === type ? "var(--accent)" : "var(--fg)",
                boxShadow: starterType === type ? "0 0 12px rgba(201,168,76,0.15)" : "none",
              }}
            >
              {type === "DOL" ? <Zap size={14} /> : <CircuitBoard size={14} />}
              {type === "DOL" ? "Direct On Line (DOL)" : "Star-Delta (Y-Δ)"}
            </button>
          ))}
        </div>

        {/* CONTEXT CARD */}
        <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", fontSize: 12, color: "var(--fg-soft)", lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
          {starterType === "DOL"
            ? "⚡ DOL — Motor langsung mendapat tegangan penuh saat START. Inrush ≈ 6–8× FLA. Cocok untuk motor ≤ 11 kW atau motor yang sering start/stop cepat (conveyor pendek, pompa dosing)."
            : "🔄 Star-Delta — Motor mulai dalam sambungan Y (star), arus turun ~1/3. Setelah timer, beralih ke Δ (delta). Standar untuk pompa sentrifugal & blower >  7.5 kW. Siemens 3RA2 compact kit menyatukan 3 kontaktor + timer dalam satu paket."}
        </div>

        {starterType === "STAR_DELTA" && (
          <FieldNumber label="Transition Timer (s)" value={timerSec} onChange={setTimerSec} min={3} max={30}
            hint="Typical 8–15 s. Set longer for high-inertia loads (fan, flywheel). Short = inrush spike at delta switch." />
        )}

        <button className="btn-primary" onClick={handleCalc} style={{ marginTop: 4, width: "100%", justifyContent: "center" }}>
          Generate Starter BOQ (Siemens SIRIUS)
        </button>
      </div>

      {result && (
        <>
          {/* MPCB HERO */}
          <div className="vinci-card result-card-enter" style={{ marginTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <ShieldCheck size={18} style={{ color: "var(--accent)" }} />
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700 }}>
                MPCB Protection Layer
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginLeft: "auto" }}>
                IEC 60947-2 / Motor Protection Class 10A
              </span>
            </div>
            <div className="mpcb-hero">
              {[
                { label: "MPCB Frame",     value: result.mpcbFrame },
                { label: "Part Number",    value: result.mpcbPartNo },
                { label: "Trip Class",     value: "Class 10A (motor standard)" },
                { label: "Icu Rating",     value: `${result.icuKa} kA` },
                { label: "FLA Motor",      value: `${result.fla} A` },
                { label: "Set Range",      value: result.mpcbSetA },
              ].map(cell => (
                <div key={cell.label} className="mpcb-cell">
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{cell.label}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: cell.label === "Set Range" ? 11 : 13, fontWeight: 700, color: "var(--accent)", lineHeight: 1.3 }}>{cell.value}</div>
                </div>
              ))}
            </div>

            {/* STAR DELTA CURRENT BREAKDOWN */}
            {result.starterType === "STAR_DELTA" && (
              <div style={{ padding: "14px 16px", background: "rgba(168,85,247,0.06)", borderRadius: 14, border: "1px solid rgba(168,85,247,0.2)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#c084fc", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Star-Delta Current Distribution (IEC 60947-4-1)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                  {[
                    { label: "FLA (full load)", value: `${result.fla} A`, note: "Main + Delta contactor rating" },
                    { label: "Star current",    value: `${(result.fla / Math.sqrt(3)).toFixed(1)} A`, note: "= FLA ÷ √3 during starting" },
                    { label: "Inrush (star)",   value: `≈ ${(result.fla * 2).toFixed(0)} A`, note: "~2× FLA vs 6–8× DOL" },
                    { label: "Timer",           value: `${result.timerSec} s`, note: "Y→Δ transition" },
                  ].map(row => (
                    <div key={row.label} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 10 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginBottom: 3 }}>{row.label}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "#c084fc" }}>{row.value}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginTop: 3, opacity: 0.8 }}>{row.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BOM LIST */}
          <div className="vinci-card result-card-enter" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justify: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div className="sec-label" style={{ marginBottom: 0 }}><span>Siemens SIRIUS Bill of Quantity</span></div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", opacity: 0.7 }}>
                {result.starterType === "STAR_DELTA" ? "3RA2 Compact Kit + Auxiliaries" : "3RT2 DOL + Auxiliaries"}
              </div>
            </div>

            {result.bom.map((item, i) => {
              const style = CATEGORY_STYLES[item.category];
              return (
                <div key={i} className="bom-row" style={{ background: style.bg, borderColor: style.border }}>
                  <div className="bom-header">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span className="bom-badge" style={{ background: style.border.replace("0.3", "0.15"), color: style.color, border: `1px solid ${style.border}` }}>
                          {style.label}
                        </span>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>{item.item}</span>
                      </div>
                      <div className="bom-partnumber">
                        {item.partNo}
                        <CopyButton text={item.partNo} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, color: style.color }}>×{item.qty}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>QTY</div>
                    </div>
                  </div>
                  <div className="bom-note">{item.note}</div>
                </div>
              );
            })}
          </div>

          {/* WIRING KEY */}
          <div className="vinci-card result-card-enter" style={{ marginTop: 16 }}>
            <div className="sec-label"><span>Wiring Logic Guide (PLC I/O Allocation)</span></div>
            <div className="wiring-tip">
              {result.starterType === "DOL" ? (
                <>
                  <div>🟢 <strong>PLC DO → KM1 coil</strong> — Motor START command (latch after AUX NO confirmed)</div>
                  <div>🔵 <strong>KM1 AUX 1NO → PLC DI</strong> — Motor RUN feedback (interlock condition)</div>
                  <div>🟠 <strong>3RV2901-2A 1NC → PLC DI</strong> — MPCB TRIP/FAULT feedback (alarm logic)</div>
                  <div>🔴 <strong>E-Stop → MPCB handle / KM1 coil circuit</strong> — hardwired safety, independent of PLC</div>
                </>
              ) : (
                <>
                  <div>🟢 <strong>PLC DO → KM1 + KM2</strong> — energise simultaneously at START (star mode)</div>
                  <div>⏱ <strong>Timer {result.timerSec}s expires → KM2 drops OUT</strong> — star contactor releases</div>
                  <div>⚡ <strong>50ms dead-time → KM3 energises</strong> — delta contactor closes (PLC interlock or hardware timer)</div>
                  <div>🔵 <strong>KM1 AUX 1NO → PLC DI</strong> — motor energised feedback</div>
                  <div>🟣 <strong>KM3 AUX 1NO → PLC DI</strong> — delta mode confirmed (enable full-load permissive)</div>
                  <div>🟠 <strong>3RV2901-2A 1NC → PLC DI</strong> — MPCB TRIP alarm</div>
                  <div>🔴 <strong>E-Stop → drop ALL contactors</strong> — KM1+KM2+KM3 coil circuit</div>
                </>
              )}
            </div>
          </div>

          {/* WARNINGS */}
          {result.warnings.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {result.warnings.map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "12px 16px", background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: 14 }}>
                  <AlertTriangle size={14} style={{ color: "#fb923c", flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 11, fontFamily: "var(--font-body)", color: "#fb923c", lineHeight: 1.55 }}>{w}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Footer />
    </CalcShell>
  );
}
