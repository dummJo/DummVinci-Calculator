"use client";
// app/(tools)/skf-microlog/page.tsx — SKF Microlog Learn
// Educational learning platform for PTTS vibration analysis team
import { useState, useMemo, useCallback, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import { MODULES, MODULE_TAGS } from "@/data/skf-microlog/modules";
import type { ModuleData } from "@/data/skf-microlog/modules";
import { SEVERITY_TABLE, SEVERITY_CATEGORIES } from "@/data/skf-microlog/severity";
import { DIAGNOSTIC_PATTERNS, DIAGNOSTIC_CATEGORIES, QUICK_DIAGNOSIS } from "@/data/skf-microlog/diagnostic-patterns";
import { LEARNING_GOALS, LEARNING_ITERATIONS, DEPENDENCY_TREE, CROSS_CUTTING_PITFALLS } from "@/data/skf-microlog/learning-paths";
import { getMachineSeverityZone, getGeneralSeverityZone, getBearingStage, getDiagnosticFlow, recommendGeFilter } from "@/lib/calc/skf-severity";

// ─── Tab Types ────────────────────────────────────────────────────────────────
type TabKey = "modules" | "severity" | "diagnostic" | "paths" | "tools";

const TABS: { key: TabKey; labelEn: string; labelId: string; icon: string }[] = [
  { key: "modules",    labelEn: "Modules",    labelId: "Modul",        icon: "📚" },
  { key: "severity",   labelEn: "Severity",   labelId: "Severity",     icon: "📊" },
  { key: "diagnostic", labelEn: "Diagnosis",  labelId: "Diagnosis",    icon: "🔍" },
  { key: "paths",      labelEn: "Paths",      labelId: "Jalur Belajar", icon: "🗺️" },
  { key: "tools",      labelEn: "Tools",      labelId: "Alat",         icon: "⚙️" },
];

// ─── Shared Styles ────────────────────────────────────────────────────────────
const GLASS = {
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
  padding: 20,
} as const;

const TAG_COLORS: Record<string, string> = {
  THEORY: "#3b82f6",
  REFERENCE: "#f59e0b",
  TOOL: "#22c55e",
  SOP: "#a855f7",
  "CHEAT SHEET": "#ef4444",
};

// ─── Module Card ──────────────────────────────────────────────────────────────
function ModuleCard({ mod, onClick, isActive }: { mod: ModuleData; onClick: () => void; isActive: boolean }) {
  return (
    <button
      onClick={onClick}
      id={`module-card-${mod.id}`}
      style={{
        ...GLASS,
        width: "100%",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.3s ease",
        borderColor: isActive ? "var(--accent)" : "var(--glass-border)",
        background: isActive ? "rgba(201,168,76,0.08)" : "var(--glass-bg)",
        transform: isActive ? "scale(1.01)" : "scale(1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 28 }}>{mod.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
              padding: "2px 8px", borderRadius: 6,
              background: `${TAG_COLORS[mod.tag] || "#666"}22`,
              color: TAG_COLORS[mod.tag] || "#666",
            }}>
              {mod.tag}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", opacity: 0.7 }}>
              FILE {mod.id}
            </span>
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--fg)", margin: "4px 0 0" }}>
            {mod.titleEn}
          </h3>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--fg-soft)", lineHeight: 1.5, margin: 0 }}>
        {mod.tldr.slice(0, 140)}…
      </p>
    </button>
  );
}

