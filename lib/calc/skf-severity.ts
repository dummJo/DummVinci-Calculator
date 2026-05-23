// lib/calc/skf-severity.ts
// Pure calculation functions for SKF Microlog severity assessment
// No side effects — fully testable
// All thresholds trace to source material (File 02 §2, File 06)

import { SEVERITY_TABLE, GE_LEVELS, ISO_GENERAL_ZONES, ADJUSTMENT_FACTORS, GE_FILTER_RANGES } from "@/data/skf-microlog/severity";
import type { SeverityEntry } from "@/data/skf-microlog/severity";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SeverityResult {
  zone: "Good" | "Fair" | "Alarm1" | "Alarm2";
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
  adjustments?: { isolator?: boolean; externalGearbox?: boolean; newMachine?: boolean },
  lang: "en" | "id" = "en"
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

  let good = machine.good;
  let fair = machine.fair;

  if (good !== undefined && fair !== undefined) {
    if (adjustments?.newMachine) {
      good = good * ADJUSTMENT_FACTORS.newRebuilt;
      fair = fair * ADJUSTMENT_FACTORS.newRebuilt;
    }
    good *= multiplier;
    fair *= multiplier;
  }

  let zone: "Good" | "Fair" | "Alarm1" | "Alarm2";
  let label: string;
  let color: string;

  if (good !== undefined && fair !== undefined) {
    if (velocityRms < good) {
      zone = "Good";
      label = lang === "id" 
        ? "Baik — Dalam batas presisi yang dapat diterima" 
        : "Good — Within precision acceptable limits";
      color = "#22c55e"; // green
    } else if (velocityRms < fair) {
      zone = "Fair";
      label = lang === "id" 
        ? "Cukup (Fair) — Dapat diterima untuk operasi kontinu (pantau)" 
        : "Fair — Acceptable for continued operation (monitor)";
      color = "#84cc16"; // lime
    } else if (velocityRms < alarm2) {
      zone = "Alarm1";
      label = lang === "id" 
        ? "Peringatan (Kasar) — Jadwalkan perawatan" 
        : "Warning (Rough) — Schedule maintenance";
      color = "#f59e0b"; // amber
    } else {
      zone = "Alarm2";
      label = lang === "id" 
        ? "Bahaya (Sangat Kasar) — Tindakan segera diperlukan" 
        : "Fault (Very Rough) — Immediate action required";
      color = "#ef4444"; // red
    }
  } else {
    if (velocityRms < alarm1) {
      zone = "Good";
      label = lang === "id" 
        ? "Baik — Dalam batas yang dapat diterima" 
        : "Good — Within acceptable limits";
      color = "#22c55e"; // green
    } else if (velocityRms < alarm2) {
      zone = "Alarm1";
      label = lang === "id" 
        ? "Peringatan — Jadwalkan perawatan" 
        : "Warning — Schedule maintenance";
      color = "#f59e0b"; // amber
    } else {
      zone = "Alarm2";
      label = lang === "id" 
        ? "Bahaya — Tindakan segera diperlukan" 
        : "Fault — Immediate action required";
      color = "#ef4444"; // red
    }
  }

  return { zone, label, color, alarm1Adj: alarm1, alarm2Adj: alarm2, machine };
}

// ─── ISO 20816 General Heuristic Zone ─────────────────────────────────────────
// Source: File 02 cheat sheet — universal rough guide

export function getGeneralSeverityZone(velocityRms: number, lang: "en" | "id" = "en"): GeneralZoneResult {
  if (velocityRms < ISO_GENERAL_ZONES.good) {
    return {
      zone: "A",
      label: lang === "id" ? "Baik (Zone A)" : "Good (Zone A)",
      color: "#22c55e",
      description: lang === "id" ? "Kondisi mesin sangat baik — tidak perlu tindakan" : "Machine condition excellent — no action needed"
    };
  } else if (velocityRms < ISO_GENERAL_ZONES.satisfactory) {
    return {
      zone: "B",
      label: lang === "id" ? "Memuaskan (Zone B)" : "Satisfactory (Zone B)",
      color: "#84cc16",
      description: lang === "id" ? "Dapat diterima untuk operasi berkelanjutan" : "Acceptable for continued operation"
    };
  } else if (velocityRms < ISO_GENERAL_ZONES.unsatisfactory) {
    return {
      zone: "C",
      label: lang === "id" ? "Kurang Memuaskan (Zone C)" : "Unsatisfactory (Zone C)",
      color: "#f59e0b",
      description: lang === "id" ? "Rencanakan perawatan — selidiki akar masalah" : "Plan maintenance — investigate root cause"
    };
  } else {
    return {
      zone: "D",
      label: lang === "id" ? "Tidak Dapat Diterima (Zone D)" : "Unacceptable (Zone D)",
      color: "#ef4444",
      description: lang === "id" ? "Tindakan segera diperlukan — risiko kerusakan tinggi" : "Immediate action required — risk of damage"
    };
  }
}

