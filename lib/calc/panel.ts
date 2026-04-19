/**
 * Panel (enclosure) sizing — XLTC & Rittal TS 8 catalog.
 * Three cooling modes:
 *   1. Natural convection (IEC 60890 simplified: 5.5 W/m²·K)
 *   2. Forced ventilation — exhaust fan + filter (Rittal SK 3241 / XLTC FC series)
 *   3. Air conditioning — sealed enclosure, BTU/h sizing (Rittal Blue e+ / XLTC AC)
 *
 * Airflow formula: Q [m³/h] = Ploss [W] × 3.1 / ΔT [K]
 * AC sizing:    Qac [W] = Ploss + solar gain (outdoor) + transmission gain
 *               Qac [BTU/h] = Qac [W] × 3.412
 *
 * Fan filter:   Intake area [cm²] ≥ Q [m³/h] / (0.6 × v_filter)
 *               Standard velocity through filter mat v = 1.0 m/s (Rittal / Pfannenberg typical)
 *               → area [cm²] = Q / 3.6
 */

import enclosures from "@/data/enclosures.json";

export type Location = "indoor" | "outdoor";
export type IpClass = "IP54" | "IP55" | "IP66";
export type CoolingMode = "natural" | "fan" | "ac";

export interface PanelInput {
  totalHeatW: number;
  ambientC: number;
  location: Location;
  ip: IpClass;
  coolingMode: CoolingMode;   // user explicitly selects mode
  spacePreference: "compact" | "comfortable";
}

interface EnclosureSpec {
  brand: "XLTC" | "Rittal";
  code: string;
  h: number; w: number; d: number;
  ip: string;
  suitableIndoor: boolean;
  suitableOutdoor: boolean;
}

export interface FilterSpec {
  airflowM3h: number;         // required airflow
  filterAreaCm2: number;      // minimum filter mat area
  rittalCode: string;
  xltcCode: string;
  note: string;
}

export interface FanSpec {
  airflowM3h: number;
  rittalCode: string;
  xltcCode: string;
  position: string;
  intake: FilterSpec;
  exhaust: FilterSpec;
}

export interface AcSpec {
  heatLoadW: number;
  heatLoadBtu: number;
  nominalW: number;           // selected AC capacity
  nominalBtu: number;
  rittalCode: string;
  xltcCode: string;
  mode: "cooling-only" | "cooling+heating";
  note: string;
}

export interface PanelResult {
  part: string;
  dimMm: string;
  surfaceM2: number;
  naturalDissW: number;
  cooling: CoolingMode;
  fan?: FanSpec;
  ac?: AcSpec;
  warnings: string[];
}

// ─── Fan catalog (representative Rittal SK & XLTC FC) ────────────────────────
const FAN_CATALOG: Array<{ minQ: number; rittal: string; xltc: string }> = [
  { minQ: 0,   rittal: "SK 3241.100",  xltc: "FC-060"  },  // 55 m³/h
  { minQ: 55,  rittal: "SK 3241.110",  xltc: "FC-120"  },  // 115 m³/h
  { minQ: 115, rittal: "SK 3241.120",  xltc: "FC-200"  },  // 230 m³/h
  { minQ: 230, rittal: "SK 3241.140",  xltc: "FC-400"  },  // 420 m³/h
  { minQ: 420, rittal: "SK 3241.200",  xltc: "FC-600"  },  // 690 m³/h
  { minQ: 690, rittal: "SK 3241.230",  xltc: "FC-900"  },  // 1050 m³/h
  { minQ: 1050,rittal: "SK 3241.250",  xltc: "FC-1400" },  // 1500 m³/h
];

// ─── AC catalog (Rittal Blue e+ & XLTC AC) ───────────────────────────────────
const AC_CATALOG: Array<{ minW: number; rittal: string; xltc: string; nomW: number }> = [
  { minW: 0,    rittal: "SK 3374.500",  xltc: "AC-300",  nomW: 300  },
  { minW: 300,  rittal: "SK 3374.600",  xltc: "AC-500",  nomW: 500  },
  { minW: 500,  rittal: "SK 3374.700",  xltc: "AC-700",  nomW: 700  },
  { minW: 700,  rittal: "SK 3374.800",  xltc: "AC-1000", nomW: 1000 },
  { minW: 1000, rittal: "SK 3374.900",  xltc: "AC-1500", nomW: 1500 },
  { minW: 1500, rittal: "SK 3375.100",  xltc: "AC-2000", nomW: 2000 },
  { minW: 2000, rittal: "SK 3375.200",  xltc: "AC-2500", nomW: 2500 },
  { minW: 2500, rittal: "SK 3376.100",  xltc: "AC-3300", nomW: 3300 },
  { minW: 3300, rittal: "SK 3377.100",  xltc: "AC-4000", nomW: 4000 },
  { minW: 4000, rittal: "SK 3378.100",  xltc: "AC-6000", nomW: 6000 },
];