// ─── Module Detail ────────────────────────────────────────────────────────────
function ModuleDetail({ mod }: { mod: ModuleData }) {
  const [showRecall, setShowRecall] = useState(false);
  const [revealedQ, setRevealedQ] = useState<Set<number>>(new Set());

  const toggleReveal = useCallback((idx: number) => {
    setRevealedQ(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ ...GLASS, background: "rgba(201,168,76,0.06)", borderColor: "rgba(201,168,76,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 36 }}>{mod.icon}</span>
          <div>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
              padding: "2px 8px", borderRadius: 6,
              background: `${TAG_COLORS[mod.tag]}22`, color: TAG_COLORS[mod.tag],
            }}>{mod.tag}</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--accent)", margin: "4px 0 0" }}>
              {mod.titleEn}
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", margin: "2px 0 0" }}>{mod.titleId}</p>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "var(--fg-soft)", lineHeight: 1.6, margin: 0 }}>{mod.tldr}</p>
      </div>

      {/* Mental Model */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 10 }}>
          🧠 Mental Model
        </h4>
        <p style={{ fontSize: 14, color: "var(--fg-soft)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{mod.mentalModel}</p>
      </div>

      {/* Sections */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          📖 Key Sections ({mod.sections.length})
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mod.sections.map((s, i) => (
            <div key={i} style={{
              padding: 14, borderRadius: 12,
              background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
              border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", opacity: 0.6 }}>§{i + 1}</span>
                <h5 style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", margin: 0 }}>{s.title}</h5>
              </div>
              <p style={{ fontSize: 13, color: "var(--fg-soft)", lineHeight: 1.5, margin: 0 }}>{s.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Recall */}
      <div style={GLASS}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", margin: 0 }}>
            🧪 Active Recall ({mod.activeRecall.length})
          </h4>
          <button
            onClick={() => { setShowRecall(!showRecall); setRevealedQ(new Set()); }}
            style={{
              padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: showRecall ? "rgba(239,68,68,0.15)" : "rgba(201,168,76,0.15)",
              color: showRecall ? "#ef4444" : "var(--accent)",
              border: "none", cursor: "pointer", fontFamily: "var(--font-mono)",
            }}
          >
            {showRecall ? "HIDE" : "TEST YOURSELF"}
          </button>
        </div>
        {showRecall && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mod.activeRecall.map((q, i) => (
              <button
                key={i}
                onClick={() => toggleReveal(i)}
                style={{
                  textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer",
                  background: revealedQ.has(i) ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${revealedQ.has(i) ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`,
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", marginTop: 2, flexShrink: 0 }}>Q{i + 1}</span>
                  <span style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.5 }}>{q.q}</span>
                </div>
                {revealedQ.has(i) && q.hint && (
                  <div style={{ marginTop: 8, marginLeft: 24, fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)", opacity: 0.8 }}>
                    💡 {q.hint}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pitfalls */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ef4444", marginBottom: 14 }}>
          ⚠️ Common Pitfalls ({mod.pitfalls.length})
        </h4>
        <div style={{ display: "grid", gap: 8 }}>
          {mod.pitfalls.map((p, i) => (
            <div key={i} style={{ padding: 12, borderRadius: 10, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)", marginBottom: 4 }}>❌ {p.pitfall}</div>
              <div style={{ fontSize: 12, color: "#ef4444", opacity: 0.8, marginBottom: 4 }}>→ {p.consequence}</div>
              <div style={{ fontSize: 12, color: "#22c55e", opacity: 0.8 }}>✅ {p.prevention}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cheat Sheet */}
      <div style={{ ...GLASS, background: "rgba(59,130,246,0.04)", borderColor: "rgba(59,130,246,0.2)" }}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", marginBottom: 14 }}>
          📋 Cheat Sheet
        </h4>
        <pre style={{
          fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.6,
          color: "var(--fg-soft)", whiteSpace: "pre-wrap", wordBreak: "break-word",
          margin: 0, padding: 16, borderRadius: 10, background: "rgba(0,0,0,0.3)",
        }}>
          {mod.cheatSheet}
        </pre>
      </div>
    </div>
  );
}

// ─── Tab: Modules ─────────────────────────────────────────────────────────────
function TabModules() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>("ALL");

  const filtered = useMemo(() =>
    filterTag === "ALL" ? MODULES : MODULES.filter(m => m.tag === filterTag),
  [filterTag]);

  const selected = useMemo(() =>
    selectedId ? MODULES.find(m => m.id === selectedId) ?? null : null,
  [selectedId]);

  return (
    <div>
      {/* Tag filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {["ALL", ...MODULE_TAGS].map(tag => (
          <button
            key={tag}
            onClick={() => { setFilterTag(tag); setSelectedId(null); }}
            style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 10, fontWeight: 700,
              fontFamily: "var(--font-mono)", cursor: "pointer",
              background: filterTag === tag ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)",
              color: filterTag === tag ? "var(--accent)" : "var(--muted)",
              border: `1px solid ${filterTag === tag ? "rgba(201,168,76,0.3)" : "transparent"}`,
              transition: "all 0.2s ease",
            }}
          >{tag}</button>
        ))}
      </div>

      {selected ? (
        <div>
          <button
            onClick={() => setSelectedId(null)}
            style={{
              marginBottom: 16, padding: "6px 14px", borderRadius: 8, fontSize: 11,
              background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)",
              color: "var(--fg-soft)", cursor: "pointer", fontFamily: "var(--font-mono)",
            }}
          >← Back to modules</button>
          <ModuleDetail mod={selected} />
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map(mod => (
            <ModuleCard key={mod.id} mod={mod} isActive={false} onClick={() => setSelectedId(mod.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Severity ────────────────────────────────────────────────────────────
function TabSeverity() {
  const [velocityInput, setVelocityInput] = useState("");
  const [selectedCat, setSelectedCat] = useState(SEVERITY_CATEGORIES[0]);
  const [selectedSub, setSelectedSub] = useState("");
  const [geInput, setGeInput] = useState("");
  const [hasIsolator, setHasIsolator] = useState(false);
  const [hasGearbox, setHasGearbox] = useState(false);

  const filteredEntries = useMemo(() =>
    SEVERITY_TABLE.filter(e => e.category === selectedCat),
  [selectedCat]);

  useEffect(() => {
    if (filteredEntries.length > 0 && !filteredEntries.find(e => e.subType === selectedSub)) {
      setSelectedSub(filteredEntries[0].subType);
    }
  }, [filteredEntries, selectedSub]);

  const velocity = parseFloat(velocityInput);
  const ge = parseFloat(geInput);

  const machineResult = useMemo(() => {
    if (isNaN(velocity) || !selectedSub) return null;
    return getMachineSeverityZone(velocity, selectedSub, { isolator: hasIsolator, externalGearbox: hasGearbox });
  }, [velocity, selectedSub, hasIsolator, hasGearbox]);

  const generalResult = useMemo(() => {
    if (isNaN(velocity)) return null;
    return getGeneralSeverityZone(velocity);
  }, [velocity]);

  const bearingResult = useMemo(() => {
    if (isNaN(ge)) return null;
    return getBearingStage(ge);
  }, [ge]);

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
    background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)",
    color: "var(--fg)", fontFamily: "var(--font-mono)", outline: "none",
  } as const;

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
  } as const;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Machine-Specific Severity */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          📊 Machine-Specific Severity (Figure 13)
        </h4>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>MACHINE CATEGORY</label>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={selectStyle}>
              {SEVERITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>SUB-TYPE</label>
            <select value={selectedSub} onChange={e => setSelectedSub(e.target.value)} style={selectStyle}>
              {filteredEntries.map(e => <option key={e.subType} value={e.subType}>{e.subType}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>VELOCITY (mm/s RMS)</label>
            <input type="number" step="0.1" min="0" placeholder="e.g. 5.5" value={velocityInput} onChange={e => setVelocityInput(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "flex-end" }}>
            <label style={{ fontSize: 11, color: "var(--fg-soft)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={hasIsolator} onChange={e => setHasIsolator(e.target.checked)} /> Vibration Isolator (+40%)
            </label>
            <label style={{ fontSize: 11, color: "var(--fg-soft)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={hasGearbox} onChange={e => setHasGearbox(e.target.checked)} /> External Gearbox (+25%)
            </label>
          </div>
        </div>

        {machineResult && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: `${machineResult.color}11`, border: `1px solid ${machineResult.color}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: machineResult.color, boxShadow: `0 0 12px ${machineResult.color}` }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: machineResult.color }}>{machineResult.zone}</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "8px 0 0", lineHeight: 1.5 }}>{machineResult.label}</p>
            <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
              <span>Alarm 1: {machineResult.alarm1Adj.toFixed(1)} mm/s</span>
              <span>Alarm 2: {machineResult.alarm2Adj.toFixed(1)} mm/s</span>
            </div>
          </div>
        )}
      </div>

      {/* ISO 20816 General Zone */}
      {generalResult && (
        <div style={{ ...GLASS, background: `${generalResult.color}08`, borderColor: `${generalResult.color}22` }}>
          <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 8 }}>
            ISO 20816 GENERAL ZONE
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: generalResult.color }}>Zone {generalResult.zone}</span>
            <span style={{ fontSize: 14, color: generalResult.color, fontWeight: 600 }}>— {generalResult.label}</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--fg-soft)", margin: "6px 0 0" }}>{generalResult.description}</p>
        </div>
      )}

      {/* gE Bearing Stage */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🎯 Bearing Health (gE Enveloping)
        </h4>
        <div>
          <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>gE LEVEL</label>
          <input type="number" step="0.1" min="0" placeholder="e.g. 0.8" value={geInput} onChange={e => setGeInput(e.target.value)} style={{ ...inputStyle, maxWidth: 200 }} />
        </div>
        {bearingResult && (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: `${bearingResult.color}11`, border: `1px solid ${bearingResult.color}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: bearingResult.color, boxShadow: `0 0 10px ${bearingResult.color}` }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: bearingResult.color }}>{bearingResult.stage}</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "6px 0 0" }}>{bearingResult.action}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Diagnostic ──────────────────────────────────────────────────────────
function TabDiagnostic() {
  const [filterCat, setFilterCat] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    filterCat === "ALL" ? DIAGNOSTIC_PATTERNS : DIAGNOSTIC_PATTERNS.filter(p => p.category === filterCat),
  [filterCat]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Quick Diagnosis */}
      <div style={{ ...GLASS, background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.15)" }}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 12 }}>
          ⚡ Quick Diagnosis Lookup
        </h4>
        <div style={{ display: "grid", gap: 6 }}>
          {QUICK_DIAGNOSIS.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(0,0,0,0.2)" }}>
              <span style={{ flex: 1, fontSize: 12, color: "var(--fg-soft)", fontFamily: "var(--font-mono)" }}>{d.signature}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>→ {d.suspect}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["ALL", ...DIAGNOSTIC_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 10, fontWeight: 700,
              fontFamily: "var(--font-mono)", cursor: "pointer",
              background: filterCat === cat ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)",
              color: filterCat === cat ? "var(--accent)" : "var(--muted)",
              border: `1px solid ${filterCat === cat ? "rgba(201,168,76,0.3)" : "transparent"}`,
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Pattern Cards */}
      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map(p => {
          const isOpen = expandedId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setExpandedId(isOpen ? null : p.id)}
              style={{
                ...GLASS, padding: 14, width: "100%", textAlign: "left",
                cursor: "pointer", transition: "all 0.2s ease",
                borderColor: isOpen ? "var(--accent)" : "var(--glass-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 800, color: "var(--accent)" }}>{p.id}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>{p.name}</span>
              </div>
              {isOpen && (
                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  <div><span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#3b82f6" }}>SPECTRUM</span><p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "4px 0 0", lineHeight: 1.5 }}>{p.spectrum}</p></div>
                  {p.phase !== "—" && <div><span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#a855f7" }}>PHASE</span><p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "4px 0 0", lineHeight: 1.5 }}>{p.phase}</p></div>}
                  <div><span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#22c55e" }}>CORRECTION</span><p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "4px 0 0", lineHeight: 1.5 }}>{p.correction}</p></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Paths ───────────────────────────────────────────────────────────────
function TabPaths() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const goal = selectedGoal ? LEARNING_GOALS.find(g => g.id === selectedGoal) : null;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* 4 Goal Cards */}
      <div>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🎯 Pick Your Learning Goal
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {LEARNING_GOALS.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGoal(selectedGoal === g.id ? null : g.id)}
              style={{
                ...GLASS, padding: 14, textAlign: "left", cursor: "pointer",
                borderColor: selectedGoal === g.id ? "var(--accent)" : "var(--glass-border)",
                background: selectedGoal === g.id ? "rgba(201,168,76,0.08)" : "var(--glass-bg)",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 800, color: "var(--accent)" }}>Goal {g.id}</span>
              <h5 style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)", margin: "6px 0 4px" }}>{g.title}</h5>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>⏱ {g.timeEstimate}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Goal Detail */}
      {goal && (
        <div style={{ ...GLASS, background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.15)" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--accent)", marginBottom: 6 }}>Goal {goal.id}: {goal.title}</h4>
          <p style={{ fontSize: 13, color: "var(--fg-soft)", marginBottom: 16 }}>{goal.description}</p>
          <h5 style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--muted)", marginBottom: 10, letterSpacing: "0.1em" }}>READING PATH</h5>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {goal.readingPath.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: 10, borderRadius: 10, background: "rgba(0,0,0,0.2)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 800, color: "var(--accent)", width: 32, textAlign: "center", flexShrink: 0 }}>
                  {step.moduleId}
                </span>
                <div style={{ flex: 1 }}>
                  {step.sections && <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#3b82f6" }}>{step.sections} </span>}
                  <span style={{ fontSize: 12, color: "var(--fg-soft)" }}>{step.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependency Tree */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🌳 Module Dependency Tree
        </h4>
        <pre style={{
          fontFamily: "var(--font-mono)", fontSize: 10, lineHeight: 1.5,
          color: "var(--fg-soft)", whiteSpace: "pre", overflowX: "auto",
          margin: 0, padding: 14, borderRadius: 10, background: "rgba(0,0,0,0.3)",
        }}>
          {DEPENDENCY_TREE}
        </pre>
      </div>

      {/* Learning Iterations */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🔄 5 Learning Iterations
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {LEARNING_ITERATIONS.map((iter, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 800, color: "var(--accent)" }}>{i + 1}</span>
                <div>
                  <h5 style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", margin: 0 }}>{iter.title}</h5>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>⏱ {iter.duration}</span>
                </div>
              </div>
              <ul style={{ margin: 0, paddingLeft: 36, display: "flex", flexDirection: "column", gap: 4 }}>
                {iter.steps.map((s, j) => (
                  <li key={j} style={{ fontSize: 12, color: "var(--fg-soft)", lineHeight: 1.5 }}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Cutting Pitfalls */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ef4444", marginBottom: 14 }}>
          ⚠️ Cross-Cutting Pitfalls
        </h4>
        <div style={{ display: "grid", gap: 6 }}>
          {CROSS_CUTTING_PITFALLS.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, padding: 10, borderRadius: 8, background: "rgba(239,68,68,0.04)", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>{p.pitfall}</span>
              <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)", whiteSpace: "nowrap" }}>File {p.files}</span>
              <span style={{ fontSize: 11, color: "var(--fg-soft)" }}>{p.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Tools ───────────────────────────────────────────────────────────────
function TabTools() {
  const [rpmInput, setRpmInput] = useState("");
  const [velTrend, setVelTrend] = useState<"ok" | "rising">("ok");
  const [geTrend, setGeTrend] = useState<"ok" | "rising">("ok");

  const rpm = parseFloat(rpmInput);
  const filterRec = useMemo(() => isNaN(rpm) || rpm <= 0 ? null : recommendGeFilter(rpm), [rpm]);
  const diagFlow = useMemo(() => getDiagnosticFlow(velTrend, geTrend), [velTrend, geTrend]);

  const inputStyle = {
    width: "100%", maxWidth: 200, padding: "10px 14px", borderRadius: 10, fontSize: 14,
    background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)",
    color: "var(--fg)", fontFamily: "var(--font-mono)", outline: "none",
  } as const;

  const btnStyle = (active: boolean, color: string) => ({
    padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700 as const,
    fontFamily: "var(--font-mono)", cursor: "pointer" as const,
    background: active ? `${color}22` : "rgba(255,255,255,0.04)",
    color: active ? color : "var(--muted)",
    border: `1px solid ${active ? `${color}44` : "transparent"}`,
    transition: "all 0.2s ease",
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* gE Filter Recommender */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🎯 gE Bandpass Filter Recommendation
        </h4>
        <div>
          <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>MACHINE RPM</label>
          <input type="number" min="1" placeholder="e.g. 1800" value={rpmInput} onChange={e => setRpmInput(e.target.value)} style={inputStyle} />
        </div>
        {filterRec && (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
              {filterRec.lowHz} Hz — {filterRec.highHz.toLocaleString()} Hz
            </div>
            <p style={{ fontSize: 12, color: "var(--fg-soft)", margin: "6px 0 0" }}>{filterRec.name}</p>
          </div>
        )}
      </div>

      {/* Diagnostic Flow (2×2 Matrix) */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🔬 Velocity + gE Diagnostic Flow
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 6 }}>VELOCITY TREND</label>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setVelTrend("ok")} style={btnStyle(velTrend === "ok", "#22c55e")}>✓ OK</button>
              <button onClick={() => setVelTrend("rising")} style={btnStyle(velTrend === "rising", "#ef4444")}>↑ Rising</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 6 }}>gE TREND</label>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setGeTrend("ok")} style={btnStyle(geTrend === "ok", "#22c55e")}>✓ OK</button>
              <button onClick={() => setGeTrend("rising")} style={btnStyle(geTrend === "rising", "#ef4444")}>↑ Rising</button>
            </div>
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 12, background: `${diagFlow.color}11`, border: `1px solid ${diagFlow.color}33` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: diagFlow.color }}>{diagFlow.diagnosis}</div>
          <p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "8px 0 0", lineHeight: 1.5 }}>{diagFlow.action}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SkfMicrologPage() {
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState<TabKey>("modules");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        .skf-tab-btn { transition: all 0.3s ease; position: relative; }
        .skf-tab-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .skf-tab-btn::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 24px;
          height: 2px;
          background: var(--accent);
          border-radius: 1px;
          transition: transform 0.3s ease;
        }
        .skf-tab-active::after { transform: translateX(-50%) scaleX(1); }
      `}</style>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 16px 140px", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: "rgba(201,168,76,0.15)", color: "var(--accent)", letterSpacing: "0.1em" }}>
              LEARN
            </span>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>PTTS Knowledge Base</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 5vw, 36px)", color: "var(--fg)", margin: "0 0 6px" }}>
            SKF Microlog
          </h1>
          <p style={{ fontSize: 14, color: "var(--fg-soft)", lineHeight: 1.5, margin: 0, maxWidth: 600 }}>
            {lang === "id"
              ? "Platform pembelajaran vibrasi analysis untuk tim PTTS. 7 modul, severity calculator, diagnostic chart, dan guided learning path."
              : "Vibration analysis learning platform for PTTS team. 7 modules, severity calculator, diagnostic chart, and guided learning paths."
            }
          </p>
        </div>

        {/* Tab Bar */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 24, overflowX: "auto",
          padding: "4px", borderRadius: 14,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--glass-border)",
        }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`skf-tab-btn ${activeTab === tab.key ? "skf-tab-active" : ""}`}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 10,
                fontSize: 11,
                fontWeight: activeTab === tab.key ? 700 : 500,
                fontFamily: "var(--font-mono)",
                cursor: "pointer",
                background: activeTab === tab.key ? "rgba(201,168,76,0.1)" : "transparent",
                color: activeTab === tab.key ? "var(--accent)" : "var(--muted)",
                border: "none",
                whiteSpace: "nowrap",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span>{lang === "id" ? tab.labelId : tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "modules" && <TabModules />}
        {activeTab === "severity" && <TabSeverity />}
        {activeTab === "diagnostic" && <TabDiagnostic />}
        {activeTab === "paths" && <TabPaths />}
        {activeTab === "tools" && <TabTools />}
      </main>

      <Footer />
      <div style={{ textAlign: "center", padding: "0 0 120px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", opacity: 0.4 }}>
        By DummVinci · DummVinci Calculator
      </div>
    </div>
  );
}
