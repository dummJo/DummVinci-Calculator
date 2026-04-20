/**
 * Panel Layout Estimator — IEC 61439-1 Annex N (minimum enclosure dimensions)
 *
 * DIN rail pitch:     1U  = 25 mm vertical step (3U between rails = 75 mm)
 * Standard DIN rail:  35 mm x 7.5 mm deep (EN 60715)
 * Mounting unit (MU): 18 mm horizontal pitch (for MCB/MCCB counting on 35 mm rail)
 *
 * Component catalogue heights (representative):
 *   VSD frame sizes (ABB ACS880 / ACQ580):
 *     R0: 245 mm H × 68 mm W   R1: 260 mm × 100 mm
 *     R2: 340 mm × 125 mm      R3: 409 mm × 175 mm
 *     R4: 502 mm × 210 mm      R5: 660 mm × 260 mm
 *     R6: 702 mm × 384 mm      R9: 1136 mm × 405 mm (cabinet mount only)
 *
 *   MCCB/MCB horizontal pitch (1 pole = 18 mm, Siemens 3VA/5SL):
 *     MCB 1P: 18 mm   3P: 54 mm
 *     MCCB frame S:  4P = 90 mm   frame M:  4P = 105 mm  frame L: 4P = 135 mm
 *
 *   Busbar section:  Cu flat bar width + spacing; standard tray height = 100–150 mm
 *
 * Vertical layout (top-to-bottom typical MCC):
 *   Cable entry top:    150 mm
 *   Busbar section:     100 mm (single-tier) or 150 mm (3-tier segregated)
 *   Functional units:   total_component_height + derating margin (1.3× comfort / 1.1× compact)
 *   Cable exit bottom:  150 mm
 *   Foundation anchor:  100 mm
 *
 * Width calculation:
 *   widthMm = max(component_footprint_width × margin, minimum_standard_width)
 *   Standard widths (mm): 400, 600, 800, 1000, 1200
 *
 * Source: IEC 61439-1 Annex N, Rittal TS8 catalogue, ABB hardware dimension sheets.
 */

export type VsdFrame = "R0" | "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R9" | "none";
export type BusbarTier = "none" | "single" | "triple";

export interface LayoutInput {
  /** ABB VSD frame: R0–R9 or none */
  vsdFrame: VsdFrame;
  /** Number of VSDs of that frame */
  vsdQty: number;
  /** Number of outgoing MCB (3P, 18 mm pitch each pole) */
  mcbCount3p: number;
  /** Number of MCCB — frame size S, M, or L */
  mccbCount: number;
  mccbFrame: "S" | "M" | "L";
  /** Busbar segregation */
  busbarTier: BusbarTier;
  /** space preference */
  spacePreference: "compact" | "comfortable";
}

export interface LayoutResult {
  /** Recommended enclosure H × W × D (mm) */
  enclosureHmm: number;
  enclosureWmm: number;
  enclosureDmm: number;
  /** DIN rail rows required */
  dinRailRows: number;
  /** Free space remaining after components (mm vertical) */
  freeHeightMm: number;
  /** Breakdown labels */
  breakdown: Array<{ item: string; heightMm: number }>;
  /** Flag if R9 / cabinet-only drives are included */
  cabinetMountRequired: boolean;
  warnings: string[];
}

// ── VSD dimensional data (mm) — ABB ACS880/ACQ580 hardware manuals ───────────
const VSD_DIM: Record<VsdFrame, { h: number; w: number; d: number } | null> = {
  R0:   { h: 245,  w: 68,  d: 195 },
  R1:   { h: 260,  w: 100, d: 217 },
  R2:   { h: 340,  w: 125, d: 237 },
  R3:   { h: 409,  w: 175, d: 250 },
  R4:   { h: 502,  w: 210, d: 270 },
  R5:   { h: 660,  w: 260, d: 310 },
  R6:   { h: 702,  w: 384, d: 314 },
  R9:   { h: 1136, w: 405, d: 360 },
  none: null,
};

// MCCB single unit horizontal footprint in mm (per pole × 4P equivalent)
const MCCB_W: Record<"S" | "M" | "L", number> = { S: 90, M: 105, L: 135 };

// Standard IEC enclosure widths (mm)
const STD_WIDTHS  = [400, 600, 800, 1000, 1200];
// Standard IEC enclosure heights (mm)
const STD_HEIGHTS = [600, 800, 1000, 1200, 1600, 2000, 2200];
// Standard depth
const STD_DEPTHS  = [250, 300, 400, 600];

function nextStd(val: number, list: number[]): number {
  return list.find(v => v >= val) ?? list[list.length - 1];
}

