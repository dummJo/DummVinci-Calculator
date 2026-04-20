/**
 * MCCB / MCB selection — Siemens SENTRON catalog (IEC 60947-2 / IEC 60898).
 *
 * Families supported:
 *   MCB  5SL6 (6 kA, EU)      — IEC 60898, curve B/C/D, 1–4P, up to 63A
 *   MCB  5SY6 (10 kA, EU)     — IEC 60898, curve B/C/D, 1–4P, up to 63A
 *   MCCB 3VA1 (EU) F100/F160  — IEC 60947-2, 10–160A, Icu 25/36/70 kA
 *   MCCB 3VA2 (EU) F250–F1600 — IEC 60947-2, 100–1600A, Icu 55/85/100 kA
 *   MCCB 3VJ1 (IN/SEA) J100   — IEC 60947-2, 6–100A, Icu 25 kA
 *   MCCB 3VJ5 (IN/SEA) K250   — IEC 60947-2, 80–250A, Icu 36 kA
 *   MCCB 3VJ8 (IN/SEA) L400   — IEC 60947-2, 200–400A, Icu 50 kA
 *   MCCB 3VJ9 (IN/SEA) M630   — IEC 60947-2, 500–630A, Icu 50 kA
 *
 * Selection rules:
 *   In  ≥ 1.25 × Iload  (NEC/IEC minimum sizing factor)
 *   Icu ≥ prospective fault current at point of installation
 *   Preference: EU family over IN family when both qualify
 *   VSD upstream: forced trip curve D (magnetic trip 10–20×In prevents nuisance trip on harmonic inrush)
 */

import breakers from "@/data/siemens-breakers.json";

export type Curve  = "B" | "C" | "D";
export type Region = "EU" | "IN" | "any";

export interface BreakerInput {
  loadCurrent:   number;   // A continuous
  faultCurrent:  number;   // kA prospective at installation point
  curve:         Curve;
  poles:         1 | 2 | 3 | 4;
  driveLoad?:    boolean;  // VSD upstream → D curve mandatory
  preferRegion?: Region;   // prefer EU (default) or IN price series
}

interface BreakerSpec {
  type:     "MCB" | "MCCB";
  family:   string;
  region:   "EU" | "IN";
  frame:    string;
  code:     string;
  nominalA: number;
  icuKa:    number;
  curves:   Curve[];
  poles:    number[];
}

export interface BreakerOption {
  type:     "MCB" | "MCCB";
  family:   string;
  region:   "EU" | "IN";
  frame:    string;
  partCode: string;
  nominalA: number;
  icuKa:    number;
}

export interface BreakerResult {
  type:         "MCB" | "MCCB";
  family:       string;
  region:       "EU" | "IN";
  frame:        string;
  partCode:     string;
  nominalA:     number;
  icuKa:        number;
  curve:        Curve;
  coordination: string;
  /** Up to 3 closest matches for engineer comparison */
  options:      BreakerOption[];
  /** Cross-brand equivalents for competitive quotation */
  equivalents:  string[];
  warnings:     string[];
}

