"use client";

import React, { useState, useMemo, useCallback } from "react";
import type { ModuleData } from "@/data/skf-microlog/modules";
import { GLASS, getModuleIdData, getTagColor } from "../_shared";
import SkfMicrologVisualizer from "./SkfMicrologVisualizer";

interface Props { mod: ModuleData; lang: "en" | "id"; }

/**
 * Long-form module reader: header + visualizer + mental model + sections +
 * Active-recall (interactive quiz or reveal-all) + pitfalls + cheat sheet.
 * Pulls the ID translation overlay from MODULES_ID when lang === "id".
 */
export default function ModuleDetail({ mod, lang }: Props) {
  // Helper to render interactive section content when "→" is detected.
  const renderSectionContent = (text: string) => {
    if (!text.includes("→")) return <p style={{ fontSize: 13, color: "var(--fg-soft)", lineHeight: 1.5, margin: 0 }}>{text}</p>;
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

  const content = useMemo(() => {
    const modDataId = getModuleIdData(mod.id);
    if (lang === "id" && modDataId) {
      const translated = modDataId;
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

  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScores, setQuizScores] = useState<Record<number, "mastered" | "review">>({});
  const [revealedQ, setRevealedQ] = useState<Set<number>>(new Set());

  const toggleReveal = useCallback((idx: number) => {
    setRevealedQ(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }, []);

  const handleOptionSelect = (optIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIndex);
    const question = content.activeRecall.at(currentQuestionIndex);
    const isCorrect = question ? optIndex === question.correctAnswer : false;
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
  const reviewCount   = Object.values(quizScores).filter(s => s === "review").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ ...GLASS, background: "rgba(var(--accent-rgb),0.06)", borderColor: "rgba(var(--accent-rgb),0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 36 }}>{mod.icon}</span>
          <div>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
              padding: "2px 8px", borderRadius: 6,
              background: `${getTagColor(mod.tag)}22`, color: getTagColor(mod.tag),
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

      {/* Active Recall */}
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
                background: !quizMode ? "rgba(var(--accent-rgb),0.2)" : "rgba(255,255,255,0.04)",
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
                background: quizMode ? "rgba(var(--accent-rgb),0.2)" : "rgba(255,255,255,0.04)",
                color: quizMode ? "var(--accent)" : "var(--muted)",
                border: "none", cursor: "pointer", fontFamily: "var(--font-mono)",
              }}
            >
              {lang === "id" ? "MODE KUIS" : "QUIZ MODE"}
            </button>
          </div>
        </div>

        {quizMode ? (
          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 18, border: "1px solid rgba(255,255,255,0.05)" }}>
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
              {content.activeRecall.at(currentQuestionIndex)?.q}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {content.activeRecall.at(currentQuestionIndex)?.options?.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const activeQ = content.activeRecall.at(currentQuestionIndex);
                const isCorrect = activeQ ? idx === activeQ.correctAnswer : false;
                const showFeedback = selectedOption !== null;

                let bgColor = "rgba(255,255,255,0.03)";
                let borderColor = "rgba(255,255,255,0.06)";
                let color = "var(--fg-soft)";

                if (showFeedback) {
                  if (isCorrect)        { bgColor = "rgba(34,197,94,0.15)"; borderColor = "rgba(34,197,94,0.5)"; color = "#22c55e"; }
                  else if (isSelected)  { bgColor = "rgba(239,68,68,0.15)"; borderColor = "rgba(239,68,68,0.5)"; color = "#ef4444"; }
                } else if (isSelected) { bgColor = "rgba(var(--accent-rgb),0.1)"; borderColor = "var(--accent)"; }

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
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{String.fromCharCode(65 + idx)}.</span>
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedOption !== null && (
              <div style={{ marginBottom: 20, animation: "fadeIn 0.3s ease" }}>
                {(() => {
                  const activeQ = content.activeRecall.at(currentQuestionIndex);
                  if (!activeQ) return null;
                  return selectedOption === activeQ.correctAnswer ? (
                    <div style={{ padding: 12, background: "rgba(34,197,94,0.1)", borderLeft: "3px solid #22c55e", borderRadius: 4, fontSize: 13, color: "#22c55e" }}>
                      <strong>{lang === "id" ? "Benar!" : "Correct!"}</strong>
                      {activeQ.hint && ` — ${activeQ.hint}`}
                    </div>
                  ) : (
                    <div style={{ padding: 12, background: "rgba(239,68,68,0.1)", borderLeft: "3px solid #ef4444", borderRadius: 4, fontSize: 13, color: "#ef4444" }}>
                      <strong>{lang === "id" ? "Kurang tepat." : "Incorrect."}</strong>
                      {activeQ.hint && ` — Hint: ${activeQ.hint}`}
                    </div>
                  );
                })()}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <button disabled={currentQuestionIndex === 0} onClick={handlePrev}
                style={{
                  padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)",
                  border: "none", color: currentQuestionIndex === 0 ? "var(--muted)" : "var(--fg-soft)",
                  cursor: currentQuestionIndex === 0 ? "default" : "pointer", fontSize: 11, fontWeight: 600
                }}>
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
                }}>
                {lang === "id" ? "Lanjut" : "Next"} →
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {content.activeRecall.map((q, i) => (
              <button key={i} onClick={() => toggleReveal(i)}
                style={{
                  textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer",
                  background: revealedQ.has(i) ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${revealedQ.has(i) ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`,
                  transition: "all 0.2s ease",
                }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", marginTop: 2, flexShrink: 0 }}>Q{i + 1}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.5, fontWeight: 500 }}>{q.q}</span>
                    {revealedQ.has(i) && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "#22c55e", fontFamily: "var(--font-mono)" }}>
                        ✓ {q.options.at(q.correctAnswer)}
                      </div>
                    )}
                  </div>
                </div>
                {revealedQ.has(i) && q.hint && (
                  <div style={{ marginTop: 12, marginLeft: 24, padding: "6px 10px", background: "rgba(var(--accent-rgb),0.08)", borderRadius: 6, fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)", opacity: 0.9 }}>
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
