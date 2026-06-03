"use client";

import { useState, useMemo } from "react";
import {
  DIAGNOSTIC_PATTERNS,
  DIAGNOSTIC_CATEGORIES,
  QUICK_DIAGNOSIS,
} from "@/data/skf-microlog/diagnostic-patterns";
import { QUICK_DIAGNOSIS_ID } from "@/data/skf-microlog/diagnostic-patterns-id";
import { GLASS, getDiagnosticPatternIdData } from "../_shared";

interface Props { lang: "en" | "id" }

// Indonesian category-label overlay (data file is English only).
const CAT_LABEL_ID: Record<string, string> = {
  "Unbalance":       "Ketidakseimbangan",
  "Eccentricity":    "Eksentrisitas",
  "Looseness":       "Kelonggaran",
  "Journal Bearing": "Bantalan Jurnal",
  "Bearing":         "Bantalan Gelinding",
  "Hydraulic":       "Hidrolik/Aliran",
  "Gear":            "Roda Gigi",
  "Electrical":      "Elektrikal Motor",
  "Belt":            "Sabuk/Puli",
  "Misalignment":    "Ketidaklurusan",
};

/** Diagnostic patterns explorer — Quick-diag shortcuts + filter + expandable cards. */
export default function TabDiagnostic({ lang }: Props) {
  const [filterCat, setFilterCat] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    filterCat === "ALL" ? DIAGNOSTIC_PATTERNS : DIAGNOSTIC_PATTERNS.filter(p => p.category === filterCat),
  [filterCat]);

  const quickDiag = lang === "id" ? QUICK_DIAGNOSIS_ID : QUICK_DIAGNOSIS;

  const handleQuickDiagClick = (targetId: string) => {
    const pattern = DIAGNOSTIC_PATTERNS.find(p => p.id === targetId);
    if (!pattern) return;
    setFilterCat(pattern.category);
    setExpandedId(targetId);
    setTimeout(() => {
      const el = document.getElementById(`pattern-card-${targetId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Quick Diagnosis */}
      <div style={{ ...GLASS, background: "rgba(var(--accent-rgb),0.04)", borderColor: "rgba(var(--accent-rgb),0.15)" }}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 12 }}>
          ⚡ {lang === "id" ? "Pencarian Cepat Diagnosis (Shortcut)" : "Quick Diagnosis Lookup (Shortcuts)"}
        </h4>
        <div style={{ display: "grid", gap: 6 }}>
          {quickDiag.map((d, i) => (
            <button key={i} onClick={() => handleQuickDiagClick(d.targetPatternId)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                borderRadius: 8, background: "rgba(0,0,0,0.2)", border: "1px solid transparent",
                cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.2s ease",
              }}
              className="hover-lift">
              <span style={{ flex: 1, fontSize: 12, color: "var(--fg-soft)", fontFamily: "var(--font-mono)" }}>{d.signature}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                {lang === "id" ? "Buka " : "Open "} {d.targetPatternId} →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["ALL", ...DIAGNOSTIC_CATEGORIES].map(cat => {
          const catLabel = lang === "id" ? (Reflect.get(CAT_LABEL_ID, cat) ?? cat) : cat;
          return (
            <button key={cat} onClick={() => setFilterCat(cat)}
              style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 10, fontWeight: 700,
                fontFamily: "var(--font-mono)", cursor: "pointer",
                background: filterCat === cat ? "rgba(var(--accent-rgb),0.2)" : "rgba(255,255,255,0.04)",
                color: filterCat === cat ? "var(--accent)" : "var(--muted)",
                border: `1px solid ${filterCat === cat ? "rgba(var(--accent-rgb),0.3)" : "transparent"}`,
              }}>{catLabel}</button>
          );
        })}
      </div>

      {/* Pattern Cards */}
      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map(p => {
          const isOpen = expandedId === p.id;
          const diagPatternIdData = getDiagnosticPatternIdData(p.id);
          const details = lang === "id" && diagPatternIdData
            ? diagPatternIdData
            : { name: p.name, spectrum: p.spectrum, phase: p.phase, correction: p.correction, standard: p.standard };

          return (
            <button key={p.id} id={`pattern-card-${p.id}`} onClick={() => setExpandedId(isOpen ? null : p.id)}
              style={{
                ...GLASS, padding: 14, width: "100%", textAlign: "left",
                cursor: "pointer", transition: "all 0.2s ease",
                borderColor: isOpen ? "var(--accent)" : "var(--glass-border)",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 800, color: "var(--accent)" }}>{p.id}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>{details.name}</span>
              </div>
              {isOpen && (
                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  <FieldRow label={lang === "id" ? "SPEKTRUM" : "SPECTRUM"} color="#3b82f6" value={details.spectrum} />
                  {p.phase !== "—" && <FieldRow label={lang === "id" ? "FASE" : "PHASE"} color="#a855f7" value={details.phase} />}
                  <FieldRow label={lang === "id" ? "LANGKAH PERBAIKAN" : "CORRECTION"} color="#22c55e" value={details.correction} />
                  {(details.standard || p.standard) && (
                    <FieldRow label={lang === "id" ? "STANDAR / REFERENSI" : "STANDARD / REFERENCE"} color="#eab308" value={String(details.standard ?? p.standard ?? "")} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FieldRow({ label, color, value }: { label: string; color: string; value: string }) {
  return (
    <div>
      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color }}>{label}</span>
      <p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "4px 0 0", lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}
