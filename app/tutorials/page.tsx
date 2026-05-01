"use client";

import { useState, useMemo, useEffect } from "react";
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
      "Identify measurement points (L1, L2, L3 or Neutral).",
      "Connect probes to points (e.g., L1 and L2 for phase-to-phase).",
      "Observe reading and verify against nominal system voltage."
    ],
    stepsId: [
      "Pilih mode AC (~) atau DC (-) pada multitester.",
      "Pastikan probe merah di jack VΩ, probe hitam di jack COM.",
      "Identifikasi titik pengukuran (L1, L2, L3 atau Netral).",
      "Hubungkan probe ke titik (misal, L1 dan L2 untuk fasa-ke-fasa).",
      "Amati pembacaan dan verifikasi terhadap tegangan sistem nominal."
    ],
    nominal: "380–400 V (L-L) · 220–230 V (L-N)",
    nominalId: "380–400 V (L-L) · 220–230 V (L-N)",
    standard: "IEC 60038: Standard Voltages (±10% tolerance)"
  },
  megger: {
    titleEn: "Insulation Resistance (Megger)",
    steps: [
      "Isolate equipment from power (LOTO).",
      "Disconnect sensitive electronics (VSD/PLC).",
      "Connect EARTH probe to ground/motor frame.",
      "Connect LINE probe to phase conductor.",
      "Apply test voltage and wait for 60-second stabilization.",
      "Discharge conductor to ground before touching."
    ],
    stepsId: [
      "Isolasi peralatan dari daya (LOTO).",
      "Lepas elektronik sensitif (VSD/PLC).",
      "Hubungkan probe EARTH ke ground/frame motor.",
      "Hubungkan probe LINE ke konduktor fasa.",
      "Terapkan tegangan uji dan tunggu stabilisasi 60 detik.",
      "Buang muatan konduktor ke ground sebelum disentuh."
    ],
    nominal: "> 1.0 MΩ (min) · > 100 MΩ (new)",
    nominalId: "> 1,0 MΩ (min) · > 100 MΩ (baru)",
    standard: "IEC 60364-6 / IEEE 43"
  },
  resistance: {
    titleEn: "Winding Resistance",
    steps: [
      "Set to Low Resistance (Ω) mode.",
      "Measure U1-U2, V1-V2, and W1-W2.",
      "Compare values; they should be balanced.",
      "Verify continuity across fuse/terminals."
    ],
    stepsId: [
      "Atur ke mode Hambatan Rendah (Ω).",
      "Ukur U1-U2, V1-V2, dan W1-W2.",
      "Bandingkan nilai; harus seimbang.",
      "Verifikasi kontinuitas pada sekering/terminal."
    ],
    nominal: "Balance within 5% · < 1Ω for continuity",
    nominalId: "Seimbang dalam 5% · < 1Ω untuk kontinuitas",
    standard: "IEC 60034-1"
  },
  ground: {
    titleEn: "Ground Resistance",
    steps: [
      "Set up 3-pole Earth Tester.",
      "Connect E to main ground rod.",
      "Place P spike at 62% distance.",
      "Place C spike at 100% distance.",
      "Execute test and record Ω."
    ],
    stepsId: [
      "Siapkan Earth Tester 3-kutub.",
      "Hubungkan E ke rod ground utama.",
      "Letakkan spike P pada jarak 62%.",
      "Letakkan spike C pada jarak 100%.",
      "Jalankan uji dan catat Ω."
    ],
    nominal: "< 5.0 Ω (standard) · < 1.0 Ω (sensitive)",
    nominalId: "< 5,0 Ω (standar) · < 1,0 Ω (sensitif)",
    standard: "PUIL / IEEE 80"
  },
  current: {
    titleEn: "Current Measurement",
    steps: [
      "Set Clamp Meter to A~.",
      "Identify the single core cable to measure.",
      "Clamp around ONLY ONE phase wire.",
      "Close jaws fully and read Amps."
    ],
    stepsId: [
      "Atur Clamp Meter ke A~.",
      "Identifikasi satu inti kabel yang akan diukur.",
      "Jepit hanya pada SATU kabel fasa.",
      "Tutup rahang sepenuhnya dan baca Amps."
    ],
    nominal: "Within Motor FLA rating",
    nominalId: "Dalam rating FLA Motor",
    standard: "IEC 60947"
  },
  rotation: {
    titleEn: "Phase Rotation",
    steps: [
      "Connect 3 probes to L1, L2, L3.",
      "Power up the terminal safely.",
      "Check CW/CCW rotation indicator.",
      "Swap 2 phases if direction is wrong."
    ],
    stepsId: [
      "Hubungkan 3 probe ke L1, L2, L3.",
      "Nyalakan terminal dengan aman.",
      "Cek indikator rotasi CW/CCW.",
      "Tukar 2 fasa jika arah salah."
    ],
    nominal: "Clockwise (CW) for standard pumps",
    nominalId: "Searah Jarum Jam (CW) untuk pompa standar",
    standard: "IEC 60034-8"
  },
  diode: {
    titleEn: "Diode/IGBT Test",
    steps: [
      "Discharge DC Bus (Check voltage < 5V).",
      "Set to Diode Test (->|-).",
      "Measure Forward (Phase to DC+).",
      "Measure Reverse (Phase to DC+).",
      "Verify 0.3-0.7V vs OL."
    ],
    stepsId: [
      "Buang muatan DC Bus (Cek tegangan < 5V).",
      "Atur ke Uji Dioda (->|-).",
      "Ukur Maju (Fasa ke DC+).",
      "Ukur Balik (Fasa ke DC+).",
      "Verifikasi 0,3-0,7V vs OL."
    ],
    nominal: "0.3V-0.7V Forward · OL Reverse",
    nominalId: "0,3V-0,7V Maju · OL Balik",
    standard: "VSD Service Guide"
  },
  capacitor: {
    titleEn: "Capacitor Test",
    steps: [
      "Discharge capacitor completely.",
      "Set Meter to Capacitance (F).",
      "Connect probes to terminals.",
      "Wait for uF reading to stabilize."
    ],
    stepsId: [
      "Buang muatan kapasitor sepenuhnya.",
      "Atur Meter ke Kapasitansi (F).",
      "Hubungkan probe ke terminal.",
      "Tunggu pembacaan uF stabil."
    ],
    nominal: "±5% of Nameplate value",
    nominalId: "±5% dari nilai Nameplate",
    standard: "IEC 60252"
  },
  contact: {
    titleEn: "Contact Resistance",
    steps: [
      "Clean contact surfaces.",
      "Connect 4-wire Kelvin leads.",
      "Inject 100A test current.",
      "Read uΩ (micro-ohms)."
    ],
    stepsId: [
      "Bersihkan permukaan kontak.",
      "Hubungkan kabel Kelvin 4-kawat.",
      "Injeksikan arus uji 100A.",
      "Baca uΩ (mikro-ohm)."
    ],
    nominal: "< 50 μΩ for large breakers",
    nominalId: "< 50 μΩ untuk breaker besar",
    standard: "NETA MTS"
  },
  pi: {
    titleEn: "Polarization Index",
    steps: [
      "Start 10-min IR Test.",
      "Record reading at 1 min.",
      "Record reading at 10 min.",
      "Calculate Ratio R10/R1."
    ],
    stepsId: [
      "Mulai Uji IR 10 menit.",
      "Catat pembacaan pada menit ke-1.",
      "Catat pembacaan pada menit ke-10.",
      "Hitung Rasio R10/R1."
    ],
    nominal: "> 2.0 (Good Condition)",
    nominalId: "> 2,0 (Kondisi Baik)",
    standard: "IEEE 43"
  }
};

