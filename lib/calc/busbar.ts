/**
 * Busbar sizing (rectangular flat bar).
 * Current density baseline:
 *   Cu: 1.6 A/mm² (enclosed, natural convection, 35°C ambient, 65°C rise)
 *   Al: 1.0 A/mm²
 * For forced ventilation / outdoor, k-factor boosts capacity (up to 1.3×).
 * Reference: DIN 43671 / IEC 61439-1 Annex N.
 */

export type Material = "Cu" | "Al";

export interface BusbarInput {
  current: number;          // A continuous
  material: Material;
  ambientC: number;
  enclosed: boolean;        // true = inside panel (default)
  forcedCooling: boolean;
}

export interface BusbarOption {
  h: number;
  t: number;
  mm2: number;
  capacityA: number;
}

export interface BusbarResult {
  sectionMm2: number;
  dimensionMm: string;      // e.g. "40 × 10 mm"
  derating: number;
  part: string;
  note: string;
  options: BusbarOption[];
}

// Standard flat bar sizes (height × thickness) — common catalog mm²
const BARS: Array<[number, number, number]> = [
  [20, 5, 100], [20, 10, 200], [25, 5, 125], [30, 5, 150], [30, 10, 300],
  [40, 5, 200], [40, 10, 400], [50, 5, 250], [50, 10, 500],
  [60, 10, 600], [80, 10, 800], [100, 10, 1000], [120, 10, 1200], [160, 10, 1600],
];

export function sizeBusbar(input: BusbarInput): BusbarResult {
  const base = input.material === "Cu" ? 1.6 : 1.0; // A/mm²
  let k = 1;
  if (!input.enclosed) k *= 1.1;
  if (input.forcedCooling) k *= 1.2;
  if (input.ambientC > 35) k *= 1 - (input.ambientC - 35) * 0.01;
  if (input.ambientC < 25) k *= 1.05;

  const capacity = base * k;                 // A/mm²
  const required = input.current / capacity; // mm²

  const startIndex = BARS.findIndex(([, , mm2]) => mm2 >= required);
  const safeIndex = startIndex === -1 ? BARS.length - 1 : startIndex;
  const pick = BARS[safeIndex];
  const [h, t, mm2] = pick;

  const options: BusbarOption[] = [];
  for (let i = safeIndex; i < Math.min(safeIndex + 3, BARS.length); i++) {
    const [bh, bt, bmm2] = BARS[i];
    options.push({ h: bh, t: bt, mm2: bmm2, capacityA: Math.round(capacity * bmm2) });
  }

  return {
    sectionMm2: mm2,
    dimensionMm: `${h} × ${t} mm`,
    derating: Math.round(k * 100) / 100,
    part: `${input.material} flat bar ${h}×${t}, section ${mm2} mm²`,
    note: `Rated @ ${Math.round(capacity * mm2)} A continuous. Use M8 bolts, torque 22 Nm. Insulate with SMC busbar support (Rittal SV 9340 or equivalent).`,
    options,
  };
}
