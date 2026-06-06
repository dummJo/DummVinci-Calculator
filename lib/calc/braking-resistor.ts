/**
 * Braking resistor sizing for ABB drives (ACS880) per STAHL CraneSystems standard.
 * Formula (ABB / STAHL):
 *   Udc = 1.35 × Vline  → 540 V @ 400V, 648 V @ 480V, 932 V @ 690V
 *   Chopper threshold Uchop ≈ 1.07 × Udc (ACS880 factory value)
 *   R_max = Uchop² / (Pbr,peak × 1000)  [Ω]
 *   R_min = Uchop² / (2 × Pn,motor × 1000)  [Ω]  (avoid chopper overcurrent)
 *   Pbr,continuous = Pbr,peak × ED%     [kW]
 *   Pbr,peak ≈ 1.5 × Pn,motor for crane hoisting (STAHL typical)
 *
 * Duty cycle (ED) classes per STAHL / ABB:
 *   15% ED → light duty / conveyor
 *   25% ED → typical crane
 *   40% ED → heavy lifting (port cranes)
 *   60% ED → continuous regen
 */

import stahl from "@/data/stahl-br.json";

export interface BrInput {
  motorKw: number;
  lineVoltage: 400 | 480 | 690;
  /** Quantised duty-cycle class (rated value to match against catalog). */
  edPct: 15 | 25 | 40 | 60;
  cranePeakFactor?: number; // default 1.5
  /** Optional: actual cycle time in seconds (e.g. 300 s = one hoist cycle).
   *  When provided together with `brakingTimeS`, the calculator derives the
   *  actual ED% from the duty profile and warns if it exceeds the chosen class. */
  cycleTimeS?: number;
  brakingTimeS?: number;
}

interface StahlBr {
  code: string;
  ohms: number;
  powerKw: number;
  edPct: number;
  ip: string;
}

export interface BrResult {
  udcV: number;
  uchopV: number;
  rMinOhm: number;
  rMaxOhm: number;
  rTargetOhm: number;
  pPeakKw: number;
  pContKw: number;
  /** Actual computed ED% from cycle/brake time inputs (if provided). */
  edActualPct?: number;
  part: string;
  wiring: string;
  warnings: string[];
}

// Floor for the rMin divisor so a zero motor rating yields a finite (flagged)
// result instead of Infinity.
const EPS = 1e-9;

export function sizeBrakingResistor(input: BrInput): BrResult {
  const warnings: string[] = [];
  const peak = input.cranePeakFactor ?? 1.5;
  const Udc = input.lineVoltage * 1.35;
  const Uchop = Udc * 1.07;
  const pPeak = input.motorKw * peak;

  // Motor kW is the rMin divisor below; reject zero/blank up front.
  if (!(input.motorKw > 0)) warnings.push("Motor kW must be > 0 — check input.");

  // Derive ED% from actual duty profile when supplied; else use the chosen class.
  let edActualPct: number | undefined;
  let edForContPower = input.edPct;
  if (input.cycleTimeS && input.brakingTimeS && input.cycleTimeS > 0) {
    edActualPct = Math.min(100, (input.brakingTimeS / input.cycleTimeS) * 100);
    edForContPower = Math.max(input.edPct, edActualPct) as 15 | 25 | 40 | 60;
    if (edActualPct > input.edPct) {
      warnings.push(
        `Actual duty ${edActualPct.toFixed(0)}% ED exceeds chosen ${input.edPct}% class — sizing continuous power against actual duty to stay safe`
      );
    }
  }
  const pCont = pPeak * (edForContPower / 100);

  const rMax = (Uchop * Uchop) / Math.max(EPS, pPeak * 1000);
  const rMin = (Uchop * Uchop) / Math.max(EPS, 2 * input.motorKw * 1000);

  // Guard the R-window: a user-set peakFactor > 2 collapses rMax below rMin and
  // silently empties the candidate list. Warn the engineer explicitly instead.
  if (rMin >= rMax) {
    warnings.push(
      "Peak factor too high — chopper R-window collapsed (R_min ≥ R_max). Reduce cranePeakFactor or split into parallel resistors."
    );
  }

  const rTarget = Math.sqrt(rMin * rMax); // geometric mean — safe mid-point

  const candidates = (stahl as StahlBr[])
    .filter(r => r.ohms >= rMin && r.ohms <= rMax && r.powerKw >= pCont && r.edPct >= input.edPct)
    .sort((a, b) => Math.abs(a.ohms - rTarget) - Math.abs(b.ohms - rTarget));

  const pick = candidates[0];
  if (pick)
    warnings.push("STAHL part code is indicative (marked *) — confirm exact ordering code against the STAHL CraneSystems BR catalog before quoting.");
  if (input.lineVoltage === 690) warnings.push("690V line — BR rated insulation ≥ 1000 V required");
  if (input.edPct >= 40) warnings.push("ED ≥ 40% — use forced-cooled BR enclosure + thermal switch");

  return {
    udcV: Math.round(Udc),
    uchopV: Math.round(Uchop),
    rMinOhm: Math.round(rMin * 100) / 100,
    rMaxOhm: Math.round(rMax * 100) / 100,
    rTargetOhm: Math.round(rTarget * 100) / 100,
    pPeakKw: Math.round(pPeak * 10) / 10,
    pContKw: Math.round(pCont * 10) / 10,
    edActualPct: edActualPct !== undefined ? Math.round(edActualPct * 10) / 10 : undefined,
    part: pick ? `STAHL ${pick.code}* — ${pick.ohms} Ω, ${pick.powerKw} kW @ ${pick.edPct}% ED, ${pick.ip}`
      : "No STAHL stock unit matches — request custom / parallel units.",
    wiring: "Connect to ACS880 terminals R+/R- (external BR). Route twisted / shielded, separate from motor cable. Bond thermistor NC loop to DI on FSO or DI6 (external fault).",
    warnings,
  };
}
