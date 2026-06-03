// Shared types, constants, and i18n lookups used across the SKF Microlog tab tree.
// Lives under the page's underscore-prefixed folder so Next.js does NOT treat it as
// a route, and so other pages cannot accidentally couple to it.

import { MODULES_ID } from "@/data/skf-microlog/modules-id";
import { DIAGNOSTIC_PATTERNS_ID } from "@/data/skf-microlog/diagnostic-patterns-id";
import { LEARNING_GOALS_ID } from "@/data/skf-microlog/learning-paths-id";

export type TabKey = "modules" | "severity" | "diagnostic" | "paths" | "tools";

export const TABS: { key: TabKey; labelEn: string; labelId: string; icon: string }[] = [
  { key: "modules",    labelEn: "Modules",    labelId: "Modul",        icon: "📚" },
  { key: "severity",   labelEn: "Severity",   labelId: "Severity",     icon: "📊" },
  { key: "diagnostic", labelEn: "Diagnosis",  labelId: "Diagnosis",    icon: "🔍" },
  { key: "paths",      labelEn: "Paths",      labelId: "Jalur Belajar", icon: "🗺️" },
  { key: "tools",      labelEn: "Tools / Sim", labelId: "Alat / Sim",   icon: "⚙️" },
];

export const GLASS = {
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
  padding: 20,
} as const;

export const TAG_COLORS: Record<string, string> = {
  THEORY: "#3b82f6",
  REFERENCE: "#f59e0b",
  TOOL: "#22c55e",
  SOP: "#a855f7",
  "CHEAT SHEET": "#ef4444",
};

export const inputStyleBase = {
  width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
  background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)",
  color: "var(--fg)", fontFamily: "var(--font-mono)", outline: "none",
  transition: "border-color 0.2s ease",
} as const;

// Direct map lookups — the data objects are Record<string, T>, so a switch over a
// hand-maintained key list silently drops entries when the catalog grows. This was
// the exact bug that hid ~30 of 33 Indonesian diagnostic patterns under the old
// version (keys M1/M2/U1 didn't exist — real keys are A1–L4).
export const getModuleIdData            = (id: string) => Reflect.get(MODULES_ID,             id);
export const getDiagnosticPatternIdData = (id: string) => Reflect.get(DIAGNOSTIC_PATTERNS_ID, id);
export const getLearningGoalIdData      = (id: string) => Reflect.get(LEARNING_GOALS_ID,      id);

export const getTagColor = (tag: string): string =>
  Reflect.get(TAG_COLORS, tag) ?? "#666";
