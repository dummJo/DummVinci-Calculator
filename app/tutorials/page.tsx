"use client";

import { useState, useMemo } from "react";
import CalcShell from "@/components/calc/CalcShell";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────
type TutCategory = "voltage" | "megger" | "resistance" | "ground" | "current" | "rotation" | "diode" | "capacitor" | "contact" | "pi";

interface TutorialData {
  titleEn: string;
  steps: string[];
  stepsId: string[];
  nominal: string;
  nominalId: string;
  standard: string;
}

const tutData: Record<TutCategory, TutorialData> = {
  voltage: {
    titleEn: "Low Voltage AC/DC",
    steps: [
      "Select AC (~) or DC (-) mode on the multimeter.",
      "Ensure red probe is in VΩ jack, black probe in COM jack.",
      "For 3-Phase: measure L-L (L1↔L2) and L-N (L1↔Neutral).",
      "Touch probes to the two measurement points and read display.",
      "Keep hands behind probe finger guards at all times."
    ],
    stepsId: [
      "Pilih mode AC (~) atau DC (-) pada multitester.",
      "Pastikan probe merah di jack VΩ, probe hitam di jack COM.",
      "Untuk 3 Fasa: ukur L-L (L1↔L2) dan L-N (L1↔Netral).",
      "Tempelkan probe ke dua titik pengukuran dan baca layar.",
      "Selalu jaga tangan di belakang pelindung probe."
    ],
    nominal: "380–400 V (L-L) · 220–230 V (L-N)",
    nominalId: "380–400 V (L-L) · 220–230 V (L-N)",
    standard: "IEC 60038: Standard Voltages (±10% tolerance)"
  },
  megger: {
    titleEn: "Insulation Resistance (Megger)",
    steps: [
      "POWER OFF and LOCK OUT / TAG OUT the equipment.",
      "Disconnect all cables from VSDs / PLCs to avoid damage.",
      "Connect the EARTH terminal to the cable screen or ground.",
      "Connect the LINE terminal to the phase conductor.",
      "Apply test voltage (500 V for <1 kV cables, 1000 V for MV).",
      "Hold for 60 seconds and read the MΩ value.",
      "DISCHARGE the cable to ground for ≥ 4× test time after testing."
    ],
    stepsId: [
      "MATIKAN daya dan lakukan LOTO (Lock Out / Tag Out).",
      "Lepas semua kabel dari VSD / PLC untuk menghindari kerusakan.",
      "Hubungkan terminal EARTH ke screen kabel atau tanah.",
      "Hubungkan terminal LINE ke konduktor fasa.",
      "Terapkan tegangan uji (500 V untuk kabel <1 kV, 1000 V untuk MV).",
      "Tahan 60 detik dan baca nilai MΩ.",
      "DISCHARGE kabel ke tanah selama ≥ 4× waktu uji setelah selesai."
    ],
    nominal: "> 1.0 MΩ (minimum) · > 100 MΩ for new LV cables",
    nominalId: "> 1,0 MΩ (minimum) · > 100 MΩ untuk kabel baru",
    standard: "IEC 60364-6 / IEEE 43 / NETA ATS: 1 MΩ per 1000 V operating voltage"
  },
  resistance: {
    titleEn: "Continuity & Winding Resistance",
    steps: [
      "POWER OFF the circuit completely.",
      "Set multimeter to Ω (resistance) or continuity (buzzer) mode.",
      "Zero the leads by touching them together and noting offset.",
      "For motor windings: measure U1–U2, V1–V2, W1–W2.",
      "All three phases should be within 5% of each other.",
      "For fuse check: < 1 Ω is good, OL means fuse is blown."
    ],
    stepsId: [
      "MATIKAN daya sepenuhnya.",
      "Atur multitester ke mode Ω (hambatan) atau kontinuitas (buzzer).",
      "Nol-kan probe dengan menempel keduanya dan catat offset.",
      "Untuk belitan motor: ukur U1–U2, V1–V2, W1–W2.",
      "Ketiga fasa harus dalam rentang 5% satu sama lain.",
      "Untuk sekering: < 1 Ω = baik, OL = sekering putus."
    ],
    nominal: "Continuity < 2.0 Ω · Motor winding balance within 5%",
    nominalId: "Kontinuitas < 2,0 Ω · Keseimbangan belitan motor dalam 5%",
    standard: "IEEE 43 / IEC 60034-1"
  },
  ground: {
    titleEn: "Grounding / Earth Resistance",
    steps: [
      "Use a 3-pole earth resistance tester (Megger, Kyoritsu, etc.).",
      "Drive Current spike (C) and Potential spike (P) into soil.",
      "Place P at 62% of total distance from the Earth Electrode.",
      "Press TEST and inject AC current — read resistance in Ω.",
      "Alternative: clamp method for bonded ground ring measurement.",
      "Neutral-to-Earth voltage check: should be < 2 V (IEC 60364)."
    ],
    stepsId: [
      "Gunakan earth resistance tester 3-kutub (Megger, Kyoritsu, dll).",
      "Tancapkan spike Arus (C) dan spike Potensial (P) ke tanah.",
      "Letakkan P pada 62% jarak total dari Elektroda Tanah.",
      "Tekan TEST dan injeksikan arus AC — baca resistansi dalam Ω.",
      "Alternatif: metode clamp untuk pengukuran ground ring.",
      "Cek tegangan Netral-ke-Tanah: harus < 2 V (IEC 60364)."
    ],
    nominal: "< 5.0 Ω general · < 1.0 Ω substation / sensitive electronics",
    nominalId: "< 5,0 Ω umum · < 1,0 Ω gardu / elektronika sensitif",
    standard: "PUIL 2011 / IEC 60364 / IEEE 80 / NEC Article 250"
  },
  current: {
    titleEn: "Current Clamp Measurement",
    steps: [
      "Set Clamp Meter to A~ (AC Amps).",
      "Open the clamp jaws and enclose only ONE conductor.",
      "Ensure the jaws are fully closed around the wire.",
      "Measure current for each phase (L1, L2, L3).",
      "Check for current imbalance between phases."
    ],
    stepsId: [
      "Atur Clamp Meter ke A~ (AC Amps).",
      "Buka rahang clamp dan lingkari hanya SATU konduktor.",
      "Pastikan rahang tertutup sempurna di sekitar kabel.",
      "Ukur arus untuk setiap fasa (L1, L2, L3).",
      "Cek ketidakseimbangan arus antar fasa."
    ],
    nominal: "Phase imbalance < 5% · Within motor FLA rating",
    nominalId: "Ketidakseimbangan fasa < 5% · Dalam rating FLA motor",
    standard: "IEC 60034-1 / NETA MTS"
  },
  rotation: {
    titleEn: "Phase Rotation Check",
    steps: [
      "Use a Phase Rotation Tester or specialized multimeter.",
      "Connect L1, L2, L3 probes to the motor supply terminals.",
      "Wait for the indicator (Clockwise / Counter-Clockwise).",
      "Ensure rotation matches the intended motor direction.",
      "Swap any two phases if the rotation needs to be reversed."
    ],
    stepsId: [
      "Gunakan Phase Rotation Tester atau multitester khusus.",
      "Hubungkan probe L1, L2, L3 ke terminal suplai motor.",
      "Tunggu indikator (Clockwise / Counter-Clockwise).",
      "Pastikan rotasi sesuai dengan arah motor yang diinginkan.",
      "Tukar dua fasa apa saja jika rotasi perlu dibalik."
    ],
    nominal: "L1-L2-L3 Clockwise (standard industrial direction)",
    nominalId: "L1-L2-L3 Searah jarum jam (standar industri)",
    standard: "IEC 60034-8 / IEC 61557-7"
  },
  diode: {
    titleEn: "Diode / IGBT Module Test",
    steps: [
      "POWER OFF and discharge VSD DC bus for 15+ minutes.",
      "Set Multimeter to Diode Test mode (->|-).",
      "Measure across bridge rectifiers (Phase to DC+ and Phase to DC-).",
      "Note the forward voltage drop (usually 0.3V to 0.7V).",
      "Check reverse bias: should show OL (Open Loop).",
      "Short circuit (0.00V) or OL in both directions means failure."
    ],
    stepsId: [
      "MATIKAN daya dan buang muatan bus DC VSD selama 15+ menit.",
      "Atur Multitester ke mode Uji Dioda (->|-).",
      "Ukur pada penyearah jembatan (Fasa ke DC+ dan Fasa ke DC-).",
      "Catat penurunan tegangan maju (biasanya 0,3V hingga 0,7V).",
      "Cek bias balik: harus menunjukkan OL (Open Loop).",
      "Hubung singkat (0,00V) atau OL di kedua arah berarti kegagalan."
    ],
    nominal: "Forward: 0.3V–0.7V · Reverse: OL",
    nominalId: "Maju: 0,3V–0,7V · Balik: OL",
    standard: "ABB / Siemens Service Manuals"
  },
  capacitor: {
    titleEn: "Capacitor Value Check",
    steps: [
      "Discharge the capacitor safely before testing.",
      "Set multimeter to Capacitance (F) mode.",
      "Ensure capacitor is disconnected from the circuit.",
      "Place probes on capacitor terminals.",
      "Wait for the reading to stabilize and compare to nameplate."
    ],
    stepsId: [
      "Buang muatan kapasitor dengan aman sebelum pengujian.",
      "Atur multitester ke mode Kapasitansi (F).",
      "Pastikan kapasitor terlepas dari sirkuit.",
      "Tempelkan probe pada terminal kapasitor.",
      "Tunggu pembacaan stabil dan bandingkan dengan nameplate."
    ],
    nominal: "Within ±5% or ±10% of rated uF value",
    nominalId: "Dalam rentang ±5% atau ±10% dari nilai uF rating",
    standard: "IEC 60252-1 (Motor Capacitors)"
  },
  contact: {
    titleEn: "Contact Resistance Test",
    steps: [
      "Use a Micro-Ohmmeter (Ductor) with 10A–100A test current.",
      "Clean breaker / contactor contacts if possible.",
      "Connect current leads and potential leads (4-wire Kelvin).",
      "Inject current and read resistance in micro-ohms (μΩ).",
      "High resistance indicates pitted or carbonized contacts."
    ],
    stepsId: [
      "Gunakan Micro-Ohmmeter (Ductor) dengan arus uji 10A–100A.",
      "Bersihkan kontak breaker / kontaktor jika memungkinkan.",
      "Hubungkan kabel arus dan kabel potensial (4-kabel Kelvin).",
      "Injeksikan arus dan baca hambatan dalam mikro-ohm (μΩ).",
      "Hambatan tinggi menunjukkan kontak yang aus atau berkarbon."
    ],
    nominal: "Typically < 50 μΩ for large MCCBs / contactors",
    nominalId: "Tipikal < 50 μΩ untuk MCCB / kontaktor besar",
    standard: "IEC 60947-2 / NETA MTS"
  },
  pi: {
    titleEn: "Polarization Index (PI) Test",
    steps: [
      "Perform a 10-minute Megger insulation test.",
      "Record IR value at 1 minute and at 10 minutes.",
      "Calculate PI ratio = IR(10-min) / IR(1-min).",
      "High PI (> 2.0) indicates healthy, dry insulation.",
      "Low PI (< 1.5) suggests moisture or contamination."
    ],
    stepsId: [
      "Lakukan uji isolasi Megger selama 10 menit.",
      "Catat nilai IR pada menit ke-1 dan menit ke-10.",
      "Hitung rasio PI = IR(10 menit) / IR(1 menit).",
      "PI tinggi (> 2,0) menunjukkan isolasi yang sehat dan kering.",
      "PI rendah (< 1,5) menunjukkan adanya kelembapan atau kontaminasi."
    ],
    nominal: "> 2.0 (Good) · 1.0 to 1.5 (Questionable/Poor)",
    nominalId: "> 2,0 (Baik) · 1,0 hingga 1,5 (Diragukan/Buruk)",
    standard: "IEEE 43-2013"
  }
};

