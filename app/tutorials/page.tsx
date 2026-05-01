"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";

// Data Structure
type TutCategory = "voltage" | "megger" | "resistance" | "ground";

const tutData: Record<TutCategory, {
  id: string;
  title: string;
  steps: string[];
  nominal: string;
  standard: string;
}> = {
  voltage: {
    id: "voltage",
    title: "Low Voltage AC/DC",
    steps: [
      "Select AC (~) or DC (-) mode on the multimeter.",
      "Ensure probes are in the VΩ and COM jacks.",
      "For 3-Phase, measure L-L (e.g., L1-L2) and L-N (e.g., L1-Neutral).",
      "Keep hands behind probe guards."
    ],
    nominal: "380V-400V (L-L), 220V-230V (L-N)",
    standard: "IEC 60038: Standard Voltages (+/- 10% tolerance)"
  },
  megger: {
    id: "megger",
    title: "Insulation Resistance (Megger)",
    steps: [
      "POWER OFF and LOCK OUT the equipment.",
      "Disconnect cables from VSDs/electronics to avoid damage.",
      "Connect one probe to Ground, the other to the Phase conductor.",
      "Apply test voltage (e.g., 500V or 1000V) for 1 minute.",
      "Discharge the cable safely after testing."
    ],
    nominal: "> 1.0 MΩ for Low Voltage. Ideally > 100 MΩ for new cables.",
    standard: "IEC 60364-6 / NETA ATS: 1 MΩ minimum per 1000V operating voltage."
  },
  resistance: {
    id: "resistance",
    title: "Continuity & Winding Resistance",
    steps: [
      "POWER OFF the circuit.",
      "Set multimeter to Resistance (Ω) or Continuity (Buzzer) mode.",
      "Measure across motor windings (U1-U2, V1-V2, W1-W2) or fuse links.",
      "Values across 3 phases should be balanced within 5%."
    ],
    nominal: "Continuity < 2.0 Ω. Winding resistance varies by motor size (usually single digits).",
    standard: "IEEE 43 / IEC 60034"
  },
  ground: {
    id: "ground",
    title: "Grounding / Earth Resistance",
    steps: [
      "Use an Earth Resistance Tester (3-pole or clamp method).",
      "For 3-pole: Drive auxiliary spikes at 62% distance.",
      "Inject current and measure voltage drop.",
      "For simple checks, measure neutral-to-earth voltage (should be near 0V)."
    ],
    nominal: "< 5.0 Ω for general installations, < 1.0 Ω for sensitive electronics / substations.",
    standard: "PUIL / IEEE 80 / NEC Article 250"
  }
};

