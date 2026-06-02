/**
 * Short-circuit Icc calculation per IEC 60909-0 (simplified single-source LV).
 *
 * Models the impedance chain: upstream utility → step-down transformer → LV
 * cable to fault location. Returns 3-phase symmetric Icc, peak Ip, thermal
 * 1-s withstand, and a recommended breaker Icu rating with 25% margin.
 *
 * Reference: IEC 60909-0 §4 (calculation method), §6.1 (equivalent voltage
 * source at fault location). Simplifications:
 *   - line reactance neglected for short LV cables; cable modelled as R only
 *   - κ peak factor fixed at 1.8 (typical R/X ≈ 0.15 LV)
 *   - 1-s thermal current ≈ Icc3 (no decaying DC component for LV)
 */

export interface IccInput {
  sourceMva: number;          // upstream system short-circuit MVA at HV side
  primaryKv: number;          // primary voltage of step-down (e.g. 20 kV)
  secondaryV: number;         // secondary line voltage (e.g. 400 V)
  transformerKva: number;     // transformer rating
  transformerZpct: number;    // %Z (typical 4–8)
  cableLengthM?: number;      // optional cable from transformer to fault
  cableMm2?: number;
  cableMaterial?: "Cu" | "Al";
}

export interface IccResult {
  zSourceMOhm: number;
  zTransformerMOhm: number;
  zCableMOhm: number;
  zTotalMOhm: number;
  icc3Ka: number;
  ipKa: number;
  icw1sKa: number;
  recommendedIcuKa: number;
  warnings: string[];
}

// Resistivity Ω·mm²/m at operating temperature (~70 °C).
const RHO = { Cu: 0.0225, Al: 0.036 };

const STANDARD_ICU = [10, 16, 25, 36, 50, 65, 85, 100, 150, 200];

export function calcIcc(input: IccInput): IccResult {
  const warnings: string[] = [];
  const U = input.secondaryV;

  // Upstream Z reflected to LV side: U² / S_sc (Ω). S_sc in VA.
  const zSourceOhm = (U * U) / (input.sourceMva * 1e6);
  const zSource = zSourceOhm * 1000; // mΩ

  // Transformer Z to LV side: (%Z/100) × U² / S_rated
  const zTrOhm = (input.transformerZpct / 100) * (U * U) / (input.transformerKva * 1000);
  const zTr = zTrOhm * 1000;

  // Cable R (single-conductor, neglect X for LV). Reactance contributes
  // < 15% even for long runs, conservative to omit (yields higher Icc).
  let zCable = 0;
  if (input.cableLengthM && input.cableMm2 && input.cableLengthM > 0 && input.cableMm2 > 0) {
    const rho = RHO[input.cableMaterial ?? "Cu"];
    zCable = (rho / input.cableMm2) * input.cableLengthM * 1000;
  }

  const zTotal = zSource + zTr + zCable;
  const icc3A = (U * 1000) / (Math.sqrt(3) * zTotal); // Icc3 in A
  const icc3Ka = icc3A / 1000;

  // Peak: κ ≈ 1.8 for LV (R/X small), Ip = √2 · κ · Icc
  const ipKa = Math.sqrt(2) * 1.8 * icc3Ka;

  // 1-s thermal ≈ Icc3 (LV typical; HV would derate for DC decay)
  const icw1sKa = icc3Ka;

  // Recommend next-standard Icu ≥ 1.25 × Icc3
  const target = icc3Ka * 1.25;
  const recommendedIcuKa = STANDARD_ICU.find(v => v >= target) ?? STANDARD_ICU[STANDARD_ICU.length - 1];

  if (input.sourceMva < 50)
    warnings.push("Source MVA < 50 — verify utility infeed (urban typical 250–500 MVA)");
  if (input.transformerZpct < 4 || input.transformerZpct > 8)
    warnings.push("Transformer %Z outside typical 4–8 % — verify nameplate");
  if (icc3Ka > 50)
    warnings.push("Icc3 > 50 kA — consider current-limiting fuse or split bus");
  if (icc3Ka > recommendedIcuKa)
    warnings.push("Recommended Icu lower than computed Icc — verify utility data");

  return {
    zSourceMOhm:      round2(zSource),
    zTransformerMOhm: round2(zTr),
    zCableMOhm:       round2(zCable),
    zTotalMOhm:       round2(zTotal),
    icc3Ka:           round2(icc3Ka),
    ipKa:             round2(ipKa),
    icw1sKa:          round2(icw1sKa),
    recommendedIcuKa,
    warnings,
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
