"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────
type TutCategory = "voltage" | "megger" | "resistance" | "ground";

const tutData: Record<TutCategory, {
  titleEn: string;
  steps: string[];
  stepsId: string[];
  nominal: string;
  nominalId: string;
  standard: string;
}> = {
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
  }
};

// ─── Animated SVG Probe Diagram ───────────────────────────────────────────────
function AnimatedProbes({ type }: { type: TutCategory }) {
  const reading = { voltage: "398.2", megger: ">999", resistance: "0.5", ground: "1.2" }[type];

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
          LIVE SIMULATION
        </span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>∞ LOOP</span>
      </div>

      {/* SVG */}
      <svg width="100%" height="220" viewBox="0 0 320 200" fill="none">
        {/* CSS keyframes */}
        <defs>
          <style>{`
            @keyframes pulseRed { 0%,100%{opacity:1} 50%{opacity:0.25} }
            @keyframes dashMove { to { stroke-dashoffset: -20; } }
            @keyframes fadeIn { from{opacity:0} to{opacity:1} }
            .probe-red { animation: dashMove 1.2s linear infinite; stroke-dasharray: 6 4; }
            .probe-blk { animation: dashMove 1.2s linear infinite 0.4s; stroke-dasharray: 6 4; }
            .reading-blink { animation: pulseRed 2s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* ── Multimeter body ── */}
        <rect x="10" y="30" width="90" height="140" rx="8" stroke="#e4c759" strokeWidth="1.5" fill="rgba(228,199,89,0.08)" />
        {/* Screen */}
        <rect x="18" y="40" width="74" height="38" rx="3" fill="rgba(0,0,0,0.7)" stroke="#e4c759" strokeWidth="1" />
        <text x="55" y="65" fill="#e4c759" fontSize="14" textAnchor="middle" fontFamily="monospace" className="reading-blink">{reading}</text>
        {/* Rotary dial */}
        <circle cx="55" cy="120" r="18" stroke="#e4c759" strokeWidth="1.2" fill="rgba(0,0,0,0.4)" />
        <circle cx="55" cy="120" r="4" fill="#e4c759" />
        {/* Probe jacks */}
        <circle cx="35" cy="155" r="4" fill="#f44" stroke="#f44" />
        <circle cx="55" cy="155" r="4" fill="#333" stroke="#aaa" />
        <circle cx="75" cy="155" r="4" fill="#333" stroke="#666" />
        <text x="35" y="172" fill="#f44" fontSize="7" textAnchor="middle" fontFamily="monospace">VΩ</text>
        <text x="75" y="172" fill="#aaa" fontSize="7" textAnchor="middle" fontFamily="monospace">COM</text>

        {/* ── Component Under Test ── */}
        {type === "voltage" && (
          <g>
            {/* Breaker panel */}
            <rect x="200" y="40" width="100" height="120" rx="4" stroke="var(--fg)" strokeWidth="1.5" fill="rgba(255,255,255,0.04)" />
            <rect x="210" y="50" width="30" height="50" rx="2" fill="rgba(255,255,255,0.05)" stroke="#555" />
            <rect x="250" y="50" width="30" height="50" rx="2" fill="rgba(255,255,255,0.05)" stroke="#555" />
            <text x="250" y="140" fill="var(--muted)" fontSize="8" textAnchor="middle" fontFamily="monospace">L1 / L2</text>
            {/* Probe cables */}
            <path d="M35 155 Q 100 185 200 70" stroke="#f44" strokeWidth="2" fill="none" className="probe-red" />
            <path d="M75 155 Q 130 185 250 70" stroke="#ccc" strokeWidth="2" fill="none" className="probe-blk" />
            {/* Probe tips */}
            <circle cx="200" cy="70" r="3" fill="#f44" />
            <circle cx="250" cy="70" r="3" fill="#ccc" />
          </g>
        )}

        {type === "megger" && (
          <g>
            {/* Motor body */}
            <rect x="200" y="55" width="80" height="80" rx="6" stroke="var(--fg)" strokeWidth="1.5" fill="rgba(255,255,255,0.04)" />
            <circle cx="240" cy="95" r="22" stroke="#555" strokeDasharray="4 3" />
            {/* Ground spike */}
            <line x1="240" y1="135" x2="240" y2="160" stroke="#0d0" strokeWidth="2" />
            <line x1="228" y1="160" x2="252" y2="160" stroke="#0d0" strokeWidth="2" />
            <line x1="232" y1="165" x2="248" y2="165" stroke="#0d0" strokeWidth="1.5" />
            <line x1="236" y1="170" x2="244" y2="170" stroke="#0d0" strokeWidth="1" />
            <text x="240" y="95" fill="var(--muted)" fontSize="8" textAnchor="middle" fontFamily="monospace">Motor</text>
            {/* Probe cables */}
            <path d="M35 155 Q 100 170 200 75" stroke="#f44" strokeWidth="2" fill="none" className="probe-red" />
            <path d="M55 155 Q 120 175 240 135" stroke="#0d0" strokeWidth="2" fill="none" className="probe-blk" />
            <circle cx="200" cy="75" r="3" fill="#f44" />
          </g>
        )}

        {type === "resistance" && (
          <g>
            {/* Motor winding symbol */}
            <path d="M190 90 Q200 75 210 90 Q220 105 230 90 Q240 75 250 90 Q260 105 270 90 Q280 75 290 90" stroke="var(--fg)" strokeWidth="2" fill="none" />
            <text x="240" y="115" fill="var(--muted)" fontSize="8" textAnchor="middle" fontFamily="monospace">U1–U2 Winding</text>
            {/* Probe cables */}
            <path d="M35 155 Q 100 170 190 90" stroke="#f44" strokeWidth="2" fill="none" className="probe-red" />
            <path d="M75 155 Q 150 170 290 90" stroke="#ccc" strokeWidth="2" fill="none" className="probe-blk" />
            <circle cx="190" cy="90" r="3" fill="#f44" />
            <circle cx="290" cy="90" r="3" fill="#ccc" />
          </g>
        )}

        {type === "ground" && (
          <g>
            {/* Earth electrodes in soil */}
            <rect x="165" y="100" width="130" height="80" fill="rgba(139,90,43,0.15)" stroke="rgba(139,90,43,0.4)" strokeWidth="1" rx="2" />
            <text x="230" y="190" fill="rgba(139,90,43,0.8)" fontSize="8" textAnchor="middle" fontFamily="monospace">SOIL</text>
            {/* Main electrode */}
            <rect x="215" y="80" width="10" height="80" fill="rgba(228,199,89,0.6)" stroke="#e4c759" strokeWidth="1" />
            {/* C spike */}
            <rect x="270" y="95" width="8" height="60" fill="rgba(100,100,200,0.5)" stroke="#88f" strokeWidth="1" />
            <text x="274" y="92" fill="#88f" fontSize="7" textAnchor="middle" fontFamily="monospace">C</text>
            {/* P spike */}
            <rect x="180" y="105" width="8" height="50" fill="rgba(100,200,100,0.5)" stroke="#8d8" strokeWidth="1" />
            <text x="184" y="102" fill="#8d8" fontSize="7" textAnchor="middle" fontFamily="monospace">P</text>
            {/* Probe cables */}
            <path d="M35 155 Q 100 180 220 80" stroke="#f44" strokeWidth="2" fill="none" className="probe-red" />
            <path d="M75 155 Q 120 165 184 105" stroke="#8d8" strokeWidth="2" fill="none" className="probe-blk" />
            <circle cx="220" cy="80" r="3" fill="#f44" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const TAB_KEYS: TutCategory[] = ["voltage", "megger", "resistance", "ground"];

export default function TutorialsPage() {
  const { t, lang } = useLang();
  const tt = t.tutorials;

  const [activeTab, setActiveTab] = useState<TutCategory>("voltage");
  const data = tutData[activeTab];

  // pick translated tab label
  const tabLabel: Record<TutCategory, string> = {
    voltage:    tt.voltage,
    megger:     tt.megger,
    resistance: tt.resistance,
    ground:     tt.ground,
  };

  const steps  = lang === "id" ? data.stepsId  : data.steps;
  const nominal = lang === "id" ? data.nominalId : data.nominal;

  return (
    <CalcShell label="Tutorials" title={tt.title} subtitle={tt.subtitle} concept={tt.concept}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, borderBottom: "1px solid var(--glass-border)" }}>
          {TAB_KEYS.map(key => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
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
              {tabLabel[key]}
            </button>
          ))}
        </div>

        {/* Live Simulation Panel */}
        <AnimatedProbes type={activeTab} />

        {/* Info Box */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--glass-border)",
          borderRadius: 10,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, color: "var(--accent)" }}>
            {lang === "id" ? tabLabel[activeTab] : data.titleEn}
          </h3>

          {/* Steps */}
          <div>
            <h4 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", margin: "0 0 12px 0", fontFamily: "var(--font-mono)" }}>
              {tt.steps}
            </h4>
            <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {steps.map((step, i) => (
                <li key={i} style={{ color: "var(--fg)", lineHeight: 1.6, fontSize: 14 }}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Nominal */}
          <div style={{ background: "rgba(228,199,89,0.08)", padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(228,199,89,0.25)" }}>
            <h4 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", margin: "0 0 8px 0", fontFamily: "var(--font-mono)" }}>
              {tt.nominal}
            </h4>
            <p style={{ margin: 0, color: "var(--fg)", lineHeight: 1.6, fontFamily: "var(--font-mono)", fontSize: 14 }}>{nominal}</p>
          </div>

          {/* Standard */}
          <div>
            <h4 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", margin: "0 0 6px 0", fontFamily: "var(--font-mono)" }}>
              {tt.standard}
            </h4>
            <p style={{ margin: 0, color: "var(--fg-soft)", fontSize: 13, fontFamily: "var(--font-mono)" }}>{data.standard}</p>
          </div>
        </div>

      </div>
      <Footer />
    </CalcShell>
  );
}
