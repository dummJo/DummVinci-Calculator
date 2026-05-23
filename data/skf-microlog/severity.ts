// data/skf-microlog/severity.ts
// Vibration severity thresholds — ISO 20816, IRD/Technical Associates Figure 13, SKF gE levels
// Source: 02-Vibration-Severity-Diagnostics-Charts.md §2, 06-Template-gE-Enveloping-Measurement.md

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SeverityEntry {
  category: string;
  subType: string;
  alarm1: number;  // mm/s RMS — Warning
  alarm2: number;  // mm/s RMS — Fault
  good?: number;   // Machine tools only
  fair?: number;   // Machine tools only
}

export interface GeLevelEntry {
  maxGe: number;
  stage: string;
  action: string;
  urgency: "normal" | "monitor" | "plan" | "immediate";
}

export interface GeFilterRange {
  name: string;
  lowHz: number;
  highHz: number;
  rpmRange: string;
}

// ─── Severity Table (Figure 13 — Technical Associates of Charlotte, R-2010-01M) ──

export const SEVERITY_TABLE: SeverityEntry[] = [
  // Cooling Tower Drives
  { category: "Cooling Tower Drives", subType: "Long hollow drive shaft", alarm1: 11.0, alarm2: 16.0 },
  { category: "Cooling Tower Drives", subType: "Close coupled belt drive", alarm1: 7.5, alarm2: 12.0 },
  { category: "Cooling Tower Drives", subType: "Close coupled direct drive", alarm1: 5.5, alarm2: 8.0 },

  // Compressors
  { category: "Compressors", subType: "Reciprocating", alarm1: 9.0, alarm2: 13.5 },
  { category: "Compressors", subType: "Rotary screw", alarm1: 8.0, alarm2: 12.0 },
  { category: "Compressors", subType: "Centrifugal w/ or w/o external gearbox", alarm1: 6.5, alarm2: 8.0 },
  { category: "Compressors", subType: "Centrifugal integral-gear (axial meas)", alarm1: 5.5, alarm2: 8.0 },
  { category: "Compressors", subType: "Centrifugal integral-gear (radial meas)", alarm1: 4.5, alarm2: 6.5 },

  // Blowers / Fans
  { category: "Blowers / Fans", subType: "Lobe-type rotary", alarm1: 8.0, alarm2: 12.0 },
  { category: "Blowers / Fans", subType: "Belt-driven blowers", alarm1: 7.5, alarm2: 11.5 },
  { category: "Blowers / Fans", subType: "General direct drive (with coupling)", alarm1: 6.5, alarm2: 10.0 },
  { category: "Blowers / Fans", subType: "Primary air fans", alarm1: 6.5, alarm2: 10.0 },
  { category: "Blowers / Fans", subType: "Vacuum blowers", alarm1: 5.5, alarm2: 8.0 },
  { category: "Blowers / Fans", subType: "Large forced-draft fans", alarm1: 5.5, alarm2: 8.0 },
  { category: "Blowers / Fans", subType: "Large induced-draft fans", alarm1: 5.0, alarm2: 7.5 },
  { category: "Blowers / Fans", subType: "Shaft-mounted integral fan", alarm1: 5.0, alarm2: 7.5 },
  { category: "Blowers / Fans", subType: "Vane-axial", alarm1: 4.5, alarm2: 6.5 },

  // Motor / Generator Sets
  { category: "Motor / Generator", subType: "Belt-driven", alarm1: 7.5, alarm2: 12.0 },
  { category: "Motor / Generator", subType: "Direct coupled", alarm1: 5.5, alarm2: 8.0 },

  // Chillers
  { category: "Chillers", subType: "Reciprocating", alarm1: 7.0, alarm2: 10.5 },
  { category: "Chillers", subType: "Centrifugal (open-air)", alarm1: 5.5, alarm2: 8.0 },
  { category: "Chillers", subType: "Centrifugal (hermetic)", alarm1: 4.0, alarm2: 6.0 },

  // Large Turbine / Generators
  { category: "Large Turbine / Generator", subType: "3600 RPM Turbine/Gen", alarm1: 5.0, alarm2: 7.0 },
  { category: "Large Turbine / Generator", subType: "1800 RPM Turbine/Gen", alarm1: 4.0, alarm2: 8.0 },

  // Centrifugal Pumps
  { category: "Centrifugal Pumps", subType: "Vertical pump (4–6m height)", alarm1: 9.0, alarm2: 13.5 },
  { category: "Centrifugal Pumps", subType: "Vertical pump (3–4m height)", alarm1: 7.5, alarm2: 11.5 },
  { category: "Centrifugal Pumps", subType: "Vertical pump (2–3m height)", alarm1: 6.0, alarm2: 9.5 },
  { category: "Centrifugal Pumps", subType: "Vertical pump (1–2m height)", alarm1: 5.5, alarm2: 8.0 },
  { category: "Centrifugal Pumps", subType: "General horizontal pump (direct coupled)", alarm1: 5.5, alarm2: 8.0 },
  { category: "Centrifugal Pumps", subType: "Boiler feed pump (horizontal)", alarm1: 5.5, alarm2: 8.0 },
  { category: "Centrifugal Pumps", subType: "Piston-type hydraulic pump (under load)", alarm1: 4.5, alarm2: 7.0 },

  // Machine Tools (have Good/Fair thresholds too)
  { category: "Machine Tools", subType: "Motor", alarm1: 3.0, alarm2: 4.5 },
  { category: "Machine Tools", subType: "Gearbox input", alarm1: 4.0, alarm2: 6.0 },
  { category: "Machine Tools", subType: "Gearbox output", alarm1: 2.5, alarm2: 3.5 },
  { category: "Machine Tools", subType: "Spindle roughing", alarm1: 1.8, alarm2: 2.5, good: 1.2, fair: 1.8 },
  { category: "Machine Tools", subType: "Spindle machine finishing", alarm1: 1.1, alarm2: 1.6, good: 0.7, fair: 1.1 },
  { category: "Machine Tools", subType: "Spindle critical finishing", alarm1: 0.75, alarm2: 1.0, good: 0.5, fair: 0.75 },
];

