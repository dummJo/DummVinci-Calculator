"use client";

import { useLang } from "@/lib/i18n";

interface Props {
  activeModuleId: string;
  /** Kept in the public signature for callsite stability — content reads from
   * the i18n bundle via useLang() internally. */
  lang: "en" | "id";
}

/**
 * Mock "instrument" panel: renders a different miniature visualisation per
 * active module (balancing vector / overall bars / FFT spectrum / gE envelope).
 * Stand-in for an actual SKF Microlog device screen so the learning surface
 * stays visually anchored as the user reads the module.
 */
export default function SkfMicrologVisualizer({ activeModuleId }: Props) {
  const { t } = useLang();

  const renderScreenContent = () => {
    switch (activeModuleId) {
      case "01": // Balancing Theory (Vector Diagram)
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 120" style={{ strokeLinecap: "round" }}>
            <circle cx="100" cy="60" r="40" fill="none" stroke="var(--muted)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="100" y1="60" x2="100" y2="20" stroke="var(--fg-soft)" strokeWidth="1" />
            <line x1="100" y1="60" x2="140" y2="60" stroke="var(--fg-soft)" strokeWidth="1" />
            {/* V0 Vector */}
            <line x1="100" y1="60" x2="130" y2="30" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
            <text x="135" y="25" fill="#ef4444" fontSize="8" fontFamily="var(--font-mono)">V0 (Ref)</text>
            {/* VT1 Vector */}
            <line x1="100" y1="60" x2="60" y2="40" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow-blue)" />
            <text x="45" y="35" fill="#3b82f6" fontSize="8" fontFamily="var(--font-mono)">VT1</text>
            <defs>
              <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill="#ef4444"/></marker>
              <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill="#3b82f6"/></marker>
            </defs>
          </svg>
        );
      case "02": // Severity (Overall Bars)
        return (
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: "100%", padding: "10px 20px" }}>
            {[2.1, 4.2, 7.8, 1.5, 3.0].map((val, i) => {
              const color = val > 7 ? "#ef4444" : val > 4.5 ? "#f59e0b" : val > 2.8 ? "#eab308" : "#22c55e";
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 8, color, fontFamily: "var(--font-mono)" }}>{val}</div>
                  <div style={{ width: 14, height: Math.min(val * 10, 80), background: color, borderRadius: "2px 2px 0 0", transition: "height 0.5s ease" }} />
                  <div style={{ fontSize: 8, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>CH{i+1}</div>
                </div>
              );
            })}
          </div>
        );
      case "05": // Analyzer Mode (FFT Spectrum)
      case "06": { // gE Enveloping
        const isGE = activeModuleId === "06";
        const color = isGE ? "#a855f7" : "#3b82f6";
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 120" preserveAspectRatio="none">
            <path d="M 0 30 L 200 30 M 0 60 L 200 60 M 0 90 L 200 90" stroke="var(--muted)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3"/>
            <path
              d={isGE
                ? "M 10 110 L 20 105 L 30 110 L 40 108 L 50 40 L 60 105 L 70 108 L 80 106 L 90 108 L 100 60 L 110 105 L 120 107 L 130 106 L 140 108 L 150 75 L 160 105 L 170 108 L 180 107 L 190 109"
                : "M 10 110 L 20 110 L 30 30 L 40 105 L 50 108 L 60 70 L 70 105 L 80 108 L 90 90 L 100 108 L 110 105 L 120 100"}
              fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"
            />
            {isGE && <text x="45" y="30" fill={color} fontSize="8" fontFamily="var(--font-mono)">{t.home.calcs.skfMicrolog.bpfo}</text>}
            {!isGE && <text x="25" y="20" fill={color} fontSize="8" fontFamily="var(--font-mono)">1x RPM</text>}
          </svg>
        );
      }
      default:
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--accent)" }}>
            <span style={{ fontSize: 24, animation: "spin 4s linear infinite" }}>⚙️</span>
          </div>
        );
    }
  };

  return (
    <div style={{
      background: "var(--bg)", borderRadius: 16, border: "2px solid var(--accent)",
      overflow: "hidden", marginBottom: 20, boxShadow: "var(--glass-shadow)",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{ background: "var(--accent)", color: "var(--bg)", padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>{t.home.calcs.skfMicrolog.headerTitle}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 4px #22c55e" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(0,0,0,0.3)" }} />
        </div>
      </div>
      <div style={{ background: "var(--bg-raised)", height: 140, position: "relative", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ position: "absolute", top: 4, left: 6, fontSize: 8, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          {t.home.calcs.skfMicrolog.modeLabel} {activeModuleId === "01" ? t.home.calcs.skfMicrolog.balancingMode : activeModuleId === "05" ? t.home.calcs.skfMicrolog.analyzerMode : activeModuleId === "06" ? t.home.calcs.skfMicrolog.envelopeMode : t.home.calcs.skfMicrolog.routeMode}
        </div>
        {renderScreenContent()}
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0", background: "var(--bg-deep)" }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ width: 24, height: 12, borderRadius: 4, background: "var(--muted)", opacity: 0.3 }} />
        ))}
      </div>
    </div>
  );
}