export function estimatePanelLayout(input: LayoutInput): LayoutResult {
  const warnings: string[] = [];
  const breakdown: Array<{ item: string; heightMm: number }> = [];
  const margin = input.spacePreference === "comfortable" ? 1.30 : 1.10;

  // ── Vertical height build-up ──────────────────────────────────────────────
  const cableTopMm    = 150;  // cable entry zone — IEC 61439-1
  const cableBotMm    = 150;  // cable exit zone
  const foundationMm  = 100;  // base plinth
  const busbarMm      = input.busbarTier === "none" ? 0
                      : input.busbarTier === "single" ? 100 : 150;

  breakdown.push({ item: "Cable entry (top)", heightMm: cableTopMm });
  if (busbarMm) breakdown.push({ item: `Busbar tray (${input.busbarTier}-tier)`, heightMm: busbarMm });

  // VSD bank
  let vsdH = 0;
  let vsdW = 0;
  const cabinetMountRequired = input.vsdFrame === "R9";

  if (input.vsdFrame !== "none" && input.vsdQty > 0) {
    const dim = VSD_DIM[input.vsdFrame];
    if (dim) {
      // VSDs stacked vertically (one column per pair for wide frames)
      const vsdColCount = dim.w > 300 ? 1 : 1; // simplify: single column
      vsdH = Math.ceil(input.vsdQty / vsdColCount) * (dim.h + 30); // 30 mm clearance each
      vsdW = dim.w * vsdColCount;
      breakdown.push({ item: `VSD ${input.vsdFrame} × ${input.vsdQty} (stacked)`, heightMm: vsdH });
      if (input.vsdFrame === "R9")
        warnings.push("R9 frame requires dedicated cabinet-mount bay — cannot share with MCB DIN rail panel.");
    }
  }

  // MCB section on DIN rail
  // Standard 35 mm DIN rail: 24 × 18 mm MCBs per 435 mm usable rail width
  const mcbPoleWidth = 18; // mm per pole (3P MCB = 54 mm)
  const mcb3pWidth = mcbPoleWidth * 3;
  const railUsableW = 435; // mm usable rail width in 600 mm cabinet
  const mcbPerRail = Math.floor(railUsableW / mcb3pWidth);
  const mccbPerRail = input.mccbCount > 0
    ? Math.floor(railUsableW / MCCB_W[input.mccbFrame])
    : 0;

  const mcbRailsNeeded = input.mcbCount3p > 0
    ? Math.ceil(input.mcbCount3p / mcbPerRail)
    : 0;
  const mccbRailsNeeded = input.mccbCount > 0
    ? Math.ceil(input.mccbCount / Math.max(mccbPerRail, 1))
    : 0;

  const dinRailRows = mcbRailsNeeded + mccbRailsNeeded;
  const dinRailHeightMm = dinRailRows * 75; // 75 mm vertical pitch per rail, per DIN practice

  if (dinRailRows > 0) {
    breakdown.push({ item: `DIN rail rows × ${dinRailRows} (MCB/MCCB)`, heightMm: dinRailHeightMm });
  }

  breakdown.push({ item: "Cable exit (bottom)", heightMm: cableBotMm });
  breakdown.push({ item: "Foundation / base plinth", heightMm: foundationMm });

  // ── Total required height ─────────────────────────────────────────────────
  const componentH = cableTopMm + busbarMm + vsdH + dinRailHeightMm + cableBotMm + foundationMm;
  const requiredH  = Math.ceil(componentH * margin);
  const enclosureHmm = nextStd(requiredH, STD_HEIGHTS);
  const freeHeightMm = enclosureHmm - componentH;

  // ── Width calculation ─────────────────────────────────────────────────────
  // Width must accommodate: VSD width + cable duct (100 mm each side) + margin
  const cableDuctW = 100; // mm each side
  const requiredW  = Math.max(vsdW + cableDuctW * 2, 400);
  const enclosureWmm = nextStd(requiredW, STD_WIDTHS);

  // ── Depth calculation ─────────────────────────────────────────────────────
  const vsdDepth = input.vsdFrame !== "none" && VSD_DIM[input.vsdFrame]
    ? (VSD_DIM[input.vsdFrame]!.d + 80) // 80 mm front access + door clearance
    : 250;
  const enclosureDmm = nextStd(vsdDepth, STD_DEPTHS);

  // ── Warnings ──────────────────────────────────────────────────────────────
  if (freeHeightMm < 100)
    warnings.push("Free vertical space < 100 mm — consider upgrading to next enclosure height or splitting into 2 cabinets.");
  if (enclosureHmm >= 2000 && !cabinetMountRequired)
    warnings.push("Panel height ≥ 2000 mm — requires lifting equipment for installation per IEC 61439-1.");
  if (input.vsdQty > 4 && ["R4", "R5", "R6"].includes(input.vsdFrame))
    warnings.push("Large VSD volume — consider MCC lineup (separate bay per drive) for maintenance access.");

  return {
    enclosureHmm,
    enclosureWmm,
    enclosureDmm,
    dinRailRows,
    freeHeightMm,
    breakdown,
    cabinetMountRequired,
    warnings,
  };
}