// ─── gE Severity Levels (File 06 — SKF gE interpretation) ─────────────────────
// Note: Trending > absolute value. Always compare with historical baseline.

export const GE_LEVELS: GeLevelEntry[] = [
  { maxGe: 0.5, stage: "Healthy", action: "Continue routine PM", urgency: "normal" },
  { maxGe: 1.0, stage: "Stage 1–2 (Early Defect)", action: "Increase monitoring frequency to weekly", urgency: "monitor" },
  { maxGe: 2.0, stage: "Stage 3 (Active Defect)", action: "Schedule bearing replacement at next planned outage", urgency: "plan" },
  { maxGe: Infinity, stage: "Stage 4 (Severe)", action: "Replace bearing immediately — risk of catastrophic failure", urgency: "immediate" },
];

// ─── ISO 20816 General Heuristic Zones ────────────────────────────────────────
// Universal rough guide when machine-specific data unavailable
// Source: File 02 cheat sheet

export const ISO_GENERAL_ZONES = {
  good: 2.8,           // < 2.8 mm/s → Zone A (Good)
  satisfactory: 4.5,   // 2.8–4.5 → Zone B (Satisfactory)
  unsatisfactory: 7.1, // 4.5–7.1 → Zone C (Unsatisfactory — plan maintenance)
  // > 7.1 → Zone D (Unacceptable — immediate action)
} as const;

// ─── Adjustment Factors ───────────────────────────────────────────────────────
// Source: File 02 §2 notes

export const ADJUSTMENT_FACTORS = {
  vibrationIsolator: 1.4,  // +30–50% threshold when mounted on isolator (using 40% midpoint)
  externalGearbox: 1.25,   // +25% threshold for external gearbox
  newRebuilt: 0.33,        // ~33% of Alarm 1 for acceptance of new/rebuilt machines
} as const;

// ─── gE Bandpass Filter Ranges (File 06 §3) ──────────────────────────────────
// Critical for correct gE measurement — wrong filter = useless data

export const GE_FILTER_RANGES: GeFilterRange[] = [
  { name: "Very slow (<100 RPM)", lowHz: 5, highHz: 100, rpmRange: "< 100 RPM" },
  { name: "Slow (100–500 RPM)", lowHz: 50, highHz: 1000, rpmRange: "100–500 RPM" },
  { name: "Standard industrial", lowHz: 500, highHz: 10000, rpmRange: "500–6000 RPM" },
  { name: "High-speed (>10000 RPM)", lowHz: 5000, highHz: 40000, rpmRange: "> 10000 RPM" },
];

// ─── Severity Categories (for dropdown/filter UI) ────────────────────────────

export const SEVERITY_CATEGORIES = [
  ...new Set(SEVERITY_TABLE.map(e => e.category))
];
