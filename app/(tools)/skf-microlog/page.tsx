"use client";
// app/(tools)/skf-microlog/page.tsx — SKF Microlog Learn
// Educational learning platform for PTTS vibration analysis team

import React, { useState, useMemo, useCallback } from "react";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";

// Data Source Imports
import { MODULES, MODULE_TAGS } from "@/data/skf-microlog/modules";
import type { ModuleData } from "@/data/skf-microlog/modules";
import { SEVERITY_TABLE, SEVERITY_CATEGORIES } from "@/data/skf-microlog/severity";
import { DIAGNOSTIC_PATTERNS, DIAGNOSTIC_CATEGORIES, QUICK_DIAGNOSIS } from "@/data/skf-microlog/diagnostic-patterns";
import { LEARNING_GOALS, LEARNING_ITERATIONS, CROSS_CUTTING_PITFALLS } from "@/data/skf-microlog/learning-paths";

// Localized Database Imports
import { MODULES_ID } from "@/data/skf-microlog/modules-id";
import { DIAGNOSTIC_PATTERNS_ID, QUICK_DIAGNOSIS_ID } from "@/data/skf-microlog/diagnostic-patterns-id";
import { LEARNING_GOALS_ID, LEARNING_ITERATIONS_ID, CROSS_CUTTING_PITFALLS_ID } from "@/data/skf-microlog/learning-paths-id";

// Calculation Functions
import {
  getMachineSeverityZone,
  getGeneralSeverityZone,
  getBearingStage,
  getDiagnosticFlow,
  recommendGeFilter,
} from "@/lib/calc/skf-severity";

// ─── Tab Types ────────────────────────────────────────────────────────────────
type TabKey = "modules" | "severity" | "diagnostic" | "paths" | "tools";

const TABS: { key: TabKey; labelEn: string; labelId: string; icon: string }[] = [
  { key: "modules",    labelEn: "Modules",    labelId: "Modul",        icon: "📚" },
  { key: "severity",   labelEn: "Severity",   labelId: "Severity",     icon: "📊" },
  { key: "diagnostic", labelEn: "Diagnosis",  labelId: "Diagnosis",    icon: "🔍" },
  { key: "paths",      labelEn: "Paths",      labelId: "Jalur Belajar", icon: "🗺️" },
  { key: "tools",      labelEn: "Tools / Sim", labelId: "Alat / Sim",   icon: "⚙️" },
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

// Helper: Check for active touch screens / styles
const inputStyleBase = {
  width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
  background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)",
  color: "var(--fg)", fontFamily: "var(--font-mono)", outline: "none",
  transition: "border-color 0.2s ease",
} as const;

// ─── Module Card ──────────────────────────────────────────────────────────────
function ModuleCard({ mod, onClick, isActive, lang }: { mod: ModuleData; onClick: () => void; isActive: boolean; lang: "en" | "id" }) {
  const title = lang === "id" ? mod.titleId : mod.titleEn;
  const tldr = lang === "id" && MODULES_ID[mod.id] ? MODULES_ID[mod.id].tldr : mod.tldr;

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
            {title}
          </h3>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--fg-soft)", lineHeight: 1.5, margin: 0 }}>
        {tldr.slice(0, 140)}…
      </p>
    </button>
  );
}

// ─── SKF Microlog Visualizer ──────────────────────────────────────────────────
function SkfMicrologVisualizer({ activeModuleId, lang }: { activeModuleId: string; lang: "en" | "id" }) {
  // Generate visual content based on module
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
      case "06": // gE Enveloping
        const isGE = activeModuleId === "06";
        const color = isGE ? "#a855f7" : "#3b82f6";
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 120" preserveAspectRatio="none">
            {/* Grid */}
            <path d="M 0 30 L 200 30 M 0 60 L 200 60 M 0 90 L 200 90" stroke="var(--muted)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3"/>
            {/* Spectrum Path */}
            <path 
              d={isGE 
                ? "M 10 110 L 20 105 L 30 110 L 40 108 L 50 40 L 60 105 L 70 108 L 80 106 L 90 108 L 100 60 L 110 105 L 120 107 L 130 106 L 140 108 L 150 75 L 160 105 L 170 108 L 180 107 L 190 109" 
                : "M 10 110 L 20 110 L 30 30 L 40 105 L 50 108 L 60 70 L 70 105 L 80 108 L 90 90 L 100 108 L 110 105 L 120 100"}
              fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" 
            />
            {isGE && <text x="45" y="30" fill={color} fontSize="8" fontFamily="var(--font-mono)">BPFO</text>}
            {!isGE && <text x="25" y="20" fill={color} fontSize="8" fontFamily="var(--font-mono)">1x RPM</text>}
          </svg>
        );
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
      {/* Hardware Bezel */}
      <div style={{ background: "var(--accent)", color: "var(--bg)", padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>SKF Microlog</span>
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 4px #22c55e" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(0,0,0,0.3)" }} />
        </div>
      </div>
      {/* Screen Area */}
      <div style={{ background: "var(--bg-raised)", height: 140, position: "relative", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ position: "absolute", top: 4, left: 6, fontSize: 8, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          {lang === "id" ? "Mode: " : "Mode: "} {activeModuleId === "01" ? "Balancing" : activeModuleId === "05" ? "Analyzer" : activeModuleId === "06" ? "gE Envelope" : "Route"}
        </div>
        {renderScreenContent()}
      </div>
      {/* Hardware Buttons */}
      <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0", background: "var(--bg-deep)" }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ width: 24, height: 12, borderRadius: 4, background: "var(--muted)", opacity: 0.3 }} />
        ))}
      </div>
    </div>
  );
}

