"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/lib/i18n";
import {
  LEARNING_GOALS, LEARNING_ITERATIONS, CROSS_CUTTING_PITFALLS,
} from "@/data/skf-microlog/learning-paths";
import {
  LEARNING_ITERATIONS_ID, CROSS_CUTTING_PITFALLS_ID,
} from "@/data/skf-microlog/learning-paths-id";
import { GLASS, getLearningGoalIdData } from "../_shared";
import DependencyTreeVisual from "../_components/DependencyTreeVisual";

interface Props { lang: "en" | "id"; onSelectModule: (id: string) => void; }

/** Learning Paths — goal cards, selected goal detail, dependency tree, iterations,
 *  and the cross-cutting pitfalls reference list. */
export default function TabPaths({ lang, onSelectModule }: Props) {
  const { t } = useLang();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const goals = LEARNING_GOALS;
  const goal = selectedGoal ? goals.find(g => g.id === selectedGoal) : null;

  const localizedGoal = useMemo(() => {
    if (!goal) return null;
    const goalIdData = getLearningGoalIdData(goal.id);
    if (lang === "id" && goalIdData) return goalIdData;
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
      {/* Goal cards */}
      <div>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🎯 {lang === "id" ? "Tentukan Target Belajar Anda" : "Pick Your Learning Goal"}
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {goals.map(g => {
            const currentGoalIdData = getLearningGoalIdData(g.id);
            const currentGoal = lang === "id" && currentGoalIdData ? currentGoalIdData : g;
            return (
              <button key={g.id} onClick={() => setSelectedGoal(selectedGoal === g.id ? null : g.id)}
                style={{
                  ...GLASS, padding: 14, textAlign: "left", cursor: "pointer",
                  borderColor: selectedGoal === g.id ? "var(--accent)" : "var(--glass-border)",
                  background: selectedGoal === g.id ? "rgba(var(--accent-rgb),0.08)" : "var(--glass-bg)",
                  transition: "all 0.2s ease",
                }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 800, color: "var(--accent)" }}>
                  {t.home.calcs.skfMicrolog.goal} {g.id}
                </span>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)", margin: "6px 0 4px" }}>{currentGoal.title}</h5>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>⏱ {currentGoal.timeEstimate}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Goal Detail */}
      {localizedGoal && goal && (
        <div style={{ ...GLASS, background: "rgba(var(--accent-rgb),0.04)", borderColor: "rgba(var(--accent-rgb),0.15)" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--accent)", marginBottom: 6 }}>
            {t.home.calcs.skfMicrolog.goal} {goal.id}: {localizedGoal.title}
          </h4>
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
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                    ⏱ {lang === "id" ? "durasi" : "duration"}: {iter.duration}
                  </span>
                </div>
              </div>
              <ul style={{ margin: 0, paddingLeft: 36, display: "flex", flexDirection: "column", gap: 4 }}>
                {iter.steps.map((s, j) => (<li key={j} style={{ fontSize: 12, color: "var(--fg-soft)", lineHeight: 1.5 }}>{s}</li>))}
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
            const originalPitfall = CROSS_CUTTING_PITFALLS.at(i);
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, padding: 10, borderRadius: 8, background: "rgba(239,68,68,0.04)", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>{p.pitfall}</span>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)", whiteSpace: "nowrap" }}>
                  {t.home.calcs.skfMicrolog.fileLabel} {originalPitfall?.files}
                </span>
                <span style={{ fontSize: 11, color: "var(--fg-soft)" }}>{p.note}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
