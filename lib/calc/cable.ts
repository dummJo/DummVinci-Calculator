/**
 * Cable sizing per IEC 60364-5-52 & PUIL 2011 (Indonesia).
 * Reference ampacity tables for Cu conductors, PVC/XLPE insulation,
 * reference method C (clipped direct / trays / conduit in air, 30°C ambient).
 * Values are conservative — use Supreme / Jembo catalog for final pick.
 */

export type Phase = "1ph" | "3ph";
export type Insulation = "PVC" | "XLPE";
export type Install = "air" | "tray" | "conduit" | "buried";

// Cu conductor ampacity (A) @ 30°C ambient, 3-core cable, method C.
// Derived from IEC 60364-5-52 Table B.52.4 (NYY/NYFGbY class).
const AMPACITY_PVC_CU: Record<number, number> = {
  1.5: 18, 2.5: 25, 4: 34, 6: 43, 10: 60, 16: 80, 25: 101,
  35: 126, 50: 153, 70: 196, 95: 238, 120: 276, 150: 319,
  185: 364, 240: 430, 300: 497, 400: 595,
};
const AMPACITY_XLPE_CU: Record<number, number> = {
  1.5: 23, 2.5: 32, 4: 42, 6: 54, 10: 75, 16: 100, 25: 127,
  35: 158, 50: 192, 70: 246, 95: 298, 120: 346, 150: 399,
  185: 456, 240: 538, 300: 621, 400: 745,
};

/** Pre-sorted conductor sizes (mm²) — avoids re-sorting on every sizing call. */
const SORTED_MM2_PVC = Object.keys(AMPACITY_PVC_CU).map(Number).sort((a, b) => a - b);
const SORTED_MM2_XLPE = Object.keys(AMPACITY_XLPE_CU).map(Number).sort((a, b) => a - b);

// Install method derating (approx, IEC 60364 Table B.52.17)
const INSTALL_DERATE: Record<Install, number> = {
  air: 1.0, tray: 0.95, conduit: 0.85, buried: 0.8,
};

// Ambient temp derating (IEC 60364-5-52 Table B.52.14) — nearest tabulated °C column.
const AMBIENT_DERATE_PVC: Record<number, number> = {
  25: 1.03, 30: 1.0, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.5,
};
const AMBIENT_DERATE_XLPE: Record<number, number> = {
  25: 1.02, 30: 1.0, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71,
};
const AMBIENT_KEYS_PVC = Object.keys(AMBIENT_DERATE_PVC).map(Number).sort((a, b) => a - b);
const AMBIENT_KEYS_XLPE = Object.keys(AMBIENT_DERATE_XLPE).map(Number).sort((a, b) => a - b);

function ambientDerate(tempC: number, insulation: Insulation): number {
  const table = insulation === "PVC" ? AMBIENT_DERATE_PVC : AMBIENT_DERATE_XLPE;
  const keys = insulation === "PVC" ? AMBIENT_KEYS_PVC : AMBIENT_KEYS_XLPE;
  const nearest = keys.reduce((p, c) => (Math.abs(c - tempC) < Math.abs(p - tempC) ? c : p), keys[0]);
  return table[nearest]!;
}

export interface CableInput {
  current: number;           // A (design load current)
  lengthM: number;           // run length in meters
  voltage: number;           // 230 or 400 typical
  phase: Phase;
  insulation: Insulation;
  install: Install;
  ambientC: number;
  powerFactor?: number;      // default 0.85
  maxVdropPct?: number;      // default 3
  /** Number of circuits grouped together (touching, in air/tray/conduit).
   *  Applies IEC 60364-5-52 Table B.52.20 grouping factor. Default = 1. */
  groupedCircuits?: number;
}

export interface CableResult {
  phaseSize: number;         // mm² cross-section
  groundSize: number;        // mm² (PE conductor per IEC 60364-5-54)
  ampacity: number;          // derated ampacity (A)
  vdropPct: number;
  vdropV: number;
  deratingFactor: number;
  suggestion: string;        // Supreme/Jembo part hint
  warnings: string[];
}

// PE (ground) sizing per IEC 60364-5-54 Table 54.2
function groundFromPhase(phaseMm2: number): number {
  if (phaseMm2 <= 16) return phaseMm2;
  if (phaseMm2 <= 35) return 16;
  return Math.ceil(phaseMm2 / 2);
}

