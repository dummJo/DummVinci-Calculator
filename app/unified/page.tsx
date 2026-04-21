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
import { Download, CheckCircle, Info } from "lucide-react";
import RichText from "@/components/calc/RichText";

const APP_LEGEND: Record<string, { title: string, desc: string }> = {
  pump: { title: "Normal Duty", desc: "Torsi awal **rendah**. Arus saat mulai berjalan *(Inrush)* biasanya linier dan ringan. Sangat aman dipasangkan ke Drive spek standar." },
  fan: { title: "Normal Duty", desc: "Torsi putar **berat di Inersia**. Membutuhkan waktu memutar bilah kipas yang berbobot secara perlahan (Ramp time)." },
  crane: { title: "Heavy Duty", desc: "Beban gravitasi **langsung jatuh** ke poros motor sejak `RPM 0`. Wajib menggunakan kelas *Heavy Duty* untuk sirkuit proteksi VSD agar tahan banting." },
  conveyor: { title: "Heavy Duty", desc: "Sering dipenuhi batu/pasir padat (*Locked load*). Motor butuh dorongan **Setrum Torsi Kejut** yang sangat galak di detik pertama operasi." }
};

const INSTALL_LEGEND = {
  air: { title: "Clipped di Udara Terbuka", desc: "Pendinginan **optimal**. Kulit kabel tersapu angin *ambient*, kapasitas arus (Ampere) bisa didorong ke tingkat maksimum (Kering)." },
  tray: { title: "Cable Tray Berlubang", desc: "Standard industri umum. Udara masih bisa menembus sela-sela rak *(Perforated tray)*, derating margin stabil." },
  conduit: { title: "Di Dalam Pipa Tertutup", desc: "**AWAS PANAS!** Hawa panas terjebak dalam lorong tertutup. Kapasitas kabel (*Ampacity*) harus **didiskon mahal** (Disunat ~30%)." },
  buried: { title: "Ditanam di Dalam Tanah", desc: "Sangat lembab dan sulit membuang radiasi terma. Wajib kabel *Armor/Baja* berlapis ganda dan derating kalkulasi tanah spesifik." }
};