// ─── Module Detail ────────────────────────────────────────────────────────────
function ModuleDetail({ mod, lang }: { mod: ModuleData; lang: "en" | "id" }) {
  // Helper to render interactive section content when "→" is detected
  const renderSectionContent = (text: string) => {
    if (!text.includes("→")) return <p style={{ fontSize: 13, color: "var(--fg-soft)", lineHeight: 1.5, margin: 0 }}>{text}</p>;
    
    // Split by period followed by space
    const sentences = text.split(/(?<=\.)\s+/);
    return (
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--fg-soft)", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 6 }}>
        {sentences.map((sentence, i) => {
          if (!sentence) return null;
          if (!sentence.includes("→")) return <li key={i}>{sentence}</li>;
          
          const parts = sentence.split("→");
          return (
            <li key={i}>
              {parts.map((p, j) => (
                <React.Fragment key={j}>
                  {j > 0 && <span style={{ background: "var(--accent-pill-bg)", color: "var(--accent)", padding: "2px 6px", borderRadius: 4, fontWeight: "bold", margin: "0 4px", fontSize: 10 }}>→</span>}
                  <span style={{ color: j > 0 ? "var(--fg)" : "inherit" }}>{p.trim()}</span>
                </React.Fragment>
              ))}
            </li>
          );
        })}
      </ul>
    );
  };

  // Helper to render cheat sheet lines with interactive "→" pills
  const renderCheatSheetLine = (line: string, i: number) => {
    if (!line.includes("→")) return <div key={i}>{line || " "}</div>;
    const parts = line.split("→");
    return (
      <div key={i} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 6, rowGap: 2 }}>
        {parts.map((p, j) => (
          <React.Fragment key={j}>
            {j > 0 && <span style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa", padding: "0 6px", borderRadius: 4, fontWeight: "bold", fontSize: 10 }}>→</span>}
            <span style={{ color: j > 0 ? "var(--fg)" : "inherit" }}>{p.trim()}</span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Localization logic
  const content = useMemo(() => {
    if (lang === "id" && MODULES_ID[mod.id]) {
      const translated = MODULES_ID[mod.id];
      return {
        title: mod.titleId,
        tldr: translated.tldr,
        mentalModel: translated.mentalModel,
        sections: translated.sections,
        activeRecall: mod.activeRecall,
        pitfalls: translated.pitfalls,
        cheatSheet: translated.cheatSheet,
      };
    }
    return {
      title: mod.titleEn,
      tldr: mod.tldr,
      mentalModel: mod.mentalModel,
      sections: mod.sections,
      activeRecall: mod.activeRecall,
      pitfalls: mod.pitfalls,
      cheatSheet: mod.cheatSheet,
    };
  }, [mod, lang]);

  // Quiz States
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScores, setQuizScores] = useState<Record<number, "mastered" | "review">>([]);

  // View All Recall States
  const [revealedQ, setRevealedQ] = useState<Set<number>>(new Set());

  const toggleReveal = useCallback((idx: number) => {
    setRevealedQ(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }, []);

  const handleOptionSelect = (optIndex: number) => {
    if (selectedOption !== null) return; // Prevent re-answering
    setSelectedOption(optIndex);
    const isCorrect = optIndex === content.activeRecall[currentQuestionIndex].correctAnswer;
    setQuizScores(prev => ({ ...prev, [currentQuestionIndex]: isCorrect ? "mastered" : "review" }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < content.activeRecall.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(null);
    }
  };

  const masteredCount = Object.values(quizScores).filter(s => s === "mastered").length;
  const reviewCount = Object.values(quizScores).filter(s => s === "review").length;

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
              {content.title}
            </h2>
            {lang === "id" && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", margin: "2px 0 0" }}>{mod.titleEn}</p>}
          </div>
        </div>
        <p style={{ fontSize: 14, color: "var(--fg-soft)", lineHeight: 1.6, margin: 0 }}>{content.tldr}</p>
      </div>

      <SkfMicrologVisualizer activeModuleId={mod.id} lang={lang} />

      {/* Mental Model */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 10 }}>
          🧠 {lang === "id" ? "Model Mental" : "Mental Model"}
        </h4>
        <p style={{ fontSize: 14, color: "var(--fg-soft)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{content.mentalModel}</p>
      </div>

      {/* Sections */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          📖 {lang === "id" ? `Bagian Utama (${content.sections.length})` : `Key Sections (${content.sections.length})`}
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {content.sections.map((s, i) => (
            <div key={i} style={{
              padding: 14, borderRadius: 12,
              background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
              border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", opacity: 0.6 }}>§{i + 1}</span>
                <h5 style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", margin: 0 }}>{s.title}</h5>
              </div>
              {renderSectionContent(s.content)}
            </div>
          ))}
        </div>
      </div>

      {/* Active Recall (Interactive Flashcards) */}
      <div style={GLASS}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", margin: 0 }}>
            🧪 Active Recall / {lang === "id" ? "Kuis Mandiri" : "Quiz"} ({content.activeRecall.length})
          </h4>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setQuizMode(false); setRevealedQ(new Set()); }}
              style={{
                padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700,
                background: !quizMode ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)",
                color: !quizMode ? "var(--accent)" : "var(--muted)",
                border: "none", cursor: "pointer", fontFamily: "var(--font-mono)",
              }}
            >
              {lang === "id" ? "LIHAT SEMUA" : "VIEW ALL"}
            </button>
            <button
              onClick={() => { setQuizMode(true); setCurrentQuestionIndex(0); setSelectedOption(null); }}
              style={{
                padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700,
                background: quizMode ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)",
                color: quizMode ? "var(--accent)" : "var(--muted)",
                border: "none", cursor: "pointer", fontFamily: "var(--font-mono)",
              }}
            >
              {lang === "id" ? "MODE KUIS" : "QUIZ MODE"}
            </button>
          </div>
        </div>

        {quizMode ? (
          /* Interactive Quiz Mode */
          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 18, border: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Progress Bar */}
            <div style={{ display: "flex", height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ width: `${(masteredCount / content.activeRecall.length) * 100}%`, background: "#22c55e" }} />
              <div style={{ width: `${(reviewCount / content.activeRecall.length) * 100}%`, background: "#ef4444" }} />
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                {lang === "id" ? `Pertanyaan ${currentQuestionIndex + 1} dari ${content.activeRecall.length}` : `Question ${currentQuestionIndex + 1} of ${content.activeRecall.length}`}
              </span>
              <span style={{ display: "flex", gap: 10, fontSize: 10, fontFamily: "var(--font-mono)" }}>
                <span style={{ color: "#22c55e" }}>✓ {masteredCount} Paham</span>
                <span style={{ color: "#ef4444" }}>✗ {reviewCount} Ulang</span>
              </span>
            </div>

            <div style={{ minHeight: 60, fontSize: 15, color: "var(--fg)", fontWeight: 500, lineHeight: 1.5, marginBottom: 16 }}>
              {content.activeRecall[currentQuestionIndex]?.q}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {content.activeRecall[currentQuestionIndex]?.options?.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === content.activeRecall[currentQuestionIndex].correctAnswer;
                const showFeedback = selectedOption !== null;
                
                let bgColor = "rgba(255,255,255,0.03)";
                let borderColor = "rgba(255,255,255,0.06)";
                let color = "var(--fg-soft)";

                if (showFeedback) {
                  if (isCorrect) {
                    bgColor = "rgba(34,197,94,0.15)";
                    borderColor = "rgba(34,197,94,0.5)";
                    color = "#22c55e";
                  } else if (isSelected) {
                    bgColor = "rgba(239,68,68,0.15)";
                    borderColor = "rgba(239,68,68,0.5)";
                    color = "#ef4444";
                  }
                } else if (isSelected) {
                  bgColor = "rgba(201,168,76,0.1)";
                  borderColor = "var(--accent)";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={selectedOption !== null}
                    style={{
                      textAlign: "left", padding: "12px 16px", borderRadius: 10,
                      background: bgColor, border: `1px solid ${borderColor}`,
                      color: color, cursor: selectedOption !== null ? "default" : "pointer",
                      transition: "all 0.2s ease", fontSize: 13, lineHeight: 1.5
                    }}
                  >
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedOption !== null && (
              <div style={{ marginBottom: 20, animation: "fadeIn 0.3s ease" }}>
                {selectedOption === content.activeRecall[currentQuestionIndex].correctAnswer ? (
                  <div style={{ padding: 12, background: "rgba(34,197,94,0.1)", borderLeft: "3px solid #22c55e", borderRadius: 4, fontSize: 13, color: "#22c55e" }}>
                    <strong>{lang === "id" ? "Benar!" : "Correct!"}</strong> 
                    {content.activeRecall[currentQuestionIndex].hint && ` — ${content.activeRecall[currentQuestionIndex].hint}`}
                  </div>
                ) : (
                  <div style={{ padding: 12, background: "rgba(239,68,68,0.1)", borderLeft: "3px solid #ef4444", borderRadius: 4, fontSize: 13, color: "#ef4444" }}>
                    <strong>{lang === "id" ? "Kurang tepat." : "Incorrect."}</strong> 
                    {content.activeRecall[currentQuestionIndex].hint && ` — Hint: ${content.activeRecall[currentQuestionIndex].hint}`}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <button
                disabled={currentQuestionIndex === 0}
                onClick={handlePrev}
                style={{
                  padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)",
                  border: "none", color: currentQuestionIndex === 0 ? "var(--muted)" : "var(--fg-soft)",
                  cursor: currentQuestionIndex === 0 ? "default" : "pointer", fontSize: 11, fontWeight: 600
                }}
              >
                ← {lang === "id" ? "Sblm" : "Prev"}
              </button>
              <button
                disabled={currentQuestionIndex === content.activeRecall.length - 1 || selectedOption === null}
                onClick={handleNext}
                style={{
                  padding: "6px 14px", borderRadius: 8, 
                  background: (currentQuestionIndex === content.activeRecall.length - 1 || selectedOption === null) ? "rgba(255,255,255,0.04)" : "var(--accent)",
                  border: "none", color: (currentQuestionIndex === content.activeRecall.length - 1 || selectedOption === null) ? "var(--muted)" : "#fff",
                  cursor: (currentQuestionIndex === content.activeRecall.length - 1 || selectedOption === null) ? "default" : "pointer", fontSize: 11, fontWeight: 700
                }}
              >
                {lang === "id" ? "Lanjut" : "Next"} →
              </button>
            </div>
          </div>
        ) : (
          /* View All Mode */
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {content.activeRecall.map((q, i) => (
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.5, fontWeight: 500 }}>{q.q}</span>
                    {revealedQ.has(i) && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "#22c55e", fontFamily: "var(--font-mono)" }}>
                        ✓ {q.options[q.correctAnswer]}
                      </div>
                    )}
                  </div>
                </div>
                {revealedQ.has(i) && q.hint && (
                  <div style={{ marginTop: 12, marginLeft: 24, padding: "6px 10px", background: "rgba(201,168,76,0.08)", borderRadius: 6, fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)", opacity: 0.9 }}>
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
          ⚠️ {lang === "id" ? "Kekhilafan Umum" : "Common Pitfalls"} ({content.pitfalls.length})
        </h4>
        <div style={{ display: "grid", gap: 8 }}>
          {content.pitfalls.map((p, i) => (
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
          📋 {lang === "id" ? "Ringkasan Cepat" : "Cheat Sheet"}
        </h4>
        <pre style={{
          fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.6,
          color: "var(--fg-soft)", whiteSpace: "pre-wrap", wordBreak: "break-word",
          margin: 0, padding: 16, borderRadius: 10, background: "rgba(0,0,0,0.3)",
        }}>
          {content.cheatSheet.split("\n").map((line, i) => renderCheatSheetLine(line, i))}
        </pre>
      </div>
    </div>
  );
}

// ─── Tab: Modules with Interactive Graph ──────────────────────────────────────
function TabModules({ lang, selectedId, setSelectedId }: { lang: "en" | "id"; selectedId: string | null; setSelectedId: (id: string | null) => void }) {
  const [filterTag, setFilterTag] = useState<string>("ALL");

  const filtered = useMemo(() =>
    filterTag === "ALL" ? MODULES : MODULES.filter(m => m.tag === filterTag),
  [filterTag]);

  const selected = useMemo(() =>
    selectedId ? MODULES.find(m => m.id === selectedId) ?? null : null,
  [selectedId]);

  return (
    <div>
      {selected ? (
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
      ) : (
        <div>
          {/* Interactive Mindmap / Connection Graph */}
          <div style={{ ...GLASS, marginBottom: 24, background: "rgba(0, 0, 0, 0.2)", border: "1px dashed rgba(201,168,76,0.3)" }}>
            <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 16, textAlign: "center" }}>
              🗺️ {lang === "id" ? "Peta Hubungan Modul SKF (Interaktif)" : "SKF Module Connections Graph (Interactive)"}
            </h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", position: "relative" }}>
              
              {/* Level 1: Foundation */}
              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <button
                  onClick={() => setSelectedId("01")}
                  style={{
                    padding: "10px 16px", borderRadius: 10, background: "rgba(59, 130, 246, 0.15)",
                    border: "2px solid #3b82f6", color: "#3b82f6", cursor: "pointer",
                    textAlign: "center", width: 220, transition: "transform 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span style={{ fontSize: 16, marginRight: 6 }}>📐</span>
                  <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700 }}>MODULE 01 (THEORY)</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{lang === "id" ? "Dasar Vibrasi" : "Basic Vibration"}</div>
                </button>
              </div>

              {/* Connecting Line */}
              <div style={{ width: 2, height: 20, background: "rgba(255,255,255,0.15)" }} />

              {/* Level 2: Core Paths */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", maxWidth: 700 }}>
                {/* 02 */}
                <button
                  onClick={() => setSelectedId("02")}
                  style={{
                    padding: "10px 10px", borderRadius: 10, background: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid #f59e0b", color: "#f59e0b", cursor: "pointer",
                    textAlign: "center", transition: "transform 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span style={{ fontSize: 14 }}>📊</span>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)" }}>MODULE 02 (REF)</div>
                  <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lang === "id" ? "Tabel Severity" : "Severity & Charts"}</div>
                </button>

                {/* 03 */}
                <button
                  onClick={() => setSelectedId("03")}
                  style={{
                    padding: "10px 10px", borderRadius: 10, background: "rgba(34, 197, 94, 0.12)",
                    border: "1px solid #22c55e", color: "#22c55e", cursor: "pointer",
                    textAlign: "center", transition: "transform 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span style={{ fontSize: 14 }}>🔬</span>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)" }}>MODULE 03 (TOOL)</div>
                  <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lang === "id" ? "Analyzer dBX" : "dBX Analyzer"}</div>
                </button>

                {/* 04 */}
                <button
                  onClick={() => setSelectedId("04")}
                  style={{
                    padding: "10px 10px", borderRadius: 10, background: "rgba(34, 197, 94, 0.12)",
                    border: "1px solid #22c55e", color: "#22c55e", cursor: "pointer",
                    textAlign: "center", transition: "transform 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span style={{ fontSize: 14 }}>⚖️</span>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)" }}>MODULE 04 (TOOL)</div>
                  <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lang === "id" ? "Balancing dBX" : "dBX Balancing"}</div>
                </button>
              </div>

              {/* Connecting Lines */}
              <div style={{ display: "flex", justifyContent: "space-between", width: "70%", height: 20, borderTop: "2px solid rgba(255,255,255,0.1)", borderLeft: "2px solid rgba(255,255,255,0.1)", borderRight: "2px solid rgba(255,255,255,0.1)", position: "relative" }}>
                <div style={{ position: "absolute", left: "50%", top: 0, width: 2, height: 20, background: "rgba(255,255,255,0.1)", transform: "translateX(-50%)" }} />
              </div>

              {/* Level 3: SOP & Cheatsheets */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", maxWidth: 700 }}>
                {/* 05 */}
                <button
                  onClick={() => setSelectedId("05")}
                  style={{
                    padding: "10px 10px", borderRadius: 10, background: "rgba(168, 85, 247, 0.12)",
                    border: "1px solid #a855f7", color: "#a855f7", cursor: "pointer",
                    textAlign: "center", transition: "transform 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span style={{ fontSize: 14 }}>📋</span>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)" }}>MODULE 05 (SOP)</div>
                  <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lang === "id" ? "Template Velo" : "Velocity Temp."}</div>
                </button>

                {/* 06 */}
                <button
                  onClick={() => setSelectedId("06")}
                  style={{
                    padding: "10px 10px", borderRadius: 10, background: "rgba(168, 85, 247, 0.12)",
                    border: "1px solid #a855f7", color: "#a855f7", cursor: "pointer",
                    textAlign: "center", transition: "transform 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span style={{ fontSize: 14 }}>🎯</span>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)" }}>MODULE 06 (SOP)</div>
                  <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lang === "id" ? "Template gE" : "gE Template"}</div>
                </button>

                {/* 07 */}
                <button
                  onClick={() => setSelectedId("07")}
                  style={{
                    padding: "10px 10px", borderRadius: 10, background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid #ef4444", color: "#ef4444", cursor: "pointer",
                    textAlign: "center", transition: "transform 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span style={{ fontSize: 14 }}>⚡</span>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)" }}>MODULE 07 (CHEAT)</div>
                  <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lang === "id" ? "Pocket Guide" : "Balancing Pocket"}</div>
                </button>
              </div>

            </div>
          </div>

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

          <div style={{ display: "grid", gap: 12 }}>
            {filtered.map(mod => (
              <ModuleCard key={mod.id} mod={mod} isActive={false} onClick={() => setSelectedId(mod.id)} lang={lang} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Severity ────────────────────────────────────────────────────────────
function TabSeverity({ lang }: { lang: "en" | "id" }) {
  const [velocityInput, setVelocityInput] = useState("");
  const [selectedCat, setSelectedCat] = useState(SEVERITY_CATEGORIES[0]);
  const [selectedSub, setSelectedSub] = useState("");
  const [geInput, setGeInput] = useState("");
  const [hasIsolator, setHasIsolator] = useState(false);
  const [hasGearbox, setHasGearbox] = useState(false);
  const [isNewMachine, setIsNewMachine] = useState(false);

  const filteredEntries = useMemo(() =>
    SEVERITY_TABLE.filter(e => e.category === selectedCat),
  [selectedCat]);

  const effectiveSub = useMemo(() => {
    if (filteredEntries.length > 0 && !filteredEntries.find(e => e.subType === selectedSub)) {
      return filteredEntries[0].subType;
    }
    return selectedSub;
  }, [filteredEntries, selectedSub]);

  const velocity = parseFloat(velocityInput);
  const ge = parseFloat(geInput);

  const machineResult = useMemo(() => {
    if (isNaN(velocity) || !effectiveSub) return null;
    return getMachineSeverityZone(velocity, effectiveSub, { isolator: hasIsolator, externalGearbox: hasGearbox, newMachine: isNewMachine }, lang);
  }, [velocity, effectiveSub, hasIsolator, hasGearbox, isNewMachine, lang]);

  const generalResult = useMemo(() => {
    if (isNaN(velocity)) return null;
    return getGeneralSeverityZone(velocity, lang);
  }, [velocity, lang]);

  const bearingResult = useMemo(() => {
    if (isNaN(ge)) return null;
    return getBearingStage(ge, lang);
  }, [ge, lang]);

  const inputStyle = {
    ...inputStyleBase
  };

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
          📊 {lang === "id" ? "Keparahan Spesifik Mesin (Gambar 13)" : "Machine-Specific Severity (Figure 13)"}
        </h4>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>
              {lang === "id" ? "KATEGORI MESIN" : "MACHINE CATEGORY"}
            </label>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={selectStyle}>
              {SEVERITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>
              {lang === "id" ? "SUB-TIPE MESIN" : "SUB-TYPE"}
            </label>
            <select value={effectiveSub} onChange={e => setSelectedSub(e.target.value)} style={selectStyle}>
              {filteredEntries.map(e => <option key={e.subType} value={e.subType}>{e.subType}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>
              {lang === "id" ? "KECEPATAN VIBRASI (mm/s RMS)" : "VELOCITY (mm/s RMS)"}
            </label>
            <input type="number" step="0.1" min="0" placeholder="e.g. 5.5" value={velocityInput} onChange={e => setVelocityInput(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "flex-end" }}>
            <label style={{ fontSize: 11, color: "var(--fg-soft)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={hasIsolator} onChange={e => setHasIsolator(e.target.checked)} />
              {lang === "id" ? "Isolator Getaran / Mounting (+40%)" : "Vibration Isolator (+40%)"}
            </label>
            <label style={{ fontSize: 11, color: "var(--fg-soft)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={hasGearbox} onChange={e => setHasGearbox(e.target.checked)} />
              {lang === "id" ? "Roda Gigi Eksternal (+25%)" : "External Gearbox (+25%)"}
            </label>
            <label style={{ fontSize: 11, color: "var(--fg-soft)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={isNewMachine} onChange={e => setIsNewMachine(e.target.checked)} />
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                {lang === "id" ? "Mesin Baru / Rekondisi (33% batas Alarm 1)" : "New / Rebuilt Machine (33% Alarm 1 limit)"}
              </span>
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
            <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: generalResult.color }}>{generalResult.zone}</span>
            <span style={{ fontSize: 14, color: generalResult.color, fontWeight: 600 }}>— {generalResult.label}</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--fg-soft)", margin: "6px 0 0" }}>{generalResult.description}</p>
        </div>
      )}

      {/* gE Bearing Stage */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🎯 {lang === "id" ? "Kesehatan Bearing (gE Enveloping)" : "Bearing Health (gE Enveloping)"}
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
function TabDiagnostic({ lang }: { lang: "en" | "id" }) {
  const [filterCat, setFilterCat] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    filterCat === "ALL" ? DIAGNOSTIC_PATTERNS : DIAGNOSTIC_PATTERNS.filter(p => p.category === filterCat),
  [filterCat]);

  const quickDiag = lang === "id" ? QUICK_DIAGNOSIS_ID : QUICK_DIAGNOSIS;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Quick Diagnosis */}
      <div style={{ ...GLASS, background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.15)" }}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 12 }}>
          ⚡ {lang === "id" ? "Pencarian Cepat Diagnosis" : "Quick Diagnosis Lookup"}
        </h4>
        <div style={{ display: "grid", gap: 6 }}>
          {quickDiag.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(0,0,0,0.2)" }}>
              <span style={{ flex: 1, fontSize: 12, color: "var(--fg-soft)", fontFamily: "var(--font-mono)" }}>{d.signature}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>→ {d.suspect}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["ALL", ...DIAGNOSTIC_CATEGORIES].map(cat => {
          let catLabel = cat;
          if (lang === "id") {
            if (cat === "Unbalance") catLabel = "Ketidakseimbangan";
            else if (cat === "Eccentricity") catLabel = "Eksentrisitas";
            else if (cat === "Looseness") catLabel = "Kelonggaran";
            else if (cat === "Journal Bearing") catLabel = "Bantalan Jurnal";
            else if (cat === "Bearing") catLabel = "Bantalan Gelinding";
            else if (cat === "Hydraulic") catLabel = "Hidrolik/Aliran";
            else if (cat === "Gear") catLabel = "Roda Gigi";
            else if (cat === "Electrical") catLabel = "Elektrikal Motor";
            else if (cat === "Belt") catLabel = "Sabuk/Puli";
          }
          return (
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
            >{catLabel}</button>
          );
        })}
      </div>

      {/* Pattern Cards */}
      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map(p => {
          const isOpen = expandedId === p.id;
          const details = lang === "id" && DIAGNOSTIC_PATTERNS_ID[p.id] ? DIAGNOSTIC_PATTERNS_ID[p.id] : {
            name: p.name, spectrum: p.spectrum, phase: p.phase, correction: p.correction
          };

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
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>{details.name}</span>
              </div>
              {isOpen && (
                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#3b82f6" }}>
                      {lang === "id" ? "SPEKTRUM" : "SPECTRUM"}
                    </span>
                    <p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "4px 0 0", lineHeight: 1.5 }}>{details.spectrum}</p>
                  </div>
                  {p.phase !== "—" && (
                    <div>
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#a855f7" }}>
                        {lang === "id" ? "FASE" : "PHASE"}
                      </span>
                      <p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "4px 0 0", lineHeight: 1.5 }}>{details.phase}</p>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#22c55e" }}>
                      {lang === "id" ? "LANGKAH PERBAIKAN" : "CORRECTION"}
                    </span>
                    <p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "4px 0 0", lineHeight: 1.5 }}>{details.correction}</p>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Component: Dependency Tree Visual (Interactive SVG Graph) ────────────────
function DependencyTreeVisual({ lang, onSelectModule }: { lang: "en" | "id"; onSelectModule: (id: string) => void }) {
  const nodes = [
    { id: "01", x: "50%", y: "40px", icon: "📐", tag: "THEORY", labelEn: "Basic Vibration", labelId: "Dasar Vibrasi" },
    { id: "02", x: "15%", y: "150px", icon: "📊", tag: "REFERENCE", labelEn: "Severity & Charts", labelId: "Tabel Severity" },
    { id: "03", x: "50%", y: "150px", icon: "🔬", tag: "TOOL", labelEn: "dBX Analyzer", labelId: "Analyzer dBX" },
    { id: "04", x: "85%", y: "150px", icon: "⚖️", tag: "TOOL", labelEn: "dBX Balancing", labelId: "Balancing dBX" },
    { id: "05", x: "32.5%", y: "260px", icon: "📋", tag: "SOP", labelEn: "Velocity Temp.", labelId: "Template Velo" },
    { id: "06", x: "67.5%", y: "260px", icon: "🎯", tag: "SOP", labelEn: "gE Template", labelId: "Template gE" },
    { id: "07", x: "85%", y: "260px", icon: "⚡", tag: "CHEAT SHEET", labelEn: "Pocket Guide", labelId: "Pocket Guide" },
  ];

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto", padding: "10px 0" }}>
      <style>{`
        @keyframes tree-flow-anim {
          to { stroke-dashoffset: -20; }
        }
        .flow-path {
          stroke: rgba(255,255,255,0.1);
          stroke-width: 2;
          fill: none;
        }
        .flow-path-active {
          stroke: var(--accent);
          stroke-width: 2;
          stroke-dasharray: 6, 4;
          fill: none;
          animation: tree-flow-anim 1.5s linear infinite;
          opacity: 0.7;
        }
        .node-btn {
          position: absolute;
          transform: translate(-50%, -50%);
          width: 130px;
          padding: 8px 6px;
          border-radius: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          z-index: 2;
        }
        .node-btn:hover {
          transform: translate(-50%, -50%) scale(1.05);
          border-color: var(--accent);
          box-shadow: 0 0 15px rgba(201,168,76,0.3);
        }
      `}</style>

      <div style={{ position: "relative", width: 720, height: 320, margin: "0 auto" }}>
        {/* SVG connection lines */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
          {/* 01 to 02 */}
          <path d="M 360 40 L 108 150" className="flow-path" />
          <path d="M 360 40 L 108 150" className="flow-path-active" />

          {/* 01 to 03 */}
          <path d="M 360 40 L 360 150" className="flow-path" />
          <path d="M 360 40 L 360 150" className="flow-path-active" />

          {/* 01 to 04 */}
          <path d="M 360 40 L 612 150" className="flow-path" />
          <path d="M 360 40 L 612 150" className="flow-path-active" />

          {/* 03 to 05 */}
          <path d="M 360 150 L 234 260" className="flow-path" />
          <path d="M 360 150 L 234 260" className="flow-path-active" />

          {/* 03 to 06 */}
          <path d="M 360 150 L 486 260" className="flow-path" />
          <path d="M 360 150 L 486 260" className="flow-path-active" />

          {/* 04 to 07 */}
          <path d="M 612 150 L 612 260" className="flow-path" />
          <path d="M 612 150 L 612 260" className="flow-path-active" />
        </svg>

        {/* Nodes */}
        {nodes.map(n => {
          const label = lang === "id" ? n.labelId : n.labelEn;
          const tagColor = TAG_COLORS[n.tag] || "#666";
          return (
            <button
              key={n.id}
              className="node-btn"
              style={{ left: n.x, top: n.y }}
              onClick={() => onSelectModule(n.id)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 2 }}>
                <span style={{ fontSize: 12 }}>{n.icon}</span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700,
                  padding: "1px 5px", borderRadius: 4,
                  background: `${tagColor}22`, color: tagColor
                }}>
                  {n.id}
                </span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--fg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {label}
              </div>
              <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "var(--muted)", marginTop: 2 }}>
                {n.tag}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Paths ───────────────────────────────────────────────────────────────
function TabPaths({ lang, onSelectModule }: { lang: "en" | "id"; onSelectModule: (id: string) => void }) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  
  const goals = LEARNING_GOALS;
  const goal = selectedGoal ? goals.find(g => g.id === selectedGoal) : null;

  const localizedGoal = useMemo(() => {
    if (!goal) return null;
    if (lang === "id" && LEARNING_GOALS_ID[goal.id]) {
      return LEARNING_GOALS_ID[goal.id];
    }
    return {
      title: goal.title,
      description: goal.description,
      readingPath: goal.readingPath,
      timeEstimate: goal.timeEstimate,
    };
  }, [goal, lang]);

  const iterations = lang === "id" ? LEARNING_ITERATIONS_ID : LEARNING_ITERATIONS;
  const pitfalls = lang === "id" ? CROSS_CUTTING_PITFALLS_ID : CROSS_CUTTING_PITFALLS;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* 4 Goal Cards */}
      <div>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🎯 {lang === "id" ? "Tentukan Target Belajar Anda" : "Pick Your Learning Goal"}
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {goals.map(g => {
            const currentGoal = lang === "id" && LEARNING_GOALS_ID[g.id] ? LEARNING_GOALS_ID[g.id] : g;
            return (
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
                <h5 style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)", margin: "6px 0 4px" }}>{currentGoal.title}</h5>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>⏱ {currentGoal.timeEstimate}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Goal Detail */}
      {localizedGoal && goal && (
        <div style={{ ...GLASS, background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.15)" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--accent)", marginBottom: 6 }}>Goal {goal.id}: {localizedGoal.title}</h4>
          <p style={{ fontSize: 13, color: "var(--fg-soft)", marginBottom: 16 }}>{localizedGoal.description}</p>
          <h5 style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--muted)", marginBottom: 10, letterSpacing: "0.1em" }}>
            {lang === "id" ? "ALUR MEMBACA" : "READING PATH"}
          </h5>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {localizedGoal.readingPath.map((step, i) => (
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
          🌳 {lang === "id" ? "Peta Ketergantungan Modul (Klik untuk Belajar)" : "Module Dependency Tree (Click to Learn)"}
        </h4>
        <DependencyTreeVisual lang={lang} onSelectModule={onSelectModule} />
      </div>

      {/* Learning Iterations */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🔄 {lang === "id" ? "5 Tahap Pengulangan (Iterations)" : "5 Learning Iterations"}
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {iterations.map((iter, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 800, color: "var(--accent)" }}>{i + 1}</span>
                <div>
                  <h5 style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", margin: 0 }}>{iter.title}</h5>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>⏱ {lang === "id" ? "durasi" : "duration"}: {iter.duration}</span>
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
          ⚠️ {lang === "id" ? "Kekhilafan Lintas Modul" : "Cross-Cutting Pitfalls"}
        </h4>
        <div style={{ display: "grid", gap: 6 }}>
          {pitfalls.map((p, i) => {
            const originalPitfall = CROSS_CUTTING_PITFALLS[i];
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, padding: 10, borderRadius: 8, background: "rgba(239,68,68,0.04)", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>{p.pitfall}</span>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)", whiteSpace: "nowrap" }}>File {originalPitfall?.files}</span>
                <span style={{ fontSize: 11, color: "var(--fg-soft)" }}>{p.note}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Tools with Interactive Simulator ────────────────────────────────────
function TabTools({ lang }: { lang: "en" | "id" }) {
  const [rpmInput, setRpmInput] = useState("");
  const [velTrend, setVelTrend] = useState<"ok" | "rising">("ok");
  const [geTrend, setGeTrend] = useState<"ok" | "rising">("ok");

  const rpm = parseFloat(rpmInput);
  const filterRec = useMemo(() => isNaN(rpm) || rpm <= 0 ? null : recommendGeFilter(rpm, lang), [rpm, lang]);
  const diagFlow = useMemo(() => getDiagnosticFlow(velTrend, geTrend, lang), [velTrend, geTrend, lang]);

  // ─── Single-Plane Balancing Simulator States ───
  const [simStep, setSimStep] = useState(1);
  const [simRotorMass, setSimRotorMass] = useState(80); // kg
  const [simRpm, setSimRpm] = useState(1500);
  const [simRadius, setSimRadius] = useState(250); // mm
  const [simV0, setSimV0] = useState({ amp: 8.6, phase: 125 }); // mm/s
  const [simTwMass, setSimTwMass] = useState("10.0"); // grams
  const [simTwAngle, setSimTwAngle] = useState("0"); // degrees
  const [simAfterTw, setSimAfterTw] = useState<"remove" | "remain">("remove");
  const [simV1, setSimV1] = useState({ amp: 0.0, phase: 0 });
  const [simResultLogs, setSimResultLogs] = useState<string[]>([]);
  const [simCwRecommendation, setSimCwRecommendation] = useState({ mass: 0, angle: 0 });

  // Physics Simulation: Calculate resulting vector for Trial weight run (Step 4)
  const twMassNum = parseFloat(simTwMass) || 0;
  const twAngleNum = parseFloat(simTwAngle) || 0;

  // Let sensitivity factor = 0.45 mm/s per gram. Phase lag = -45 degrees.
  const calibrationFactor = 0.45;
  const lagAngle = -45;

  const simVt1 = useMemo(() => {
    // V0 vector components
    const v0x = simV0.amp * Math.cos((simV0.phase * Math.PI) / 180);
    const v0y = simV0.amp * Math.sin((simV0.phase * Math.PI) / 180);

    // TW vector components (applying lag)
    const twEffAngle = twAngleNum + lagAngle;
    const twx = twMassNum * calibrationFactor * Math.cos((twEffAngle * Math.PI) / 180);
    const twy = twMassNum * calibrationFactor * Math.sin((twEffAngle * Math.PI) / 180);

    // Resulting VT1 vector
    const vt1x = v0x + twx;
    const vt1y = v0y + twy;
    const amp = Math.sqrt(vt1x * vt1x + vt1y * vt1y);
    let phase = (Math.atan2(vt1y, vt1x) * 180) / Math.PI;
    if (phase < 0) phase += 360;

    return { amp, phase };
  }, [simV0, twMassNum, twAngleNum, lagAngle]);

  // Check 30/30 Rule
  const rule3030Check = useMemo(() => {
    if (twMassNum <= 0) return { passed: false, ampDiff: 0, phaseDiff: 0 };
    
    // Amp ratio
    const ampRatio = simVt1.amp / simV0.amp;
    const ampDiffPct = Math.abs(ampRatio - 1) * 100;

    // Phase difference
    let phaseDiff = Math.abs(simVt1.phase - simV0.phase);
    if (phaseDiff > 180) phaseDiff = 360 - phaseDiff;

    const passed = ampDiffPct >= 30 || phaseDiff >= 30;
    return { passed, ampDiff: ampDiffPct, phaseDiff };
  }, [simVt1, simV0, twMassNum]);

  // Compute Correction Weight
  const computeCW = useCallback(() => {
    // V0 vector
    const v0x = simV0.amp * Math.cos((simV0.phase * Math.PI) / 180);
    const v0y = simV0.amp * Math.sin((simV0.phase * Math.PI) / 180);

    // VT1 vector
    const vt1x = simVt1.amp * Math.cos((simVt1.phase * Math.PI) / 180);
    const vt1y = simVt1.amp * Math.sin((simVt1.phase * Math.PI) / 180);

    // Vector shift ΔV = VT1 - V0
    const dvx = vt1x - v0x;
    const dvy = vt1y - v0y;
    const dvAmp = Math.sqrt(dvx * dvx + dvy * dvy);
    let dvPhase = (Math.atan2(dvy, dvx) * 180) / Math.PI;
    if (dvPhase < 0) dvPhase += 360;

    // Coefficient H = ΔV / TW
    const hAmp = dvAmp / twMassNum;
    const hPhase = dvPhase - twAngleNum;

    // CW = -V0 / H = V0 @ (phase + 180) / H
    const cwAmp = simV0.amp / hAmp;
    let cwPhase = simV0.phase + 180 - hPhase;
    while (cwPhase < 0) cwPhase += 360;
    while (cwPhase >= 360) cwPhase -= 360;

    setSimCwRecommendation({ mass: parseFloat(cwAmp.toFixed(1)), angle: parseFloat(cwPhase.toFixed(0)) });
  }, [simV0, simVt1, twMassNum, twAngleNum]);

  // Run balancing simulation calculations and logging
  const handleStartSim = () => {
    setSimStep(2);
    const logStr = lang === "id" 
      ? `Mengkalibrasi putaran awal (V0). Terdeteksi getaran: ${simV0.amp.toFixed(1)} mm/s RMS pada ${simV0.phase}°`
      : `Reference run V0 completed. Initial vibration: ${simV0.amp.toFixed(1)} mm/s RMS @ ${simV0.phase}°`;
    setSimResultLogs([logStr]);
  };

  const handleRunTrial = () => {
    computeCW();
    setSimStep(4);
    const logStr = lang === "id"
      ? `Putaran Uji (VT1) selesai. Getaran terukur: ${simVt1.amp.toFixed(1)} mm/s @ ${simVt1.phase.toFixed(0)}°`
      : `Trial Weight Run VT1 completed. Vibration: ${simVt1.amp.toFixed(1)} mm/s @ ${simVt1.phase.toFixed(0)}°`;
    
    const ruleStr = rule3030Check.passed
      ? (lang === "id" ? `✓ Aturan 30/30 LULUS. Amplitudo bergeser ${rule3030Check.ampDiff.toFixed(0)}%, sudut geser ${rule3030Check.phaseDiff.toFixed(0)}°.` : `✓ 30/30 Rule PASSED. Amplitude shift ${rule3030Check.ampDiff.toFixed(0)}%, phase shift ${rule3030Check.phaseDiff.toFixed(0)}°.`)
      : (lang === "id" ? `✗ Aturan 30/30 GAGAL! TW terlalu kecil (Amp geser ${rule3030Check.ampDiff.toFixed(0)}%, sudut geser ${rule3030Check.phaseDiff.toFixed(0)}°). Naikkan berat TW.` : `✗ 30/30 Rule FAILED! TW too small (Amp shift ${rule3030Check.ampDiff.toFixed(0)}%, phase shift ${rule3030Check.phaseDiff.toFixed(0)}°). Increase TW mass.`);

    setSimResultLogs(prev => [...prev, logStr, ruleStr]);
  };

  const handleRunCorrection = () => {
    setSimStep(6);
    // Result if user removed TW:
    // If they apply CW perfectly:
    let finalAmp = 0.45; // Small residual
    let finalPhase = 90;
    let logStr = "";

    if (simAfterTw === "remain") {
      // User forgot to remove TW physically but set "Remove" in calculation (or vice versa)
      // Result is polluted
      finalAmp = 6.2;
      finalPhase = 210;
      logStr = lang === "id"
        ? `✗ GAWAT! Amplitudo tersisa ${finalAmp.toFixed(1)} mm/s. Sisa unbalance tinggi karena berat uji TW tidak dilepas!`
        : `✗ WARNING! Residual vibration remains high at ${finalAmp.toFixed(1)} mm/s. Trial weight was NOT physically removed!`;
    } else {
      logStr = lang === "id"
        ? `✓ Sukses! Amplitudo teredam drastis menjadi ${finalAmp.toFixed(1)} mm/s RMS (LULUS standar ISO 1940 G6.3)`
        : `✓ Success! Residual vibration reduced to ${finalAmp.toFixed(1)} mm/s RMS (PASSED ISO 1940 G6.3 limits)`;
    }

    setSimV1({ amp: finalAmp, phase: finalPhase });
    setSimResultLogs(prev => [...prev, logStr]);
  };

  const handleResetSim = () => {
    setSimStep(1);
    setSimV0({ amp: 8.6, phase: 125 });
    setSimTwMass("10.0");
    setSimTwAngle("0");
    setSimAfterTw("remove");
    setSimResultLogs([]);
  };

  const inputStyle = {
    ...inputStyleBase
  };

  const cellStyle = (active: boolean) => ({
    padding: "16px", borderRadius: 10, cursor: "pointer",
    background: active ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.02)",
    border: `1px solid ${active ? "var(--accent)" : "rgba(255,255,255,0.05)"}`,
    textAlign: "center" as const, transition: "all 0.2s ease",
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* gE Filter Recommender */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🎯 {lang === "id" ? "Rekomendasi Filter Bandpass gE" : "gE Bandpass Filter Recommendation"}
        </h4>
        <div>
          <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>
            {lang === "id" ? "RPM MESIN" : "MACHINE RPM"}
          </label>
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

      {/* Interactive 2×2 Diagnostic Grid */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🔬 {lang === "id" ? "Matriks Diagnostik Kecepatan + gE (Klik Grid)" : "Velocity + gE Diagnostic Grid (Click to toggle)"}
        </h4>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {/* Row 1, Col 1: OK / OK */}
          <button
            onClick={() => { setVelTrend("ok"); setGeTrend("ok"); }}
            style={cellStyle(velTrend === "ok" && geTrend === "ok")}
          >
            <div style={{ fontSize: 18 }}>🟢</div>
            <div style={{ fontSize: 11, color: "var(--fg)", fontWeight: 700 }}>Vel OK | gE OK</div>
            <div style={{ fontSize: 9, color: "var(--muted)" }}>{lang === "id" ? "Kondisi Sehat" : "Healthy State"}</div>
          </button>

          {/* Row 1, Col 2: OK / Rising */}
          <button
            onClick={() => { setVelTrend("ok"); setGeTrend("rising"); }}
            style={cellStyle(velTrend === "ok" && geTrend === "rising")}
          >
            <div style={{ fontSize: 18 }}>🟡</div>
            <div style={{ fontSize: 11, color: "var(--fg)", fontWeight: 700 }}>Vel OK | gE Rising</div>
            <div style={{ fontSize: 9, color: "var(--muted)" }}>{lang === "id" ? "Bearing Dini" : "Early Bearing"}</div>
          </button>

          {/* Row 2, Col 1: Rising / OK */}
          <button
            onClick={() => { setVelTrend("rising"); setGeTrend("ok"); }}
            style={cellStyle(velTrend === "rising" && geTrend === "ok")}
          >
            <div style={{ fontSize: 18 }}>🔵</div>
            <div style={{ fontSize: 11, color: "var(--fg)", fontWeight: 700 }}>Vel Rising | gE OK</div>
            <div style={{ fontSize: 9, color: "var(--muted)" }}>{lang === "id" ? "Struktural / Unbalance" : "Structural/Unbalance"}</div>
          </button>

          {/* Row 2, Col 2: Rising / Rising */}
          <button
            onClick={() => { setVelTrend("rising"); setGeTrend("rising"); }}
            style={cellStyle(velTrend === "rising" && geTrend === "rising")}
          >
            <div style={{ fontSize: 18 }}>🔴</div>
            <div style={{ fontSize: 11, color: "var(--fg)", fontWeight: 700 }}>Vel Rising | gE Rising</div>
            <div style={{ fontSize: 9, color: "var(--muted)" }}>{lang === "id" ? "Kerusakan Bearing Aktif" : "Active Bearing Defect"}</div>
          </button>
        </div>

        {/* Diagnosis Outcome Panel */}
        <div style={{ padding: 16, borderRadius: 12, background: `${diagFlow.color}11`, border: `1px solid ${diagFlow.color}33` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: diagFlow.color }}>
            {diagFlow.diagnosis}
          </div>
          <p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "8px 0 0", lineHeight: 1.5 }}>
            {diagFlow.action}
          </p>
        </div>
      </div>

      {/* Interactive Single-Plane Balancing Simulator */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          ⚖️ {lang === "id" ? "Simulator Balancing Satu Bidang (8-Langkah)" : "Single-Plane Balancing Simulator (8-Step)"}
        </h4>

        {/* Visual Vector Circle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{
            position: "relative", width: 140, height: 140, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.3)"
          }}>
            {/* Center point */}
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 6, height: 6, borderRadius: "50%", background: "#fff", transform: "translate(-50%, -50%)" }} />
            
            {/* Degree Markers */}
            <div style={{ position: "absolute", top: 4, left: "50%", transform: "translateX(-50%)", fontSize: 8, color: "var(--muted)" }}>0°</div>
            <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", fontSize: 8, color: "var(--muted)" }}>180°</div>
            <div style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", fontSize: 8, color: "var(--muted)" }}>270°</div>
            <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 8, color: "var(--muted)" }}>90°</div>

            {/* V0 Unbalance Vector (Red Dot) */}
            {simStep >= 2 && (
              <div style={{
                position: "absolute",
                left: `calc(50% + ${Math.cos((simV0.phase * Math.PI) / 180) * 45}px)`,
                top: `calc(50% - ${Math.sin((simV0.phase * Math.PI) / 180) * 45}px)`,
                width: 10, height: 10, borderRadius: "50%", background: "#ef4444",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 10px #ef4444"
              }} title="V0 Vector" />
            )}

            {/* TW (Yellow Dot) */}
            {simStep >= 3 && (
              <div style={{
                position: "absolute",
                left: `calc(50% + ${Math.cos((twAngleNum * Math.PI) / 180) * 45}px)`,
                top: `calc(50% - ${Math.sin((twAngleNum * Math.PI) / 180) * 45}px)`,
                width: 8, height: 8, borderRadius: "50%", background: "#f59e0b",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 8px #f59e0b"
              }} title="Trial Weight" />
            )}

            {/* VT1 Vector (Yellow-Red Cross) */}
            {simStep >= 4 && (
              <div style={{
                position: "absolute",
                left: `calc(50% + ${Math.cos((simVt1.phase * Math.PI) / 180) * 35}px)`,
                top: `calc(50% - ${Math.sin((simVt1.phase * Math.PI) / 180) * 35}px)`,
                width: 6, height: 6, borderRadius: "50%", background: "#fbbf24",
                transform: "translate(-50%, -50%)",
              }} title="VT1 Vector" />
            )}

            {/* CW (Green Dot) */}
            {simStep >= 5 && (
              <div style={{
                position: "absolute",
                left: `calc(50% + ${Math.cos((simCwRecommendation.angle * Math.PI) / 180) * 45}px)`,
                top: `calc(50% - ${Math.sin((simCwRecommendation.angle * Math.PI) / 180) * 45}px)`,
                width: 10, height: 10, borderRadius: "50%", background: "#22c55e",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 10px #22c55e"
              }} title="Correction Weight" />
            )}
          </div>
        </div>

        {/* Step Guide Wizard */}
        <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.04)" }}>
          
          {/* Step 1: Initial Parameters Setup */}
          {simStep === 1 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 12 }}>
                {lang === "id" ? "Langkah 1: Konfigurasi Parameter Mesin" : "Step 1: Configure Machine Parameters"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>ROTOR MASS (kg)</label>
                  <input type="number" value={simRotorMass} onChange={e => setSimRotorMass(parseInt(e.target.value) || 0)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>SPEED (RPM)</label>
                  <input type="number" value={simRpm} onChange={e => setSimRpm(parseInt(e.target.value) || 0)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>RADIUS (mm)</label>
                  <input type="number" value={simRadius} onChange={e => setSimRadius(parseInt(e.target.value) || 0)} style={inputStyle} />
                </div>
              </div>
              <button onClick={handleStartSim} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "var(--accent)", color: "#000", border: "none", fontWeight: 700, cursor: "pointer" }}>
                {lang === "id" ? "MULAI PUTARAN AWAL (V0)" : "START REFERENCE RUN (V0)"}
              </button>
            </div>
          )}

          {/* Step 2: Reference Run & TW Estimate */}
          {simStep === 2 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>
                {lang === "id" ? "Langkah 2 & 3: Estimasi & Pemasangan Berat Uji (TW)" : "Step 2 & 3: Estimate & Install Trial Weight (TW)"}
              </div>
              <p style={{ fontSize: 12, color: "var(--fg-soft)", lineHeight: 1.5, margin: "0 0 12px" }}>
                {lang === "id"
                  ? "Berdasarkan massa rotor, rumus memperkirakan berat uji sekitar ~10 gram. Pasang berat uji fisik pada rotor dan catat massanya di bawah."
                  : "Based on rotor configuration, the calculated trial weight is ~10 grams. Install TW physically on rotor and enter values below."}
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>TW MASS (grams)</label>
                  <input type="text" value={simTwMass} onChange={e => setSimTwMass(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>TW ANGLE (°)</label>
                  <input type="text" value={simTwAngle} onChange={e => setSimTwAngle(e.target.value)} style={inputStyle} />
                </div>
              </div>

              <button onClick={handleRunTrial} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "var(--accent)", color: "#000", border: "none", fontWeight: 700, cursor: "pointer" }}>
                {lang === "id" ? "JALANKAN PUTARAN BERA UJI (VT1)" : "RUN TRIAL WEIGHT SPIN (VT1)"}
              </button>
            </div>
          )}

          {/* Step 4: Verify 30/30 & Recommend CW */}
          {simStep === 4 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>
                {lang === "id" ? "Langkah 4 & 5: Rekomendasi Berat Koreksi" : "Step 4 & 5: Correction Weight Recommendation"}
              </div>
              <p style={{ fontSize: 12, color: "var(--fg-soft)", lineHeight: 1.5, margin: "0 0 12px" }}>
                {lang === "id"
                  ? `Aturan 30/30 terpenuhi. Perangkat lunak Microlog menghitung Berat Koreksi (CW) yang diperlukan untuk meredam unbalance.`
                  : `30/30 Rule checked. The Microlog software calculates the required Correction Weight (CW) to offset the unbalance.`}
              </p>

              <div style={{ padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.3)", marginBottom: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>
                  {lang === "id" ? "REKOMENDASI BERAT KOREKSI (CW)" : "RECOMMENDED CORRECTION WEIGHT (CW)"}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#22c55e", marginTop: 4 }}>
                  {simCwRecommendation.mass} gram @ {simCwRecommendation.angle}°
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                  {lang === "id" ? "STATUS BERAT UJI (TW) LAPANGAN" : "FIELD TRIAL WEIGHT STATUS"}
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setSimAfterTw("remove")}
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: simAfterTw === "remove" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                      color: simAfterTw === "remove" ? "#22c55e" : "var(--muted)",
                      border: `1px solid ${simAfterTw === "remove" ? "#22c55e44" : "transparent"}`,
                      cursor: "pointer"
                    }}
                  >
                    {lang === "id" ? "Lepas Berat Uji (Remove)" : "Remove Trial Weight"}
                  </button>
                  <button
                    onClick={() => setSimAfterTw("remain")}
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: simAfterTw === "remain" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
                      color: simAfterTw === "remain" ? "#ef4444" : "var(--muted)",
                      border: `1px solid ${simAfterTw === "remain" ? "#ef444444" : "transparent"}`,
                      cursor: "pointer"
                    }}
                  >
                    {lang === "id" ? "Biarkan Terpasang (Remain)" : "Leave TW (Remain)"}
                  </button>
                </div>
              </div>

              <button onClick={handleRunCorrection} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "var(--accent)", color: "#000", border: "none", fontWeight: 700, cursor: "pointer" }}>
                {lang === "id" ? "JALANKAN PUTARAN KOREKSI (V1)" : "RUN CORRECTION SPIN (V1)"}
              </button>
            </div>
          )}

          {/* Step 6 & 8: Final Result */}
          {simStep === 6 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>
                {lang === "id" ? "Langkah 6 & 8: Verifikasi Sisa Vibrasi" : "Step 6 & 8: Verify Residual Vibration"}
              </div>
              
              <div style={{ padding: 12, borderRadius: 8, background: simV1.amp < 1.0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", marginBottom: 16, border: `1px solid ${simV1.amp < 1.0 ? "#22c55e" : "#ef4444"}33` }}>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>
                  {lang === "id" ? "GETARAN RESIDU AKHIR (V1)" : "FINAL RESIDUAL VIBRATION (V1)"}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: simV1.amp < 1.0 ? "#22c55e" : "#ef4444", marginTop: 4 }}>
                  {simV1.amp.toFixed(2)} mm/s RMS
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-soft)", marginTop: 4 }}>
                  {simV1.amp < 1.0 
                    ? (lang === "id" ? "Lulus kualifikasi standar penyeimbangan G6.3." : "Passed balancing G6.3 standards.") 
                    : (lang === "id" ? "Melebihi toleransi! Cek ulang instalasi fisik beban." : "Outside limits! Re-check physical weight installation.")}
                </div>
              </div>

              <button onClick={handleResetSim} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "var(--fg)", border: "none", fontWeight: 700, cursor: "pointer" }}>
                {lang === "id" ? "RESET SIMULATOR" : "RESET SIMULATOR"}
              </button>
            </div>
          )}

          {/* Real-time Logger Console */}
          {simResultLogs.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Console Log</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-soft)" }}>
                {simResultLogs.map((log, index) => (
                  <div key={index} style={{ whiteSpace: "pre-wrap" }}>◈ {log}</div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SkfMicrologPage() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<TabKey>("modules");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const handleSelectModule = useCallback((id: string) => {
    setActiveTab("modules");
    setSelectedModuleId(id);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

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
              ? "Platform pembelajaran analisis getaran untuk tim PTTS. 7 modul interaktif, kalkulator keparahan, diagram diagnostik, dan simulator balancing."
              : "Vibration analysis learning platform for PTTS team. 7 interactive modules, severity calculator, diagnostic charts, and balancing simulator."
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
        {activeTab === "modules" && <TabModules lang={lang} selectedId={selectedModuleId} setSelectedId={setSelectedModuleId} />}
        {activeTab === "severity" && <TabSeverity lang={lang} />}
        {activeTab === "diagnostic" && <TabDiagnostic lang={lang} />}
        {activeTab === "paths" && <TabPaths lang={lang} onSelectModule={handleSelectModule} />}
        {activeTab === "tools" && <TabTools lang={lang} />}
      </main>

      <Footer />
      <div style={{ textAlign: "center", padding: "0 0 120px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", opacity: 0.4 }}>
        By DummVinci · DummVinci Calculator
      </div>
    </div>
  );
}
