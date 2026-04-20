/**
 * MCCB / MCB selection — Siemens European series.
 * MCB: 5SL (6 kA), 5SY (10 kA), curves B / C / D per IEC 60898.
 * MCCB: 3VA series per IEC 60947-2.
 * Pick logic: smallest frame where In ≥ 1.25·Iload and Icu ≥ Ifault.
 */

import breakers from "@/data/siemens-breakers.json";

export type Curve = "B" | "C" | "D";

export interface BreakerInput {
  loadCurrent: number;   // A
  faultCurrent: number;  // kA prospective
  curve: Curve;
  poles: 1 | 2 | 3 | 4;
  driveLoad?: boolean;   // VSD upstream → D curve mandatory
}

interface BreakerSpec {
  type: "MCB" | "MCCB";
  family: string;
  code: string;
  nominalA: number;
  icuKa: number;
  curves: Curve[];
  poles: number[];
}

export interface BreakerOption {
  type: "MCB" | "MCCB";
  family: string;
  partCode: string;
  nominalA: number;
  icuKa: number;
}

export interface BreakerResult {
  type: "MCB" | "MCCB";
  family: string;
  partCode: string;
  nominalA: number;
  icuKa: number;
  curve: Curve;
  coordination: string;
  options: BreakerOption[];
  warnings: string[];
}

export function sizeBreaker(input: BreakerInput): BreakerResult {
  const curveForce: Curve = input.driveLoad ? "D" : input.curve;
  const warnings: string[] = [];
  if (input.driveLoad && input.curve !== "D")
    warnings.push("VSD detected — forced curve D (magnetic trip 10–20×In).");

  const targetIn = input.loadCurrent * 1.25;
  const list = (breakers as BreakerSpec[])
    .filter(b => b.nominalA >= targetIn && b.icuKa >= input.faultCurrent && b.poles.includes(input.poles))
    .filter(b => b.curves.includes(curveForce))
    .sort((a, b) => a.nominalA - b.nominalA || a.icuKa - b.icuKa);

  const pick = list[0];
  if (!pick) {
    return {
      type: "MCCB", family: "—", partCode: "—", nominalA: 0, icuKa: 0, curve: curveForce,
      coordination: "No Siemens breaker matches. Consider 3VA2 higher frame or upstream selectivity.",
      options: [],
      warnings: [...warnings, "No breaker found. Check Icu/In combination."],
    };
  }

  if (pick.type === "MCB" && input.faultCurrent > 6)
    warnings.push("MCB near Icu limit — consider 5SY (10 kA) or MCCB cascaded");

  const options = list.slice(0, 3).map(b => ({
    type: b.type,
    family: b.family,
    partCode: b.code,
    nominalA: b.nominalA,
    icuKa: b.icuKa,
  }));

  return {
    type: pick.type,
    family: pick.family,
    partCode: pick.code,
    nominalA: pick.nominalA,
    icuKa: pick.icuKa,
    curve: curveForce,
    coordination: coordinationNote(pick, input),
    options,
    warnings,
  };
}

function coordinationNote(b: BreakerSpec, input: BreakerInput): string {
  const lineCross = Math.ceil(input.loadCurrent / 6); // rough mm² hint
  return `${b.family} ${b.code}, ${input.poles}P ${b.nominalA}A, Icu ${b.icuKa} kA. Pair with upstream cable ≥ ${lineCross} mm² Cu.`;
}
