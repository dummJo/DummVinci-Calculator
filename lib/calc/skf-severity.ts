// lib/calc/skf-severity.ts
// Pure calculation functions for SKF Microlog severity assessment
// No side effects — fully testable
// All thresholds trace to source material (File 02 §2, File 06)

import { SEVERITY_TABLE, GE_LEVELS, ISO_GENERAL_ZONES, ADJUSTMENT_FACTORS, GE_FILTER_RANGES } from "@/data/skf-microlog/severity";
import type { SeverityEntry } from "@/data/skf-microlog/severity";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SeverityResult {
  zone: "Good" | "Alarm1" | "Alarm2";
  label: string;
  color: string;
  alarm1Adj: number;
  alarm2Adj: number;
  machine: SeverityEntry;
}

export interface GeneralZoneResult {
  zone: "A" | "B" | "C" | "D";
  label: string;
  color: string;
  description: string;
}

export interface BearingStageResult {
  stage: string;
  action: string;
  urgency: "normal" | "monitor" | "plan" | "immediate";
  color: string;
}

export interface DiagnosticFlowResult {
  diagnosis: string;
  action: string;
  color: string;
}

export interface GeFilterResult {
  name: string;
  lowHz: number;
  highHz: number;
}

// ─── Machine-Specific Severity Zone ───────────────────────────────────────────
// Source: File 02 §2 — Figure 13 (Technical Associates of Charlotte)

export function getMachineSeverityZone(
  velocityRms: number,
  machineSubType: string,
  adjustments?: { isolator?: boolean; externalGearbox?: boolean; newMachine?: boolean }
): SeverityResult | null {
  const machine = SEVERITY_TABLE.find(e => e.subType === machineSubType);
  if (!machine) return null;

  // Apply adjustment factors per File 02 §2 notes
  let multiplier = 1;
  if (adjustments?.isolator) multiplier *= ADJUSTMENT_FACTORS.vibrationIsolator;      // +40% threshold
  if (adjustments?.externalGearbox) multiplier *= ADJUSTMENT_FACTORS.externalGearbox;  // +25% threshold

  let alarm1 = machine.alarm1;
  let alarm2 = machine.alarm2;

  if (adjustments?.newMachine) {
    // New/rebuilt: acceptance = ~33% of Alarm 1
    alarm1 = machine.alarm1 * ADJUSTMENT_FACTORS.newRebuilt;
    alarm2 = machine.alarm1; // Use normal Alarm 1 as upper bound for new
  }

  alarm1 *= multiplier;
  alarm2 *= multiplier;

  let zone: "Good" | "Alarm1" | "Alarm2";
  let label: string;
  let color: string;

  if (velocityRms < alarm1) {
    zone = "Good";
    label = "Good — Within acceptable limits";
    color = "#22c55e"; // green
  } else if (velocityRms < alarm2) {
    zone = "Alarm1";
    label = "Warning — Schedule maintenance";
    color = "#f59e0b"; // amber
  } else {
    zone = "Alarm2";
    label = "Fault — Immediate action required";
    color = "#ef4444"; // red
  }

  return { zone, label, color, alarm1Adj: alarm1, alarm2Adj: alarm2, machine };
}

// ─── ISO 20816 General Heuristic Zone ─────────────────────────────────────────
// Source: File 02 cheat sheet — universal rough guide

export function getGeneralSeverityZone(velocityRms: number): GeneralZoneResult {
  if (velocityRms < ISO_GENERAL_ZONES.good) {
    return {
      zone: "A",
      label: "Good",
      color: "#22c55e",
      description: "Machine condition excellent — no action needed"
    };
  } else if (velocityRms < ISO_GENERAL_ZONES.satisfactory) {
    return {
      zone: "B",
      label: "Satisfactory",
      color: "#84cc16",
      description: "Acceptable for continued operation"
    };
  } else if (velocityRms < ISO_GENERAL_ZONES.unsatisfactory) {
    return {
      zone: "C",
      label: "Unsatisfactory",
      color: "#f59e0b",
      description: "Plan maintenance — investigate root cause"
    };
  } else {
    return {
      zone: "D",
      label: "Unacceptable",
      color: "#ef4444",
      description: "Immediate action required — risk of damage"
    };
  }
}

// ─── gE Bearing Health Assessment ─────────────────────────────────────────────
// Source: File 06 — gE level interpretation
// < 0.5 healthy, 0.5–1.0 Stage 1–2, 1.0–2.0 Stage 3, > 2.0 Severe

export function getBearingStage(gELevel: number): BearingStageResult {
  const colorFor = (urgency: "normal" | "monitor" | "plan" | "immediate"): string => {
    if (urgency === "normal") return "#22c55e";
    if (urgency === "monitor") return "#f59e0b";
    if (urgency === "plan") return "#f97316";
    return "#ef4444"; // immediate
  };

  for (const level of GE_LEVELS) {
    if (gELevel < level.maxGe) {
      return {
        stage: level.stage,
        action: level.action,
        urgency: level.urgency,
        color: colorFor(level.urgency),
      };
    }
  }
  // Fallback (should not reach due to Infinity)
  const last = GE_LEVELS[GE_LEVELS.length - 1];
  return { stage: last.stage, action: last.action, urgency: last.urgency, color: colorFor(last.urgency) };
}

// ─── Combined Velocity + gE Diagnostic Flow ──────────────────────────────────
// Source: File 06 cheat sheet — 2×2 matrix

export function getDiagnosticFlow(
  velocityTrend: "ok" | "rising",
  geTrend: "ok" | "rising"
): DiagnosticFlowResult {
  if (velocityTrend === "ok" && geTrend === "ok") {
    return {
      diagnosis: "Healthy",
      action: "Continue routine PM schedule",
      color: "#22c55e",
    };
  } else if (velocityTrend === "ok" && geTrend === "rising") {
    return {
      diagnosis: "Early bearing defect (Stage 1–2)",
      action: "Increase gE monitoring to weekly. Plan bearing replacement.",
      color: "#f59e0b",
    };
  } else if (velocityTrend === "rising" && geTrend === "rising") {
    return {
      diagnosis: "Stage 3 bearing defect — active damage",
      action: "Schedule bearing replacement at next planned outage.",
      color: "#f97316",
    };
  } else {
    // velocityTrend rising, geTrend ok
    return {
      diagnosis: "NOT bearing — check unbalance / misalignment / looseness",
      action: "Run diagnostic spectrum analysis (File 02 §4). Do NOT assume bearing.",
      color: "#3b82f6",
    };
  }
}

// ─── gE Bandpass Filter Recommendation ────────────────────────────────────────
// Source: File 06 §3

export function recommendGeFilter(rpm: number): GeFilterResult {
  if (rpm < 100) return GE_FILTER_RANGES[0];
  if (rpm < 500) return GE_FILTER_RANGES[1];
  if (rpm <= 10000) return GE_FILTER_RANGES[2];
  return GE_FILTER_RANGES[3];
}
