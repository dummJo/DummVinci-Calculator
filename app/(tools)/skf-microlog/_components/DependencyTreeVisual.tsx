"use client";

import { getTagColor } from "../_shared";

interface Props {
  lang: "en" | "id";
  onSelectModule: (id: string) => void;
}

const NODES = [
  { id: "01", x: "50%",   y: "40px",  icon: "📐", tag: "THEORY",      labelEn: "Basic Vibration",  labelId: "Dasar Vibrasi"  },
  { id: "02", x: "15%",   y: "150px", icon: "📊", tag: "REFERENCE",   labelEn: "Severity & Charts", labelId: "Tabel Severity" },
  { id: "03", x: "50%",   y: "150px", icon: "🔬", tag: "TOOL",        labelEn: "dBX Analyzer",     labelId: "Analyzer dBX"   },
  { id: "04", x: "85%",   y: "150px", icon: "⚖️", tag: "TOOL",        labelEn: "dBX Balancing",    labelId: "Balancing dBX"  },
  { id: "05", x: "32.5%", y: "260px", icon: "📋", tag: "SOP",         labelEn: "Velocity Temp.",   labelId: "Template Velo"  },
  { id: "06", x: "67.5%", y: "260px", icon: "🎯", tag: "SOP",         labelEn: "gE Template",      labelId: "Template gE"    },
  { id: "07", x: "85%",   y: "260px", icon: "⚡", tag: "CHEAT SHEET", labelEn: "Pocket Guide",     labelId: "Pocket Guide"   },
];

/**
 * Static SVG tree showing the seven SKF modules and their prerequisite arrows.
 * Click any node to jump to that module via the parent's onSelectModule.
 *
 * Known limitation (Agent 5 finding): the 720x320 viewport is fixed-pixel;
 * connection-line endpoints are hard-coded for that size and will not scale
 * to a phone viewport. Tracked separately — out of scope for this refactor.
 */
export default function DependencyTreeVisual({ lang, onSelectModule }: Props) {
  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto", padding: "10px 0" }}>
      <style>{`
        @keyframes tree-flow-anim { to { stroke-dashoffset: -20; } }
        .flow-path        { stroke: rgba(255,255,255,0.1); stroke-width: 2; fill: none; }
        .flow-path-active { stroke: var(--accent); stroke-width: 2; stroke-dasharray: 6, 4; fill: none; animation: tree-flow-anim 1.5s linear infinite; opacity: 0.7; }
        .node-btn         { position: absolute; transform: translate(-50%, -50%); width: 130px; padding: 8px 6px; border-radius: 12px; background: var(--glass-bg); border: 1px solid var(--glass-border); cursor: pointer; transition: all 0.3s ease; text-align: center; z-index: 2; }
        .node-btn:hover   { transform: translate(-50%, -50%) scale(1.05); border-color: var(--accent); box-shadow: 0 0 15px rgba(var(--accent-rgb),0.3); }
      `}</style>

      <div style={{ position: "relative", width: 720, height: 320, margin: "0 auto" }}>
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
          {[
            "M 360 40 L 108 150",  // 01 → 02
            "M 360 40 L 360 150",  // 01 → 03
            "M 360 40 L 612 150",  // 01 → 04
            "M 360 150 L 234 260", // 03 → 05
            "M 360 150 L 486 260", // 03 → 06
            "M 612 150 L 612 260", // 04 → 07
          ].flatMap((d, i) => [
            <path key={`b${i}`} d={d} className="flow-path" />,
            <path key={`a${i}`} d={d} className="flow-path-active" />,
          ])}
        </svg>

        {NODES.map(n => {
          const label = lang === "id" ? n.labelId : n.labelEn;
          const tagColor = getTagColor(n.tag);
          return (
            <button key={n.id} className="node-btn" style={{ left: n.x, top: n.y }} onClick={() => onSelectModule(n.id)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 2 }}>
                <span style={{ fontSize: 12 }}>{n.icon}</span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700,
                  padding: "1px 5px", borderRadius: 4,
                  background: `${tagColor}22`, color: tagColor,
                }}>{n.id}</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--fg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
              <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "var(--muted)", marginTop: 2 }}>{n.tag}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
