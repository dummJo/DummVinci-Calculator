"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/lib/i18n";
import { MODULES, MODULE_TAGS } from "@/data/skf-microlog/modules";
import { GLASS } from "../_shared";
import ModuleCard from "../_components/ModuleCard";
import ModuleDetail from "../_components/ModuleDetail";

interface Props {
  lang: "en" | "id";
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

/**
 * Modules tab — either the interactive connection-graph + tag filter + module
 * card grid, or the long-form ModuleDetail when a module is selected.
 */
export default function TabModules({ lang, selectedId, setSelectedId }: Props) {
  const { t } = useLang();
  const [filterTag, setFilterTag] = useState<string>("ALL");

  const filtered = useMemo(() =>
    filterTag === "ALL" ? MODULES : MODULES.filter(m => m.tag === filterTag),
  [filterTag]);

  const selected = useMemo(() =>
    selectedId ? MODULES.find(m => m.id === selectedId) ?? null : null,
  [selectedId]);

  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelectedId(null)}
          style={{
            marginBottom: 16, padding: "6px 14px", borderRadius: 8, fontSize: 11,
            background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)",
            color: "var(--fg-soft)", cursor: "pointer", fontFamily: "var(--font-mono)",
          }}
        >
          ← {lang === "id" ? "Kembali ke daftar modul" : "Back to modules"}
        </button>
        <ModuleDetail mod={selected} lang={lang} />
      </div>
    );
  }

  return (
    <div>
      {/* Interactive Mindmap / Connection Graph */}
      <div style={{ ...GLASS, marginBottom: 24, background: "rgba(0, 0, 0, 0.2)", border: "1px dashed rgba(var(--accent-rgb),0.3)" }}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 16, textAlign: "center" }}>
          🗺️ {lang === "id" ? "Peta Hubungan Modul SKF (Interaktif)" : "SKF Module Connections Graph (Interactive)"}
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", position: "relative" }}>
          {/* Level 1: Foundation */}
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <GraphNode id="01" onClick={() => setSelectedId("01")} color="#3b82f6" icon="📐"
              tag={t.home.calcs.skfMicrolog.modTheory}
              title={lang === "id" ? "Dasar Vibrasi" : "Basic Vibration"} wide />
          </div>

          <div style={{ width: 2, height: 20, background: "rgba(255,255,255,0.15)" }} />

          {/* Level 2: Core Paths */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", maxWidth: 700 }}>
            <GraphNode id="02" onClick={() => setSelectedId("02")} color="#f59e0b" icon="📊"
              tag={t.home.calcs.skfMicrolog.modRef}
              title={lang === "id" ? "Tabel Severity" : "Severity & Charts"} />
            <GraphNode id="03" onClick={() => setSelectedId("03")} color="#22c55e" icon="🔬"
              tag={t.home.calcs.skfMicrolog.modTool3}
              title={lang === "id" ? "Analyzer dBX" : "dBX Analyzer"} />
            <GraphNode id="04" onClick={() => setSelectedId("04")} color="#22c55e" icon="⚖️"
              tag={t.home.calcs.skfMicrolog.modTool4}
              title={lang === "id" ? "Balancing dBX" : "dBX Balancing"} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", width: "70%", height: 20, borderTop: "2px solid rgba(255,255,255,0.1)", borderLeft: "2px solid rgba(255,255,255,0.1)", borderRight: "2px solid rgba(255,255,255,0.1)", position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, width: 2, height: 20, background: "rgba(255,255,255,0.1)", transform: "translateX(-50%)" }} />
          </div>

          {/* Level 3: SOP & Cheatsheets */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", maxWidth: 700 }}>
            <GraphNode id="05" onClick={() => setSelectedId("05")} color="#a855f7" icon="📋"
              tag={t.home.calcs.skfMicrolog.modSop5}
              title={lang === "id" ? "Template Velo" : "Velocity Temp."} />
            <GraphNode id="06" onClick={() => setSelectedId("06")} color="#a855f7" icon="🎯"
              tag={t.home.calcs.skfMicrolog.modSop6}
              title={lang === "id" ? "Template gE" : "gE Template"} />
            <GraphNode id="07" onClick={() => setSelectedId("07")} color="#ef4444" icon="⚡"
              tag={t.home.calcs.skfMicrolog.modCheat}
              title={lang === "id" ? "Pocket Guide" : "Balancing Pocket"} />
          </div>
        </div>
      </div>

      {/* Tag filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {["ALL", ...MODULE_TAGS].map(tag => (
          <button key={tag} onClick={() => { setFilterTag(tag); setSelectedId(null); }}
            style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 10, fontWeight: 700,
              fontFamily: "var(--font-mono)", cursor: "pointer",
              background: filterTag === tag ? "rgba(var(--accent-rgb),0.2)" : "rgba(255,255,255,0.04)",
              color: filterTag === tag ? "var(--accent)" : "var(--muted)",
              border: `1px solid ${filterTag === tag ? "rgba(var(--accent-rgb),0.3)" : "transparent"}`,
              transition: "all 0.2s ease",
            }}>{tag}</button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(mod => (
          <ModuleCard key={mod.id} mod={mod} isActive={false} onClick={() => setSelectedId(mod.id)} lang={lang} />
        ))}
      </div>
    </div>
  );
}

/** Helper button used by the connection graph. DRY-d out from 6 near-identical
 * inline blocks in the original file. */
function GraphNode({ onClick, color, icon, tag, title, wide }: {
  id: string; onClick: () => void; color: string; icon: string; tag: string; title: string; wide?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: wide ? "10px 16px" : "10px 10px",
        borderRadius: 10,
        background: `${color}22`,
        border: `${wide ? 2 : 1}px solid ${color}`,
        color,
        cursor: "pointer",
        textAlign: "center",
        transition: "transform 0.2s",
        width: wide ? 220 : undefined,
      }}
      onMouseOver={e => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      <span style={{ fontSize: wide ? 16 : 14, marginRight: wide ? 6 : 0 }}>{icon}</span>
      <div style={{ fontSize: wide ? 9 : 8, fontFamily: "var(--font-mono)", fontWeight: wide ? 700 : 400 }}>{tag}</div>
      <div style={{ fontSize: wide ? 12 : 11, fontWeight: 700, whiteSpace: wide ? undefined : "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
    </button>
  );
}