// ─── gE Bearing Health Assessment ─────────────────────────────────────────────
// Source: File 06 — gE level interpretation
// < 0.5 healthy, 0.5–1.0 Stage 1–2, 1.0–2.0 Stage 3, > 2.0 Severe

export function getBearingStage(gELevel: number, lang: "en" | "id" = "en"): BearingStageResult {
  const colorFor = (urgency: "normal" | "monitor" | "plan" | "immediate"): string => {
    if (urgency === "normal") return "#22c55e";
    if (urgency === "monitor") return "#f59e0b";
    if (urgency === "plan") return "#f97316";
    return "#ef4444"; // immediate
  };

  for (const level of GE_LEVELS) {
    if (gELevel < level.maxGe) {
      let stage = level.stage;
      let action = level.action;
      if (lang === "id") {
        if (level.urgency === "normal") {
          stage = "Sehat (Healthy)";
          action = "Lanjutkan jadwal PM rutin";
        } else if (level.urgency === "monitor") {
          stage = "Tahap 1–2 (Kerusakan Dini)";
          action = "Tingkatkan frekuensi pemantauan gE menjadi mingguan";
        } else if (level.urgency === "plan") {
          stage = "Tahap 3 (Kerusakan Aktif)";
          action = "Jadwalkan penggantian bearing pada stop terencana berikutnya";
        } else if (level.urgency === "immediate") {
          stage = "Tahap 4 (Kritis/Parah)";
          action = "Ganti bearing segera — risiko kegagalan katastropik mendesak";
        }
      }
      return {
        stage,
        action,
        urgency: level.urgency,
        color: colorFor(level.urgency),
      };
    }
  }
  // Fallback (should not reach due to Infinity)
  const last = GE_LEVELS[GE_LEVELS.length - 1];
  let stage = last.stage;
  let action = last.action;
  if (lang === "id") {
    stage = "Tahap 4 (Kritis/Parah)";
    action = "Ganti bearing segera — risiko kegagalan katastropik mendesak";
  }
  return { stage, action, urgency: last.urgency, color: colorFor(last.urgency) };
}

// ─── Combined Velocity + gE Diagnostic Flow ──────────────────────────────────
// Source: File 06 cheat sheet — 2×2 matrix

export function getDiagnosticFlow(
  velocityTrend: "ok" | "rising",
  geTrend: "ok" | "rising",
  lang: "en" | "id" = "en"
): DiagnosticFlowResult {
  if (velocityTrend === "ok" && geTrend === "ok") {
    return {
      diagnosis: lang === "id" ? "Sehat (Healthy)" : "Healthy",
      action: lang === "id" ? "Lanjutkan jadwal pemeliharaan rutin" : "Continue routine PM schedule",
      color: "#22c55e",
    };
  } else if (velocityTrend === "ok" && geTrend === "rising") {
    return {
      diagnosis: lang === "id" ? "Kerusakan bearing dini (Tahap 1–2)" : "Early bearing defect (Stage 1–2)",
      action: lang === "id" 
        ? "Tingkatkan pemantauan gE menjadi mingguan. Rencanakan penggantian bearing." 
        : "Increase gE monitoring to weekly. Plan bearing replacement.",
      color: "#f59e0b",
    };
  } else if (velocityTrend === "rising" && geTrend === "rising") {
    return {
      diagnosis: lang === "id" ? "Kerusakan bearing Tahap 3 — kerusakan aktif" : "Stage 3 bearing defect — active damage",
      action: lang === "id"
        ? "Jadwalkan penggantian bearing pada stop terencana berikutnya."
        : "Schedule bearing replacement at next planned outage.",
      color: "#f97316",
    };
  } else {
    // velocityTrend rising, geTrend ok
    return {
      diagnosis: lang === "id" 
        ? "BUKAN bearing — cek unbalance / misalignment / looseness" 
        : "NOT bearing — check unbalance / misalignment / looseness",
      action: lang === "id"
        ? "Lakukan analisis spektrum diagnostik. JANGAN asumsikan bearing rusak."
        : "Run diagnostic spectrum analysis (File 02 §4). Do NOT assume bearing.",
      color: "#3b82f6",
    };
  }
}

// ─── gE Bandpass Filter Recommendation ────────────────────────────────────────
// Source: File 06 §3

export function recommendGeFilter(rpm: number, lang: "en" | "id" = "en"): GeFilterResult {
  let range;
  if (rpm < 100) range = GE_FILTER_RANGES[0];
  else if (rpm < 500) range = GE_FILTER_RANGES[1];
  else if (rpm <= 10000) range = GE_FILTER_RANGES[2];
  else range = GE_FILTER_RANGES[3];

  let name = range.name;
  if (lang === "id") {
    if (range.lowHz === 5) name = "Sangat lambat (<100 RPM)";
    else if (range.lowHz === 50) name = "Lambat (100–500 RPM)";
    else if (range.lowHz === 500) name = "Standar industri";
    else name = "Kecepatan tinggi (>10000 RPM)";
  }

  return {
    name,
    lowHz: range.lowHz,
    highHz: range.highHz
  };
}