// ─── Animated SVG Probe Diagram ───────────────────────────────────────────────
function AnimatedProbes({ type, step }: { type: TutCategory, step: number }) {
  const reading = useMemo(() => {
    const readings = {
      voltage: ["0.0", "0.0", "398.2", "398.2", "398.2"],
      megger: ["OL", "OL", "OL", "OL", ">999", ">999", "0.0"],
      resistance: ["OL", "OL", "0.0", "0.5", "0.5", "0.1"],
      ground: ["—", "—", "—", "1.2", "1.2", "0.5"],
      current: ["0.0", "15.4", "15.4", "15.4", "15.4"],
      rotation: ["—", "—", "CW", "CW", "CW"],
      diode: ["OL", "OL", "OL", "0.54", "OL", "OL"],
      capacitor: ["—", "—", "—", "50.2", "50.2"],
      contact: ["—", "—", "—", "24.5", "24.5"],
      pi: ["—", "—", "—", "2.45", "2.45"]
    };
    return readings[type][step] || readings[type][readings[type].length - 1];
  }, [type, step]);

  return (
    <div style={{
      width: "100%", background: "rgba(0,0,0,0.55)", borderRadius: 12,
      border: "1px solid rgba(201,168,76,0.25)", overflow: "hidden",
      display: "flex", flexDirection: "column", boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
    }}>
      {/* Player header */}
      <div style={{ padding: "8px 16px", background: "rgba(201,168,76,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f44", display: "inline-block", boxShadow: "0 0 6px #f44", animation: "pulseRed 1.5s infinite" }} />
          LIVE SIMULATION • STEP {step + 1}
        </span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>INTERACTIVE GUIDE</span>
      </div>

      {/* SVG Container */}
      <svg width="100%" height="220" viewBox="0 0 320 200" fill="none">
        <defs>
          <style>{`
            @keyframes pulseRed { 0%,100%{opacity:1} 50%{opacity:0.25} }
            @keyframes dashMove { to { stroke-dashoffset: -20; } }
            .probe-red { stroke-dasharray: 6 4; transition: all 0.5s ease; }
            .probe-blk { stroke-dasharray: 6 4; transition: all 0.5s ease; }
            .reading-text { font-family: monospace; transition: all 0.3s ease; }
          `}</style>
        </defs>

        {/* ── Multimeter body ── */}
        <rect x="10" y="30" width="90" height="140" rx="8" stroke="#e4c759" strokeWidth="1.5" fill="rgba(228,199,89,0.08)" />
        <rect x="18" y="40" width="74" height="38" rx="3" fill="rgba(0,0,0,0.7)" stroke="#e4c759" strokeWidth="1" />
        <text x="55" y="65" fill="#e4c759" fontSize="14" textAnchor="middle" className="reading-text">{reading}</text>
        <circle cx="55" cy="120" r="18" stroke="#e4c759" strokeWidth="1.2" fill="rgba(0,0,0,0.4)" />
        <circle cx="55" cy="120" r="4" fill="#e4c759" />
        <circle cx="35" cy="155" r="4" fill="#f44" />
        <circle cx="55" cy="155" r="4" fill="#333" />

        {/* ── Dynamic Probes and Components ── */}
        {type === "voltage" && (
          <g>
            <rect x="200" y="40" width="80" height="100" rx="4" stroke="var(--fg)" fill="rgba(255,255,255,0.05)" />
            <circle cx="220" cy="60" r="4" fill="#f44" />
            <circle cx="260" cy="60" r="4" fill="#666" />
            <path d={`M35 155 Q 80 ${step > 1 ? 120 : 180} ${step > 1 ? 220 : 35} ${step > 1 ? 60 : 155}`} stroke="#f44" strokeWidth="2" fill="none" className="probe-red" />
            <path d={`M55 155 Q 100 ${step > 1 ? 130 : 190} ${step > 1 ? 260 : 55} ${step > 1 ? 60 : 155}`} stroke="#666" strokeWidth="2" fill="none" className="probe-blk" />
          </g>
        )}

        {type === "megger" && (
          <g>
            <rect x="180" y="50" width="100" height="80" rx="6" stroke="var(--fg)" fill="rgba(255,255,255,0.05)" />
            <line x1="230" y1="130" x2="230" y2="160" stroke="#0d0" strokeWidth="2" />
            <path d={`M35 155 Q 100 120 ${step > 2 ? 180 : 35} ${step > 2 ? 80 : 155}`} stroke="#f44" strokeWidth="2" fill="none" className="probe-red" />
            <path d={`M55 155 Q 120 160 ${step > 1 ? 230 : 55} ${step > 1 ? 160 : 155}`} stroke="#0d0" strokeWidth="2" fill="none" className="probe-blk" />
          </g>
        )}

        {type === "current" && (
          <g>
             <circle cx="240" cy="100" r="40" stroke="#555" strokeWidth="8" fill="none" />
             <path d={`M35 155 Q 150 180 ${step > 0 ? 240 : 35} ${step > 0 ? 100 : 155}`} stroke="#e4c759" strokeWidth="4" fill="none" className="probe-red" strokeLinecap="round" />
             <text x="240" y="105" fill="var(--muted)" fontSize="10" textAnchor="middle">CABLE</text>
          </g>
        )}

        {type === "rotation" && (
          <g>
            <rect x="200" y="50" width="80" height="100" rx="8" stroke="var(--fg)" fill="rgba(255,255,255,0.05)" />
            <circle cx="220" cy="70" r="3" fill="#f44" />
            <circle cx="240" cy="70" r="3" fill="#e4c759" />
            <circle cx="260" cy="70" r="3" fill="#3498db" />
            <path d={`M35 155 Q 100 120 ${step > 0 ? 220 : 35} ${step > 0 ? 70 : 155}`} stroke="#f44" strokeWidth="1" fill="none" />
            <path d={`M55 155 Q 120 130 ${step > 0 ? 240 : 55} ${step > 0 ? 70 : 155}`} stroke="#e4c759" strokeWidth="1" fill="none" />
            <path d={`M75 155 Q 140 140 ${step > 0 ? 260 : 75} ${step > 0 ? 70 : 155}`} stroke="#3498db" strokeWidth="1" fill="none" />
          </g>
        )}

        {/* Fallback component icon for others */}
        {(type !== "voltage" && type !== "megger" && type !== "current" && type !== "rotation") && (
          <g transform="translate(200, 60)">
             <rect x="0" y="0" width="80" height="80" rx="10" stroke="var(--accent)" strokeDasharray="4 4" />
             <text x="40" y="45" fill="var(--muted)" fontSize="10" textAnchor="middle">{type.toUpperCase()}</text>
             <circle cx="20" cy="60" r="4" fill="#f44" />
             <circle cx="60" cy="60" r="4" fill="#666" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const TAB_KEYS: TutCategory[] = ["voltage", "megger", "resistance", "ground", "current", "rotation", "diode", "capacitor", "contact", "pi"];

export default function TutorialsPage() {
  const { t, lang } = useLang();
  const tt = t.tutorials;

  const [activeTab, setActiveTab] = useState<TutCategory>("voltage");
  const [currentStep, setCurrentStep] = useState(0);

  const data = tutData[activeTab];

  const handleTabChange = (key: TutCategory) => {
    setActiveTab(key);
    setCurrentStep(0);
  };

  const steps = lang === "id" ? data.stepsId : data.steps;
  const nominal = lang === "id" ? data.nominalId : data.nominal;

  return (
    <CalcShell label="Tutorials" title={tt.title} subtitle={tt.subtitle} concept={tt.concept}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, borderBottom: "1px solid var(--glass-border)" }}>
          {TAB_KEYS.map(key => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                background: activeTab === key ? "var(--accent)" : "transparent",
                color: activeTab === key ? "#000" : "var(--fg)",
                border: "1px solid",
                borderColor: activeTab === key ? "var(--accent)" : "var(--glass-border)",
                cursor: "pointer",
                fontWeight: activeTab === key ? 700 : 400,
                fontSize: 13,
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {(tt as Record<string, string>)[key] || key}
            </button>
          ))}
        </div>

        {/* Animation Display */}
        <AnimatedProbes type={activeTab} step={currentStep} />

        {/* Step Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--glass-border)" }}>
           <button 
             disabled={currentStep === 0}
             onClick={() => setCurrentStep(prev => prev - 1)}
             style={{ background: "none", border: "none", color: currentStep === 0 ? "var(--muted)" : "var(--accent)", cursor: "pointer", fontWeight: 700 }}>
             ← {lang === "id" ? "Kembali" : "Previous"}
           </button>
           <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)" }}>
             {currentStep + 1} / {steps.length}
           </span>
           <button 
             disabled={currentStep === steps.length - 1}
             onClick={() => setCurrentStep(prev => prev + 1)}
             style={{ background: "none", border: "none", color: currentStep === steps.length - 1 ? "var(--muted)" : "var(--accent)", cursor: "pointer", fontWeight: 700 }}>
             {lang === "id" ? "Lanjut" : "Next"} →
           </button>
        </div>

        {/* Instructions Content */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--glass-border)",
          borderRadius: 10,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: 0, color: "var(--accent)" }}>
             {lang === "id" ? (tt as Record<string, string>)[activeTab] || activeTab : data.titleEn}
          </h3>

          <div>
             <h4 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 12, fontFamily: "var(--font-mono)" }}>
               {tt.steps}
             </h4>
             <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
               {steps.map((s, i) => (
                 <div key={i} 
                   onClick={() => setCurrentStep(i)}
                   style={{ 
                     padding: "12px 16px", 
                     borderRadius: 8, 
                     background: currentStep === i ? "rgba(228,199,89,0.15)" : "transparent",
                     border: "1px solid",
                     borderColor: currentStep === i ? "var(--accent)" : "transparent",
                     cursor: "pointer",
                     transition: "all 0.2s",
                     display: "flex",
                     gap: 12,
                     alignItems: "flex-start"
                   }}>
                    <span style={{ 
                      width: 22, height: 22, borderRadius: "50%", 
                      background: currentStep === i ? "var(--accent)" : "rgba(255,255,255,0.1)",
                      color: currentStep === i ? "#000" : "var(--fg)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ color: currentStep === i ? "var(--fg)" : "var(--fg-soft)", fontSize: 14, lineHeight: 1.5 }}>{s}</span>
                 </div>
               ))}
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
             <div style={{ background: "rgba(228,199,89,0.08)", padding: 16, borderRadius: 10, border: "1px solid rgba(228,199,89,0.2)" }}>
                <h4 style={{ fontSize: 10, textTransform: "uppercase", color: "var(--accent)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>{tt.nominal}</h4>
                <p style={{ margin: 0, fontSize: 13, color: "var(--fg)", fontWeight: 600 }}>{nominal}</p>
             </div>
             <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 10, border: "1px solid var(--glass-border)" }}>
                <h4 style={{ fontSize: 10, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>{tt.standard}</h4>
                <p style={{ margin: 0, fontSize: 12, color: "var(--fg-soft)" }}>{data.standard}</p>
             </div>
          </div>
        </div>

        {/* Language specific category label fallback */}
        {lang === "id" && (
           <div style={{ textAlign: "center", opacity: 0.5, fontSize: 10, fontFamily: "var(--font-mono)" }}>
             {activeTab === "pi" ? "Lakukan pengukuran IR pada menit ke-1 dan ke-10." : ""}
           </div>
        )}

      </div>
      <Footer />
    </CalcShell>
  );
}