export function sizeBreaker(input: BreakerInput): BreakerResult {
  const curveForce: Curve = input.driveLoad ? "D" : input.curve;
  const warnings: string[] = [];
  const preferRegion: Region = input.preferRegion ?? "EU";

  if (input.driveLoad && input.curve !== "D")
    warnings.push("VSD upstream detected — trip curve forced to D (magnetic trip 10–20×In; prevents nuisance trip on harmonic inrush current).");

  const targetIn = input.loadCurrent * 1.25;

  const allMatches = (breakers as BreakerSpec[])
    .filter(b =>
      b.nominalA >= targetIn &&
      b.icuKa    >= input.faultCurrent &&
      b.poles.includes(input.poles) &&
      b.curves.includes(curveForce)
    )
    .sort((a, b) => {
      // Primary: smallest nominal current
      if (a.nominalA !== b.nominalA) return a.nominalA - b.nominalA;
      // Secondary: smallest Icu (don't over-spec Icu)
      if (a.icuKa !== b.icuKa) return a.icuKa - b.icuKa;
      // Tertiary: prefer EU over IN if preference is EU
      if (preferRegion === "EU") return a.region === "EU" ? -1 : 1;
      if (preferRegion === "IN") return a.region === "IN" ? -1 : 1;
      return 0;
    });

  if (allMatches.length === 0) {
    return {
      type: "MCCB", family: "—", region: "EU", frame: "—",
      partCode: "—", nominalA: 0, icuKa: 0, curve: curveForce,
      coordination: "No Siemens breaker matches the In/Icu/poles combination. Consider 3VA2 higher frame or upstream selectivity study.",
      options: [],
      equivalents: [],
      warnings: [...warnings, "No breaker found. Verify fault kA and load current inputs."],
    };
  }

  const pick = allMatches[0];

  // Supplemental warnings
  if (pick.type === "MCB" && input.faultCurrent > 6)
    warnings.push("MCB approaching Icu limit — cascade with upstream 3VA1 or select 5SY6 (10 kA) for better discrimination.");
  if (pick.region === "IN" && preferRegion === "EU")
    warnings.push("3VJ series selected — this is the economy India/SEA market variant. Functionally equivalent to 3VA1 for this Icu range but confirm local distributor stock.");
  if (input.loadCurrent > 1600)
    warnings.push("Load current exceeds 3VA/3VJ range — use Siemens 3WL air circuit breaker (ACB) or 3VT withdrawable MCCB.");

  const options = allMatches.slice(0, 3).map(b => ({
    type:     b.type,
    family:   b.family,
    region:   b.region,
    frame:    b.frame,
    partCode: b.code,
    nominalA: b.nominalA,
    icuKa:    b.icuKa,
  }));

  return {
    type:         pick.type,
    family:       pick.family,
    region:       pick.region,
    frame:        pick.frame,
    partCode:     pick.code,
    nominalA:     pick.nominalA,
    icuKa:        pick.icuKa,
    curve:        curveForce,
    coordination: coordinationNote(pick, input),
    options,
    equivalents:  getEquivalents(pick.type, pick.icuKa, pick.region),
    warnings,
  };
}

function getEquivalents(type: "MCB" | "MCCB", icuKa: number, region: "EU" | "IN"): string[] {
  if (type === "MCB") {
    if (icuKa <= 6)  return ["ABB S200C / Hager MBN", "Schneider Acti9 K60N", "Eaton FAZ-C"];
    return ["ABB S200M (10kA)", "Schneider Acti9 iC60N (10kA)", "Hager MBN (10kA)"];
  }
  // MCCB cross-brand equivalents
  if (icuKa <= 25)  return ["ABB Tmax XT1/XT2", "Schneider ComPacT NSXm", "Eaton PKZM4 (motor)"];
  if (icuKa <= 36)  return ["ABB Tmax XT2/XT3", "Schneider ComPacT NSX100/160", region === "IN" ? "L&T DN Series" : ""];
  if (icuKa <= 55)  return ["ABB Tmax XT3/XT4", "Schneider ComPacT NSX250/400"];
  if (icuKa <= 85)  return ["ABB Tmax XT4/XT5", "Schneider ComPacT NSX 400/630 HB"];
  return ["ABB Tmax XT5/XT6", "Schneider ComPacT NSX 630 H/L"];
}

function coordinationNote(b: BreakerSpec, input: BreakerInput): string {
  const cableMm2 = Math.ceil(input.loadCurrent / 5); // rough 5A/mm² rule
  return `${b.family} ${b.code} [${b.region}·${b.frame}], ${input.poles}P ${b.nominalA} A, Icu ${b.icuKa} kA. Upstream cable ≥ ${cableMm2} mm² Cu (rule-of-thumb; verify with IEC 60364-5-52).`;
}