// ─── Animated SVG Probe Diagram ───────────────────────────────────────────────
function AnimatedProbes({ type, step }: { type: TutCategory, step: number }) {
  const reading = useMemo(() => {
    const readings: Record<string, string[]> = {
      voltage: ["0.0", "0.0", "0.0", "398.5", "398.5"],
      megger: ["0.0", "0.0", "0.0", "0.0", ">999", "0.0"],
      resistance: ["OL", "0.0", "0.45", "0.45"],
      ground: ["0.0", "0.0", "0.0", "0.0", "1.25"],
      current: ["0.0", "0.0", "15.4", "15.4"],
      rotation: ["—", "—", "CW", "CW"],
      diode: ["0.0", "0.0", "0.54", "OL", "OL"],
      capacitor: ["0.0", "0.0", "0.0", "50.4"],
      contact: ["0.0", "0.0", "0.0", "24.2"],
      pi: ["0.0", "0.0", "240", "2.45"]
    };
    return readings[type][step] || readings[type][readings[type].length - 1];
  }, [type, step]);

  return (
    <div style={{
      width: "100%", background: "#000", borderRadius: 12,
      border: "1px solid var(--glass-border)", overflow: "hidden",
      position: "relative", height: 240, display: "flex", justifyContent: "center", alignItems: "center",
      boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)"
    }}>
      <div style={{ position: "absolute", top: 12, left: 16, display: "flex", alignItems: "center", gap: 8 }}>
         <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f44", boxShadow: "0 0 10px #f44", animation: "pulseRed 1.5s infinite" }} />
         <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700, letterSpacing: "0.1em" }}>LIVE SIMULATION</span>
      </div>

      <svg width="100%" height="100%" viewBox="0 0 320 200" fill="none">
        <defs>
          <style>{`
            @keyframes pulseRed { 0%,100%{opacity:1} 50%{opacity:0.3} }
            .cable { stroke-dasharray: 4 4; transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
            .meter-text { transition: all 0.3s ease; font-family: monospace; }
          `}</style>
        </defs>

        {/* Multimeter Body */}
        <rect x="20" y="40" width="80" height="130" rx="6" stroke="#e4c759" strokeWidth="1.5" fill="rgba(228,199,89,0.05)" />
        <rect x="28" y="50" width="64" height="32" rx="2" fill="#000" stroke="#e4c759" strokeWidth="1" />
        <text x="60" y="72" fill="#e4c759" fontSize="14" textAnchor="middle" className="meter-text">{reading}</text>
        <circle cx="60" cy="115" r="16" stroke="#e4c759" fill="rgba(0,0,0,0.5)" />
        <line x1="60" y1="115" x2="60" y2="105" stroke="#e4c759" strokeWidth="2" />
        
        {/* Terminals */}
        <circle cx="45" cy="150" r="4" fill="#f44" />
        <circle cx="75" cy="150" r="4" fill="#333" />

        {/* Dynamic Components based on type */}
        {type === "voltage" && (
          <g>
            <rect x="200" y="50" width="80" height="100" rx="4" stroke="var(--fg-soft)" strokeWidth="1" fill="rgba(255,255,255,0.02)" />
            <circle cx="220" cy="70" r="4" fill="#f44" opacity={step > 2 ? 1 : 0.2} />
            <circle cx="260" cy="70" r="4" fill="#333" opacity={step > 2 ? 1 : 0.2} />
            <path d={`M45 150 Q 120 180 ${step > 2 ? 220 : 45} ${step > 2 ? 70 : 150}`} stroke="#f44" strokeWidth="2" fill="none" className="cable" />
            <path d={`M75 150 Q 150 190 ${step > 2 ? 260 : 75} ${step > 2 ? 70 : 150}`} stroke="#ccc" strokeWidth="2" fill="none" className="cable" />
          </g>
        )}

        {type === "megger" && (
          <g>
             <circle cx="240" cy="100" r="30" stroke="var(--fg-soft)" strokeWidth="1.5" strokeDasharray="4 2" />
             <rect x="235" y="130" width="10" height="40" fill="#0d0" opacity={0.5} />
             <path d={`M45 150 Q 120 120 ${step > 2 ? 240 : 45} ${step > 2 ? 70 : 150}`} stroke="#f44" strokeWidth="2" fill="none" className="cable" />
             <path d={`M75 150 Q 150 180 ${step > 1 ? 240 : 75} ${step > 1 ? 130 : 150}`} stroke="#0d0" strokeWidth="2" fill="none" className="cable" />
          </g>
        )}

        {type === "current" && (
          <g>
            <circle cx="240" cy="100" r="45" stroke="#444" strokeWidth="8" fill="none" />
            <path d={`M45 150 Q 140 180 ${step > 1 ? 240 : 45} ${step > 1 ? 100 : 150}`} stroke="#e4c759" strokeWidth="4" fill="none" className="cable" strokeLinecap="round" />
          </g>
        )}

        {/* Fallback component visual */}
        {(type !== "voltage" && type !== "megger" && type !== "current") && (
          <g transform="translate(180, 60)">
             <rect x="0" y="0" width="100" height="80" rx="8" stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 4" fill="rgba(228,199,89,0.03)" />
             <text x="50" y="45" fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">{type.toUpperCase()} TEST</text>
             <circle cx="30" cy="65" r="3" fill="#f44" opacity={step > 1 ? 1 : 0.2} />
             <circle cx="70" cy="65" r="3" fill="#333" opacity={step > 1 ? 1 : 0.2} />
             <path d={`M-135 90 Q -50 130 ${step > 1 ? 30 : -135} ${step > 1 ? 65 : 90}`} stroke="#f44" strokeWidth="1.5" fill="none" className="cable" />
             <path d={`M-105 90 Q -20 140 ${step > 1 ? 70 : -105} ${step > 1 ? 65 : 90}`} stroke="#ccc" strokeWidth="1.5" fill="none" className="cable" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TutorialsPage() {
  const { t, lang } = useLang();
  const tt = t.tutorials;

  const [activeTab, setActiveTab] = useState<TutCategory>("voltage");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const data = tutData[activeTab];
  const steps = lang === "id" ? data.stepsId : data.steps;

  // Auto-play logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) return prev + 1;
          return 0; // loop back
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const handleCategoryChange = (key: TutCategory) => {
    setActiveTab(key);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const nextStep = () => setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
  const prevStep = () => setCurrentStep(prev => (prev > 0 ? prev - 1 : prev));

  return (
    <CalcShell label="Tutorials" title={tt.title} subtitle={tt.subtitle} concept={tt.concept}>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 32 }}>
        
        {/* LEFT SIDEBAR MENU */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
           <h4 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 12, marginLeft: 12 }}>Categories</h4>
           {(Object.keys(tutData) as TutCategory[]).map(key => (
             <button
               key={key}
               onClick={() => handleCategoryChange(key)}
               style={{
                 padding: "12px 16px",
                 borderRadius: 10,
                 background: activeTab === key ? "rgba(228,199,89,0.1)" : "transparent",
                 border: "1px solid",
                 borderColor: activeTab === key ? "var(--accent)" : "transparent",
                 color: activeTab === key ? "var(--accent)" : "var(--fg-soft)",
                 textAlign: "left",
                 fontSize: 14,
                 fontWeight: activeTab === key ? 700 : 400,
                 cursor: "pointer",
                 transition: "all 0.2s",
                 display: "flex",
                 alignItems: "center",
                 gap: 12
               }}
             >
               <div style={{ width: 4, height: 4, borderRadius: "50%", background: activeTab === key ? "var(--accent)" : "rgba(255,255,255,0.1)" }} />
               {(tt as Record<string, string>)[key] || key}
             </button>
           ))}
        </div>

        {/* RIGHT CONTENT AREA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
           
           {/* Visual Section */}
           <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
             <AnimatedProbes type={activeTab} step={currentStep} />
             
             {/* Animation Controls */}
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "10px 16px", borderRadius: 12, border: "1px solid var(--glass-border)" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                   <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: "var(--accent)", color: "#000", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
                   </button>
                   <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                      {isPlaying ? "AUTO-PLAY ACTIVE" : "MANUAL STEPPING"}
                   </span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                   <button onClick={prevStep} disabled={currentStep === 0} style={{ padding: 6, color: currentStep === 0 ? "#444" : "var(--accent)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>←</button>
                   <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--fg)", fontWeight: 700, width: 40, textAlign: "center" }}>{currentStep + 1} / {steps.length}</span>
                   <button onClick={nextStep} disabled={currentStep === steps.length - 1} style={{ padding: 6, color: currentStep === steps.length - 1 ? "#444" : "var(--accent)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>→</button>
                </div>
             </div>
           </div>

           {/* Detail Section */}
           <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                 <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0, color: "var(--accent)" }}>
                    {lang === "id" ? (tt as Record<string, string>)[activeTab] || activeTab : data.titleEn}
                 </h3>
                 <div>
                    <h5 style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 12, fontFamily: "var(--font-mono)" }}>Guide Steps</h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                       {steps.map((s, i) => (
                         <div 
                           key={i} 
                           onClick={() => { setCurrentStep(i); setIsPlaying(false); }}
                           style={{ 
                             padding: "12px 14px", 
                             borderRadius: 10, 
                             background: currentStep === i ? "rgba(228,199,89,0.15)" : "rgba(255,255,255,0.02)",
                             border: "1px solid",
                             borderColor: currentStep === i ? "var(--accent)" : "rgba(255,255,255,0.05)",
                             cursor: "pointer",
                             transition: "all 0.2s",
                             display: "flex",
                             gap: 12,
                             alignItems: "flex-start"
                           }}>
                            <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.5, marginTop: 2 }}>{i + 1}.</span>
                            <span style={{ fontSize: 14, color: currentStep === i ? "var(--fg)" : "var(--fg-soft)", lineHeight: 1.4 }}>{s}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                 <div style={{ padding: 20, background: "rgba(228,199,89,0.08)", borderRadius: 12, border: "1px solid rgba(228,199,89,0.2)" }}>
                    <h5 style={{ fontSize: 10, textTransform: "uppercase", color: "var(--accent)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>Nominal Target</h5>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--fg)" }}>{lang === "id" ? data.nominalId : data.nominal}</p>
                 </div>
                 <div style={{ padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid var(--glass-border)" }}>
                    <h5 style={{ fontSize: 10, textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>Reference Standard</h5>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--fg-soft)", lineHeight: 1.5 }}>{data.standard}</p>
                 </div>
                 <div style={{ marginTop: "auto", padding: 16, border: "1px dashed var(--glass-border)", borderRadius: 12, textAlign: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>
                       &quot;Precision is the foundation of safety.&quot;
                    </span>
                 </div>
              </div>
           </div>

        </div>

      </div>
      <Footer />

      <style jsx global>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 240px 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: 1.5fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </CalcShell>
  );
}