function SummaryStrip({ result, t, tu }: { result: UnifiedResult, t: any, tu: any }) {
  const specs = [
    { label: t.support.colCode + "*", value: result.vsd.partCode },
    { label: t.support.colKw, value: result.vsd.ratedKw },
    { label: t.support.colFuse, value: result.vsd.fuseA || "—" },
    { label: t.support.colBreaker + "*", value: result.breaker.partCode.split(" ")[0] },
    { label: t.support.colCable + "*", value: `${result.cable.phaseSize} mm²` },
    { label: t.support.colAir, value: result.vsd.panelAirflowRequired },
    { label: t.support.colFrame, value: result.vsd.frame },
    { label: t.support.colDim, value: `${result.vsd.h}×${result.vsd.w}×${result.vsd.d}` },
  ];

  return (
    <div className="apple-glass-card result-card-enter">
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="iec-badge">
            <CheckCircle size={12} /> IEC 61439 & ABB COMPLIANT
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--fg)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Unified Engineering Summary
            </span>
          </div>
        </div>
        <button className="btn-icon" style={{ padding: "8px 12px", height: "auto", background: "rgba(255,255,255,0.08)", borderRadius: 16 }}>
          <Download size={16} style={{ color: "var(--fg)" }} />
        </button>
      </div>

      <div className="summary-specs-grid">
        {specs.map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {s.label}
            </span>
            <span style={{ 
              fontFamily: "var(--font-mono)", 
              fontSize: 13, 
              fontWeight: 700, 
              color: "var(--accent)",
              whiteSpace: "nowrap"
            }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* PUNCH NOTE LEGEND (Data Origins) */}
      <div style={{ 
        marginTop: 32, paddingTop: 16, borderTop: "1px dashed rgba(255,255,255,0.08)", 
        display: "flex", flexWrap: "wrap", gap: "10px 24px", opacity: 0.7 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
          <span style={{ color: "var(--accent)" }}>[*] Drive & Airflow (m³/h):</span> ABB Hardware Catalog (ACQ580/ACS880)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
          <span style={{ color: "var(--accent)" }}>[*] Cable & V-Drop:</span> IEC 60364-5-52 (Conductor Derating)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
          <span style={{ color: "var(--accent)" }}>[*] Breaker Sizing:</span> IEC 60947-2 (≥ 1.25× In + Motor Inrush Profile)
        </div>
      </div>
    </div>
  );
}

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
  const [variant, setVariant] = useState<"01" | "02" | "04" | "07" | "31">("01");
  const [result, setResult] = useState<UnifiedResult | null>(null);
  const [step, setStep] = useState(1);

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
      driveVariant: variant,
    });
    setResult(res);
    setStep(3);
  };

  const estA = estimateAmps(parseFloat(motorKw) || 0, voltage);

  return (
    <CalcShell 
      label={tu.label} 
      title={tu.title} 
      subtitle={tu.subtitle}
      concept="Alur `Fast Sizing` ibarat jalan pintas pintar bagi sistem perakitan. Cukup masukkan kapasitas **(kW) motor**, alat ini merangkai **3 lapis perisai otomatis** secara otonom: *Tipe Drive VSD*, *Ketebalan Kabel*, dan *Komponen Breaker Equivalents* agar arsitektur panel aman tanpa hitungan ganda."
    >
      <style>{`
        .apple-glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(48px) saturate(200%);
          -webkit-backdrop-filter: blur(48px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          padding: 28px;
          margin-bottom: 24px;
          box-shadow: 
            inset 0 1px 1px rgba(255, 255, 255, 0.15),
            0 12px 48px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }
        .apple-glass-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%);
          pointer-events: none;
        }
        .iec-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(201,168,76,0.15);
          color: var(--accent);
          border-radius: 20px;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          font-weight: 700;
          border: 1px solid rgba(201,168,76,0.3);
        }
        .apple-inner-wrapper > div.apple-glass-card {
          margin-bottom: 24px;
          backdrop-filter: none !important;
          background: rgba(0, 0, 0, 0.2) !important;
          border-radius: 20px !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
          box-shadow: none !important;
        }
        .summary-specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 20px 32px;
          align-items: start;
        }
        .result-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .result-cards-grid > div {
          margin-top: 0 !important;
          height: 100%;
        }
        @media (max-width: 1024px) {
          .summary-specs-grid { grid-template-columns: repeat(4, 1fr); row-gap: 20px; }
        }
        @media (max-width: 600px) {
          .summary-specs-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        /* Wizard Animations */
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .wizard-pane {
          animation: slideInRight 0.4s cubic-bezier(0.1, 0.7, 0.1, 1);
        }
        .wizard-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding: 0 16px;
        }
        .wizard-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 2;
          flex: 1;
        }
        .step-circle {
          width: 32px; height: 32px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono); font-weight: 700; font-size: 14px;
          transition: all 0.3s ease;
        }
        .step-active {
          background: var(--accent); color: #000;
          box-shadow: 0 0 16px rgba(201,168,76,0.4);
        }
        .step-done {
          background: rgba(201,168,76,0.2); color: var(--accent);
          border: 1px solid var(--accent);
        }
        .step-pending {
          background: rgba(255,255,255,0.05); color: var(--muted);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .wizard-connector {
          position: absolute; top: 16px; left: 50%; width: 100%;
          height: 2px; background: rgba(255,255,255,0.05); z-index: 1;
        }
        .wizard-connector-filled {
          height: 100%; background: var(--accent);
          transition: width 0.4s ease;
        }
        .wizard-nav-bar {
          display: flex; justify-content: space-between; gap: 16px; margin-top: 32px;
        }
      `}</style>

      {/* WIZARD STEPPER */}
      <div className="wizard-stepper">
        <div className="wizard-step">
          <div className={`step-circle ${step === 1 ? 'step-active' : 'step-done'}`}>1</div>
          <span style={{ fontSize: 10, color: step >= 1 ? 'var(--fg)' : 'var(--muted)', fontFamily: 'var(--font-mono)' }}>MOTOR SPEC</span>
          <div className="wizard-connector">
            <div className="wizard-connector-filled" style={{ width: step > 1 ? '100%' : '0%' }} />
          </div>
        </div>
        <div className="wizard-step">
          <div className={`step-circle ${step === 2 ? 'step-active' : (step > 2 ? 'step-done' : 'step-pending')}`}>2</div>
          <span style={{ fontSize: 10, color: step >= 2 ? 'var(--fg)' : 'var(--muted)', fontFamily: 'var(--font-mono)' }}>ENV & ROUTING</span>
          <div className="wizard-connector">
            <div className="wizard-connector-filled" style={{ width: step > 2 ? '100%' : '0%' }} />
          </div>
        </div>
        <div className="wizard-step">
          <div className={`step-circle ${step === 3 ? 'step-active' : 'step-pending'}`}>3</div>
          <span style={{ fontSize: 10, color: step >= 3 ? 'var(--fg)' : 'var(--muted)', fontFamily: 'var(--font-mono)' }}>FINAL BOQ</span>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* STEP 1 — MOTOR SPEC */}
        {step === 1 && (
          <div className="calc-col-input wizard-pane" style={{ width: "100%" }}>
            <div className="sec-label"><span>{tu.secMotor}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
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
                  { value: "pump",      label: t.vsd.appPump },
                  { value: "fan",       label: t.vsd.appFan },
                  { value: "crane",     label: t.vsd.appCrane },
                  { value: "conveyor",  label: t.vsd.appConveyor },
                ]}
              />
              <FieldToggle
                label={tu.heavy} checked={heavy} onChange={setHeavy}
                hint={t.vsd.heavyHint}
              />
              <FieldSelect
                label={tu.driveVariant} value={variant} onChange={v => setVariant(v as any)}
                options={[
                  { value: "01", label: t.vsd.constWall },
                  { value: "02", label: t.vsd.constCompact },
                  { value: "04", label: t.vsd.constModule },
                  { value: "07", label: t.vsd.constCabinet },
                  { value: "31", label: t.vsd.constUlh },
                ]}
              />
            </div>

            <div style={{ marginTop: 16, padding: 16, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, display: "flex", gap: 12, marginBottom: 24 }}>
              <div style={{ color: "var(--accent)", marginTop: 2 }}><Info size={18} /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>APPLICATION: {APP_LEGEND[app].title}</span>
                <span style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.5, opacity: 0.9 }}>
                  <RichText text={APP_LEGEND[app].desc} />
                </span>
              </div>
            </div>

            <div className="wizard-nav-bar" style={{ justifyContent: "flex-end" }}>
              <button className="btn-primary" style={{ padding: "14px 32px" }} onClick={() => setStep(2)}>
                Next: Routing &amp; Environment →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — ENV & ROUTING */}
        {step === 2 && (
          <div className="calc-col-input wizard-pane" style={{ width: "100%" }}>
            <div className="sec-label"><span>{t.cable.secInstall}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <FieldNumber label={tu.cableLen} value={cableLen} onChange={setCableLen} />
              <FieldSelect
                label={t.cable.insulation} value={insulation} onChange={v => setInsulation(v as Insulation)}
                options={[
                  { value: "PVC",  label: t.cable.insulPvc },
                  { value: "XLPE", label: t.cable.insulXlpe },
                ]}
              />
              <FieldSelect
                label={t.cable.installMethod} value={install} onChange={v => setInstall(v as Install)}
                options={[
                  { value: "air",     label: t.cable.methodAir },
                  { value: "tray",    label: t.cable.methodTray },
                  { value: "conduit", label: t.cable.methodConduit },
                  { value: "buried",  label: t.cable.methodBuried },
                ]}
              />
              <FieldNumber label={tu.ambient} value={ambient} onChange={setAmbient} />
            </div>

            <div style={{ marginTop: 16, padding: 16, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, display: "flex", gap: 12, marginBottom: 0 }}>
              <div style={{ color: "var(--accent)", marginTop: 2 }}><Info size={18} /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>METODE: {INSTALL_LEGEND[install].title}</span>
                <span style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.5, opacity: 0.9 }}>
                  <RichText text={INSTALL_LEGEND[install].desc} />
                </span>
              </div>
            </div>

            <div className="sec-label" style={{ marginTop: 24 }}><span>{t.breaker.secCircuit}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <FieldNumber label={tu.fault} value={fault} onChange={setFault} />
            </div>

            <div className="wizard-nav-bar">
              <button className="btn-secondary" style={{ padding: "14px 32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--r-md)", color: "white" }} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="btn-primary" style={{ padding: "14px 48px" }} onClick={calculate}>
                Generate System BOQ Draft
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — RESULTS */}
        {step === 3 && result && (
          <div className="calc-col-result wizard-pane">
            <div className="apple-inner-wrapper">
              <SummaryStrip result={result} t={t} tu={tu} />

              <div className="result-cards-grid">
                <ResultCard
                  title={tu.resTitle}
                  rows={[
                    { label: tu.resAmps, value: `${result.estimatedMotorAmps} A`, accent: true },
                  ]}
                />
                <ResultCard
                  title={tu.resVsd}
                  rows={[
                    { label: t.vsd.resPart,    value: result.vsd.partCode, accent: true },
                    { label: t.vsd.resFrame,   value: result.vsd.frame },
                    { label: t.vsd.resRatedKw, value: `${result.vsd.ratedKw} kW` },
                  ]}
                  warnings={result.vsd.warnings}
                />
                <ResultCard
                  title={tu.resCable}
                  rows={[
                    { label: t.cable.resSuggestion, value: result.cable.suggestion, accent: true },
                    { label: t.cable.resPhase,      value: `${result.cable.phaseSize} mm²` },
                    { label: t.cable.resGround,     value: `${result.cable.groundSize} mm²` },
                    { label: t.cable.resVdrop,      value: `${result.cable.vdropPct}%` },
                  ]}
                  warnings={result.cable.warnings}
                />
                <ResultCard
                  title={tu.resBreaker}
                  rows={[
                    { label: t.breaker.resPart,  value: result.breaker.partCode, accent: true },
                    { label: t.breaker.resNomA,  value: `${result.breaker.nominalA} A` },
                    { label: t.breaker.resIcu,   value: `${result.breaker.icuKa} kA` },
                  ]}
                  warnings={result.breaker.warnings}
                />
              </div>

              <div className="wizard-nav-bar" style={{ justifyContent: "center", marginTop: 40 }}>
                <button className="btn-secondary" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--r-md)", padding: "12px 32px", color: "var(--fg)" }} onClick={() => { setStep(2); setResult(null); }}>
                  ← Modify Parameters
                </button>
                <button className="btn-primary" style={{ padding: "12px 32px" }} onClick={() => window.print()}>
                  Export BOQ to PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </CalcShell>
  );
}