function pickFan(airflowM3h: number): FanSpec {
  const entry = [...FAN_CATALOG].reverse().find(f => f.minQ <= airflowM3h) ?? FAN_CATALOG[FAN_CATALOG.length - 1];
  const areaCm2 = Math.ceil(airflowM3h / 3.6);
  const filterSpec = (where: string): FilterSpec => ({
    airflowM3h,
    filterAreaCm2: areaCm2,
    rittalCode: `SK 3326.${areaCm2 < 200 ? "100" : areaCm2 < 400 ? "200" : "300"}`,
    xltcCode: `FF-${areaCm2 < 200 ? "150" : areaCm2 < 400 ? "300" : "500"}`,
    note: `${where} filter mat ≥ ${areaCm2} cm² free area (IEC 60529). Replace every 3–6 months in tropical env.`,
  });
  return {
    airflowM3h,
    rittalCode: entry.rittal,
    xltcCode: entry.xltc,
    position: "Fan exhaust: top of panel (heat rises). Intake filter: bottom-front or side.",
    intake: filterSpec("Intake"),
    exhaust: filterSpec("Exhaust"),
  };
}

function pickAc(heatW: number, location: Location): AcSpec {
  // Outdoor: add 15% solar gain estimate + 10% transmission
  const load = location === "outdoor" ? heatW * 1.25 : heatW * 1.05;
  const entry = AC_CATALOG.find(a => a.nomW >= load) ?? AC_CATALOG[AC_CATALOG.length - 1];
  return {
    heatLoadW: Math.round(load),
    heatLoadBtu: Math.round(load * 3.412),
    nominalW: entry.nomW,
    nominalBtu: Math.round(entry.nomW * 3.412),
    rittalCode: entry.rittal,
    xltcCode: entry.xltc,
    mode: location === "outdoor" ? "cooling+heating" : "cooling-only",
    note: location === "outdoor"
      ? `Outdoor install: cooling+heating mode mandatory (ASHRAE 90.1). Seal condenser inlet/outlet with sun shield. Condensate drain required. Ambient range verify vs AC spec sheet.`
      : `Indoor install: cooling-only sufficient. Mount on door or side panel. Condensate to floor drain. Check COP at 45°C hot-side.`,
  };
}

export function sizePanel(input: PanelInput): PanelResult {
  const warnings: string[] = [];

  // IP vs location cross-check
  if (input.location === "outdoor" && input.ip === "IP54")
    warnings.push("IP54 not recommended outdoors — upgrade to IP55 minimum (IP66 for coastal/corrosive)");
  if (input.coolingMode === "fan" && input.ip === "IP66")
    warnings.push("IP66 requires sealed AC — fan+filter breaks IP66. Forced to AC mode.");

  const effectiveMode: CoolingMode =
    (input.coolingMode === "fan" && input.ip === "IP66") ? "ac" : input.coolingMode;

  const list = (enclosures as EnclosureSpec[]).filter(e => {
    const ipMatch = e.ip === input.ip || (input.ip === "IP54" && e.ip === "IP55");
    return ipMatch && (input.location === "indoor" ? e.suitableIndoor : e.suitableOutdoor);
  }).sort((a, b) => volume(a) - volume(b));

  const deltaT = 15 - Math.max(0, input.ambientC - 35);
  if (input.ambientC >= 45) warnings.push("Ambient ≥ 45°C — AC mandatory; verify AC condenser rating at this temp");

  for (const e of list) {
    const surfM2 = surfaceArea(e);
    const dissW = 5.5 * surfM2 * deltaT;
    const factor = input.spacePreference === "comfortable" ? 1.2 : 1.0;
    const enclosureOk = surfM2 * factor > 0 && e.h > 0;
    if (!enclosureOk) continue;

    const base: Omit<PanelResult, "fan" | "ac"> = {
      part: `${e.brand} ${e.code}`,
      dimMm: `${e.h} × ${e.w} × ${e.d} mm (H×W×D)`,
      surfaceM2: Math.round(surfM2 * 100) / 100,
      naturalDissW: Math.round(dissW),
      cooling: effectiveMode,
      warnings,
    };

    if (effectiveMode === "natural") {
      if (dissW < input.totalHeatW)
        warnings.push(`Natural dissipation ${Math.round(dissW)} W < heat load ${input.totalHeatW} W — recommend fan or AC`);
      return { ...base };
    }

    if (effectiveMode === "fan") {
      const q = Math.ceil((input.totalHeatW * 3.1) / Math.max(deltaT, 1));
      return { ...base, fan: pickFan(q) };
    }

    // AC mode
    return { ...base, ac: pickAc(input.totalHeatW, input.location) };
  }

  return {
    part: "—", dimMm: "—", surfaceM2: 0, naturalDissW: 0, cooling: "ac",
    ac: pickAc(input.totalHeatW, input.location),
    warnings: [...warnings, "Heat load exceeds stock range — split into multiple cabinets or use custom enclosure."],
  };
}

function surfaceArea(e: EnclosureSpec): number {
  return (1.8 * e.h * e.w + 1.4 * e.w * e.d + 1.4 * e.h * e.d) / 1_000_000;
}
function volume(e: EnclosureSpec): number { return e.h * e.w * e.d; }
