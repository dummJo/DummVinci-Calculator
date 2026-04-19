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
  edPct: 15 | 25 | 40 | 60;
  cranePeakFactor?: number; // default 1.5
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
  part: string;
  wiring: string;
  warnings: string[];
}

export function sizeBrakingResistor(input: BrInput): BrResult {
  const peak = input.cranePeakFactor ?? 1.5;
  const Udc = input.lineVoltage * 1.35;
  const Uchop = Udc * 1.07;
  const pPeak = input.motorKw * peak;
  const pCont = pPeak * (input.edPct / 100);

  const rMax = (Uchop * Uchop) / (pPeak * 1000);
  const rMin = (Uchop * Uchop) / (2 * input.motorKw * 1000);
  const rTarget = Math.sqrt(rMin * rMax); // geometric mean — safe mid-point

  const candidates = (stahl as StahlBr[])
    .filter(r => r.ohms >= rMin && r.ohms <= rMax && r.powerKw >= pCont && r.edPct >= input.edPct)
    .sort((a, b) => Math.abs(a.ohms - rTarget) - Math.abs(b.ohms - rTarget));

  const pick = candidates[0];
  const warnings: string[] = [];
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
    part: pick ? `STAHL ${pick.code} — ${pick.ohms} Ω, ${pick.powerKw} kW @ ${pick.edPct}% ED, ${pick.ip}`
      : "No STAHL stock unit matches — request custom / parallel units.",
    wiring: "Connect to ACS880 terminals R+/R- (external BR). Route twisted / shielded, separate from motor cable. Bond thermistor NC loop to DI on FSO or DI6 (external fault).",
    warnings,
  };
}