// Cu DC resistance basis: IEC 60228 / practice tables often use ~0.0189 Ω·mm²/m @ 20°C;
// 0.0225 Ω·mm²/m is a conservative AC/operating-temperature allowance for v-drop check.
const RHO = 0.0225;

// Cu cable reactance per IEC 60287 (Ω·mm²/m equivalent — i.e. X/length × cross-section).
// Reactance is negligible for small cables but becomes ~30–40% of resistance for ≥120 mm²
// runs. Resistance-only Vdrop under-estimates by that much for large feeders.
function reactanceOhmPerKm(mm2: number): number {
  if (mm2 <= 35)  return 0.080;
  if (mm2 <= 95)  return 0.083;
  if (mm2 <= 150) return 0.086;
  if (mm2 <= 240) return 0.090;
  return 0.093;
}

// IEC 60364-5-52 Table B.52.20 (touching, multiple circuits in air / on tray / in conduit).
function groupingFactor(n: number): number {
  if (n <= 1) return 1.0;
  if (n === 2) return 0.85;
  if (n === 3) return 0.79;
  if (n === 4) return 0.75;
  if (n <= 6) return 0.72;
  if (n <= 9) return 0.70;
  return 0.68;
}

export function sizeCable(input: CableInput): CableResult {
  const pf = input.powerFactor ?? 0.85;
  const vdropLimit = input.maxVdropPct ?? 3;
  const grouped = Math.max(1, input.groupedCircuits ?? 1);
  const groupK = groupingFactor(grouped);
  const table = input.insulation === "PVC" ? AMPACITY_PVC_CU : AMPACITY_XLPE_CU;
  const k = INSTALL_DERATE[input.install] * ambientDerate(input.ambientC, input.insulation) * groupK;

  const sizes = input.insulation === "PVC" ? SORTED_MM2_PVC : SORTED_MM2_XLPE;
  const warnings: string[] = [];

  for (const s of sizes) {
    // Defend against stale table sync — `table[s]` typed `number` but is really `number | undefined`
    // under noUncheckedIndexedAccess. A NaN here silently disables the size and returns the
    // "no cable" fallback with no error — make it explicit instead.
    const iz = table[s];
    if (iz == null) continue;
    const derated = iz * k;
    // 25% margin on table Iz vs Ib — conservative vs minimum compliance; verify with PUIL / project QA.
    if (derated < input.current * 1.25) continue;

    // Voltage drop with reactance per IEC: |Vdrop| ≈ k · I · L · (R·cosφ + X·sinφ).
    // Factor k = 2 single-phase, √3 three-phase.
    const factor = input.phase === "1ph" ? 2 : Math.sqrt(3);
    const rPerM = RHO / s;                              // Ω/m, resistance
    const xPerM = reactanceOhmPerKm(s) / 1000;          // Ω/m, reactance
    const sinPhi = Math.sqrt(Math.max(0, 1 - pf * pf));
    const vdropV = factor * input.current * input.lengthM * (rPerM * pf + xPerM * sinPhi);
    const vdropPct = (vdropV / input.voltage) * 100;

    if (vdropPct > vdropLimit) continue;

    if (input.ambientC >= 45) warnings.push("Ambient ≥ 45°C — consider XLPE or up-size one step");
    if (input.lengthM > 150) warnings.push("Long run — double-check vdrop at starting inrush");

    return {
      phaseSize: s,
      groundSize: groundFromPhase(s),
      ampacity: Math.round(derated),
      vdropPct: Math.round(vdropPct * 100) / 100,
      vdropV: Math.round(vdropV * 100) / 100,
      deratingFactor: Math.round(k * 100) / 100,
      suggestion: cableSuggestion(s, input.phase, input.insulation),
      warnings,
    };
  }

  return {
    phaseSize: 0, groundSize: 0, ampacity: 0, vdropPct: 0, vdropV: 0, deratingFactor: k,
    suggestion: "No single cable meets load + vdrop — consider parallel runs or MV feed",
    warnings: ["Load exceeds catalog range. Parallel cables or step up voltage."],
  };
}

function cableSuggestion(mm2: number, phase: Phase, insulation: Insulation): string {
  const cores = phase === "1ph" ? "2" : "4";
  const type = insulation === "XLPE" ? "N2XSY / FRC" : "NYY";
  const brand = mm2 <= 120 ? "Supreme / Jembo" : "Jembo";
  return `${brand} ${type} ${cores}×${mm2} mm² Cu`;
}