function AnimatedProbes({ type }: { type: TutCategory }) {
  // SVG Animation logic based on type
  return (
    <div style={{ width: "100%", background: "rgba(0,0,0,0.5)", borderRadius: 12, border: "1px solid rgba(201,168,76,0.2)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
      {/* Video Player Header */}
      <div style={{ padding: "8px 16px", background: "rgba(201,168,76,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "red", boxShadow: "0 0 5px red", animation: "pulseRed 1.5s infinite" }} />
          LIVE SIMULATION
        </span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>0:00 / ∞ LOOP</span>
      </div>
      <div style={{ width: "100%", height: 220, position: "relative" }}>
        <svg width="100%" height="100%" viewBox="0 0 300 200" fill="none" stroke="currentColor">
        {/* The Multimeter Body */}
        <rect x="20" y="50" width="80" height="120" rx="8" stroke="var(--accent)" strokeWidth="2" fill="rgba(201,168,76,0.1)" />
        <rect x="30" y="60" width="60" height="30" rx="4" stroke="var(--accent)" fill="rgba(0,0,0,0.5)" />
        <circle cx="60" cy="120" r="15" stroke="var(--accent)" />
        <text x="60" y="80" fill="var(--accent)" fontSize="12" textAnchor="middle" fontFamily="monospace">
          {type === "voltage" ? "398.2" : type === "megger" ? ">999" : type === "ground" ? "1.2" : "0.5"}
        </text>

        {/* The Component Under Test */}
        {type === "voltage" && (
          <g transform="translate(180, 80)">
            <rect x="0" y="0" width="80" height="60" rx="4" stroke="var(--fg)" />
            <circle cx="20" cy="20" r="4" fill="var(--fg)" />
            <circle cx="60" cy="20" r="4" fill="var(--fg)" />
            <text x="40" y="45" fill="var(--fg)" fontSize="10" textAnchor="middle">Breaker</text>
            <path d="M60 140 Q 120 180 200 100" stroke="red" strokeWidth="2" fill="none" className="probe-red" strokeDasharray="5 5">
              <animate attributeName="d" values="M70 150 Q 100 100 70 150; M70 150 Q 120 150 200 100" dur="1s" fill="freeze" />
            </path>
            <path d="M50 140 Q 100 160 240 100" stroke="black" strokeWidth="2" fill="none" className="probe-blk">
               <animate attributeName="d" values="M50 150 Q 80 120 50 150; M50 150 Q 100 120 240 100" dur="1s" fill="freeze" />
            </path>
          </g>
        )}
        {type === "megger" && (
          <g transform="translate(180, 60)">
            <rect x="0" y="0" width="60" height="100" rx="8" stroke="var(--fg)" />
            <text x="30" y="55" fill="var(--fg)" fontSize="10" textAnchor="middle">Motor</text>
            <line x1="30" y1="100" x2="30" y2="130" stroke="green" strokeWidth="2" />
            <circle cx="30" cy="130" r="4" fill="green" />
            <path d="M70 150 Q 120 150 210 60" stroke="red" strokeWidth="2" fill="none" />
            <path d="M50 150 Q 100 160 210 190" stroke="black" strokeWidth="2" fill="none" />
          </g>
        )}
        {type === "resistance" && (
          <g transform="translate(160, 90)">
            <path d="M0 20 Q 10 0 20 20 T 40 20 T 60 20 T 80 20" stroke="var(--fg)" strokeWidth="3" fill="none" />
            <text x="40" y="50" fill="var(--fg)" fontSize="10" textAnchor="middle">Coil</text>
            <path d="M70 150 Q 120 150 160 110" stroke="red" strokeWidth="2" fill="none" />
            <path d="M50 150 Q 100 160 240 110" stroke="black" strokeWidth="2" fill="none" />
          </g>
        )}
        {type === "ground" && (
          <g transform="translate(150, 100)">
            <line x1="0" y1="50" x2="120" y2="50" stroke="var(--fg)" strokeWidth="1" strokeDasharray="4 4" />
            <rect x="20" y="10" width="10" height="60" fill="rgba(201,168,76,0.5)" />
            <rect x="80" y="10" width="10" height="60" fill="rgba(201,168,76,0.5)" />
            <path d="M70 150 Q 120 120 175 110" stroke="red" strokeWidth="2" fill="none" />
            <path d="M50 150 Q 100 120 235 110" stroke="black" strokeWidth="2" fill="none" />
          </g>
        )}
      </svg>
      {/* CSS Animation Styles */}
      <style>{`
        .probe-red { animation: probeMove 2s ease-in-out infinite alternate; }
        @keyframes probeMove {
          0% { stroke-dashoffset: 20; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulseRed {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
      </div>
    </div>
  );
}

export default function TutorialsPage() {
  const { t } = useLang();
  const tt = t.tutorials || {
    title: "Testing Tutorials", subtitle: "Multimeter & Insulation Test Guides", concept: "Learn standard procedures for taking electrical field measurements.",
    voltage: "Voltage", megger: "Megger", resistance: "Resistance", ground: "Grounding",
    steps: "Measurement Steps", nominal: "Nominal Values", standard: "Reference Standard"
  };

  const [activeTab, setActiveTab] = useState<TutCategory>("voltage");

  const data = tutData[activeTab];

  return (
    <CalcShell
      label="Tutorials"
      title={tt.title}
      subtitle={tt.subtitle}
      concept={tt.concept}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, borderBottom: "1px solid var(--glass-border)" }}>
          {(["voltage", "megger", "resistance", "ground"] as TutCategory[]).map(key => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                background: activeTab === key ? "var(--accent)" : "transparent",
                color: activeTab === key ? "#000" : "var(--fg)",
                border: "1px solid",
                borderColor: activeTab === key ? "var(--accent)" : "var(--glass-border)",
                cursor: "pointer",
                fontWeight: activeTab === key ? 600 : 400,
                whiteSpace: "nowrap",
                transition: "all 0.2s"
              }}
            >
              {tt[key] || tutData[key].title}
            </button>
          ))}
        </div>

        {/* Animation Box */}
        <AnimatedProbes type={activeTab} />

        {/* Info Box */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--r-md)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, color: "var(--accent)" }}>
            {data.title}
          </h3>

          <div>
            <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", margin: "0 0 12px 0" }}>{tt.steps}</h4>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.steps.map((step, i) => (
                <li key={i} style={{ color: "var(--fg)", lineHeight: 1.5 }}>{step}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: "rgba(201,168,76,0.1)", padding: 16, borderRadius: 8, border: "1px solid rgba(201,168,76,0.3)" }}>
            <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", margin: "0 0 8px 0" }}>{tt.nominal}</h4>
            <p style={{ margin: 0, color: "var(--fg)", lineHeight: 1.5 }}>{data.nominal}</p>
          </div>

          <div>
            <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", margin: "0 0 8px 0" }}>{tt.standard}</h4>
            <p style={{ margin: 0, color: "var(--fg)", fontSize: 14 }}>{data.standard}</p>
          </div>
        </div>

      </div>
      <Footer />
    </CalcShell>
  );
}
