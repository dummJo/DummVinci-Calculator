/**
 * DOL & Star-Delta Motor Starter Sizing — Siemens SIRIUS product family
 *
 * Standards:
 *   IEC 60947-4-1 (contactors & motor starters, AC3 duty rating)
 *   IEC 60947-2   (MCCB / MPCB protection)
 *   Siemens SIRIUS catalog CA01-S1/EN 2024:
 *     MPCB  3RV2 series (3RV2011 / 3RV2021 / 3RV2031 / 3RV2041 / 3RV2042)
 *     Contactor 3RT2 series (AC3 rated)
 *     Star-Delta compact kits 3RA2 series
 *     Auxiliary contact block 3RH2911
 *     Transverse (fault) auxiliary block 3RV2901-2A for MPCB
 *
 * Sizing rules:
 *   FLA estimate:   I = P(kW) × 1000 / (√3 × V × PF × η)
 *                   PF = 0.85, η = 0.92 (typical 4-pole squirrel cage at full load)
 *
 *   DOL:
 *     MPCB set range ≥ FLA, next std range used
 *     Contactor AC3 ≥ FLA (continuous thermal current)
 *
 *   Star-Delta:
 *     Main contactor (KM1): Ic_main = FLA           (AC3 continuous)
 *     Delta contactor (KM3): Ic_delta = FLA / √3
 *     Star contactor (KM2):  Ic_star  = FLA / √3
 *     Transition timer default: 8–15 s (motor reaches ~80% speed in star)
 *     Inrush reduction: star phase reduces LRC from ~6–8× to ~2×
 *
 * Compact star-delta kit 3RA2:
 *   Fully assembled kit (MPCB + 3 contactors + timer block) up to 75 kW/400V
 *   Above 75 kW: separate components required.
 */

export type StarterType = "DOL" | "STAR_DELTA";
export type Voltage = 230 | 400 | 415 | 690;

export interface StarterInput {
  motorKw: number;
  voltage: Voltage;
  fla?: number;           // override FLA if known from nameplate
  starterType: StarterType;
  timerSec?: number;      // star-delta transition time in seconds (default 10)
}

// ── MPCB 3RV2 — representative ranges (A) with Siemens part-number suffix ─────
interface MpcbEntry {
  frame: string;
  partBase: string;
  minA: number;
  maxA: number;
  icuKa: number;
  /** number of auxiliary / fault block positions */
  auxPositions: number;
}

const MPCB_3RV2: MpcbEntry[] = [
  // 3RV2011 — up to S00 frame, 1.6A max
  { frame: "3RV2011", partBase: "3RV2011-0",  minA: 0.11, maxA: 1.6,  icuKa: 100, auxPositions: 1 },
  // 3RV2021 — S0 frame, 10A max
  { frame: "3RV2021", partBase: "3RV2021-0",  minA: 1.1,  maxA: 10,   icuKa: 100, auxPositions: 2 },
  // 3RV2031 — S2 frame, 40A max
  { frame: "3RV2031", partBase: "3RV2031-0",  minA: 6,    maxA: 40,   icuKa: 100, auxPositions: 2 },
  // 3RV2041 — S3 frame, 80A max
  { frame: "3RV2041", partBase: "3RV2041-0",  minA: 20,   maxA: 80,   icuKa: 100, auxPositions: 2 },
  // 3RV2042 — S3 frame, 100A max
  { frame: "3RV2042", partBase: "3RV2042-0",  minA: 70,   maxA: 100,  icuKa: 100, auxPositions: 2 },
];

// ── Contactors 3RT2 — AC3 rating (continuous motor duty) ─────────────────────
interface ContactorEntry {
  partBase: string;
  ac3A: number;
  kw400V: number;       // rated power at 400V AC3
  coil: string;         // standard 230V AC coil suffix
  frameSize: string;
}

const CONTACTOR_3RT2: ContactorEntry[] = [
  { partBase: "3RT2015", ac3A: 7,   kw400V: 3,    coil: "-1AP01", frameSize: "S00" },
  { partBase: "3RT2016", ac3A: 9,   kw400V: 4,    coil: "-1AP01", frameSize: "S00" },
  { partBase: "3RT2017", ac3A: 12,  kw400V: 5.5,  coil: "-1AP01", frameSize: "S00" },
  { partBase: "3RT2018", ac3A: 16,  kw400V: 7.5,  coil: "-1AP01", frameSize: "S00" },
  { partBase: "3RT2023", ac3A: 9,   kw400V: 4,    coil: "-1AP00", frameSize: "S0"  },
  { partBase: "3RT2024", ac3A: 12,  kw400V: 5.5,  coil: "-1AP00", frameSize: "S0"  },
  { partBase: "3RT2025", ac3A: 17,  kw400V: 7.5,  coil: "-1AP00", frameSize: "S0"  },
  { partBase: "3RT2026", ac3A: 25,  kw400V: 11,   coil: "-1AP00", frameSize: "S0"  },
  { partBase: "3RT2027", ac3A: 32,  kw400V: 15,   coil: "-1AP00", frameSize: "S0"  },
  { partBase: "3RT2028", ac3A: 38,  kw400V: 18.5, coil: "-1AP00", frameSize: "S0"  },
  { partBase: "3RT2035", ac3A: 40,  kw400V: 18.5, coil: "-1AP00", frameSize: "S2"  },
  { partBase: "3RT2036", ac3A: 50,  kw400V: 22,   coil: "-1AP00", frameSize: "S2"  },
  { partBase: "3RT2037", ac3A: 65,  kw400V: 30,   coil: "-1AP00", frameSize: "S2"  },
  { partBase: "3RT2038", ac3A: 75,  kw400V: 37,   coil: "-1AP00", frameSize: "S2"  },
  { partBase: "3RT2044", ac3A: 65,  kw400V: 30,   coil: "-1AP00", frameSize: "S3"  },
  { partBase: "3RT2045", ac3A: 80,  kw400V: 37,   coil: "-1AP00", frameSize: "S3"  },
  { partBase: "3RT2046", ac3A: 95,  kw400V: 45,   coil: "-1AP00", frameSize: "S3"  },
  { partBase: "3RT2047", ac3A: 110, kw400V: 55,   coil: "-1AP00", frameSize: "S3"  },
  { partBase: "3RT2055", ac3A: 150, kw400V: 75,   coil: "-1AP00", frameSize: "S6"  },
  { partBase: "3RT2056", ac3A: 185, kw400V: 90,   coil: "-1AP00", frameSize: "S6"  },
  { partBase: "3RT2064", ac3A: 225, kw400V: 110,  coil: "-1AP00", frameSize: "S10" },
  { partBase: "3RT2065", ac3A: 265, kw400V: 132,  coil: "-1AP00", frameSize: "S10" },
  { partBase: "3RT2066", ac3A: 300, kw400V: 160,  coil: "-1AP00", frameSize: "S12" },
  { partBase: "3RT2075", ac3A: 400, kw400V: 200,  coil: "-1AP00", frameSize: "S12" },
];

// ── Star-Delta compact kits 3RA2 ─────────────────────────────────────────────
interface SdKitEntry {
  partBase: string;
  minA: number;
  maxA: number;
  kw400V: number;   // max rated motor power at 400V
  note: string;
}

const SD_KITS_3RA2: SdKitEntry[] = [
  { partBase: "3RA2313-8XB30-1A", minA: 0.6,  maxA: 8,   kw400V: 4,    note: "Compact kit S00; timer integrated" },
  { partBase: "3RA2315-8XB30-1A", minA: 7,    maxA: 12.5, kw400V: 5.5,  note: "Compact kit S00" },
  { partBase: "3RA2316-8XB30-1A", minA: 10,   maxA: 16,  kw400V: 7.5,  note: "Compact kit S00" },
  { partBase: "3RA2317-8XB30-1A", minA: 12.5, maxA: 20,  kw400V: 11,   note: "Compact kit S0" },
  { partBase: "3RA2318-8XB30-1A", minA: 17,   maxA: 32,  kw400V: 15,   note: "Compact kit S0" },
  { partBase: "3RA2320-8XB30-1A", minA: 22,   maxA: 40,  kw400V: 22,   note: "Compact kit S0/S2" },
  { partBase: "3RA2322-8XB30-1A", minA: 30,   maxA: 50,  kw400V: 30,   note: "Compact kit S2" },
  { partBase: "3RA2324-8XB30-1A", minA: 36,   maxA: 65,  kw400V: 37,   note: "Compact kit S2" },
  { partBase: "3RA2326-8XB30-1A", minA: 50,   maxA: 75,  kw400V: 45,   note: "Compact kit S3" },
  { partBase: "3RA2328-8XB30-1A", minA: 63,   maxA: 95,  kw400V: 55,   note: "Compact kit S3" },
  { partBase: "3RA2330-8XB30-1A", minA: 80,   maxA: 115, kw400V: 75,   note: "Compact kit S3 — largest compact; verify availability" },
];

export interface StarterBom {
  item: string;
  partNo: string;
  qty: number;
  note: string;
  category: "MPCB" | "CONTACTOR" | "TIMER" | "AUXILIARY" | "KIT";
}

export interface StarterResult {
  motorKw: number;
  fla: number;
  voltage: Voltage;
  starterType: StarterType;
  mpcbFrame: string;
  mpcbPartNo: string;
  mpcbSetA: string;
  /** IcuKA of MPCB */
  icuKa: number;
  bom: StarterBom[];
  timerSec: number;
  warnings: string[];
}

function estimateFla(kw: number, v: Voltage): number {
  // I = P / (√3 × V × PF × η)
  const PF = 0.85, ETA = 0.92;
  return (kw * 1000) / (Math.sqrt(3) * v * PF * ETA);
}

function pickMpcb(fla: number): MpcbEntry {
  return MPCB_3RV2.find(m => m.maxA >= fla && m.minA <= fla * 1.05)
      ?? MPCB_3RV2.find(m => m.maxA >= fla)
      ?? MPCB_3RV2[MPCB_3RV2.length - 1];
}

function pickContactor(fla: number): ContactorEntry {
  return CONTACTOR_3RT2.find(c => c.ac3A >= fla)
      ?? CONTACTOR_3RT2[CONTACTOR_3RT2.length - 1];
}

function mpcbSetSuffix(fla: number, mpcb: MpcbEntry): string {
  // 3RV2 setting range encodes into part suffix — report the range bracket
  const ratio = fla / mpcb.maxA;
  if (ratio < 0.5)      return `${(mpcb.minA).toFixed(1)}–${(mpcb.maxA * 0.5).toFixed(1)} A ← set to ${fla.toFixed(1)} A`;
  return `${(mpcb.maxA * 0.5).toFixed(1)}–${mpcb.maxA.toFixed(1)} A ← set to ${fla.toFixed(1)} A`;
}

export function sizeStarter(input: StarterInput): StarterResult {
  const warnings: string[] = [];
  const fla = input.fla ?? estimateFla(input.motorKw, input.voltage);
  const timer = input.timerSec ?? 10;

  const mpcb = pickMpcb(fla);
  const mpcbPartNo = `${mpcb.partBase}AA0`; // standard: 3RV2031-0AA0 etc — suffix 'AA0' = lowest sub-range

  // ─── DOL ────────────────────────────────────────────────────────────────
  if (input.starterType === "DOL") {
    const km = pickContactor(fla);

    if (fla > 100)
      warnings.push("FLA > 100 A — MPCB 3RV2 range ends at 100 A; use 3VA MCCB + separate motor protection relay 3RU2 instead.");

    const bom: StarterBom[] = [
      {
        item: "MPCB (Motor Protective Circuit Breaker)",
        partNo: mpcbPartNo,
        qty: 1,
        note: `Set to ${fla.toFixed(1)} A FLA. Provides overload + short-circuit + phase-failure protection. Fault signalling via integral Q-switch.`,
        category: "MPCB",
      },
      {
        item: "Contactor — Main (KM1) AC3",
        partNo: `${km.partBase}${km.coil}`,
        qty: 1,
        note: `AC3 rated ${km.ac3A} A / ${km.kw400V} kW at 400V. Coil 230V AC (suffix -1AP). Frame ${km.frameSize}.`,
        category: "CONTACTOR",
      },
      {
        item: "Auxiliary contact block (start/stop feedback)",
        partNo: "3RH2911-1HA11",
        qty: 1,
        note: "1NO+1NC side-mount block. Wired to PLC DI for motor run feedback. Snaps onto 3RT2 side.",
        category: "AUXILIARY",
      },
      {
        item: "Fault transverse auxiliary block (MPCB trip)",
        partNo: "3RV2901-2A",
        qty: 1,
        note: "Clips onto top of 3RV2 MPCB. 1NC fault contact — wired to PLC DI or alarm relay. Signals trip/fault condition.",
        category: "AUXILIARY",
      },
    ];

    warnings.push("DOL starter: inrush current ≈ 6–8× FLA. For motors > 11 kW check utility transformer capacity and cable voltage drop under LRC.");

    return {
      motorKw: input.motorKw, fla: Math.round(fla * 10) / 10, voltage: input.voltage,
      starterType: "DOL",
      mpcbFrame: mpcb.frame, mpcbPartNo, mpcbSetA: mpcbSetSuffix(fla, mpcb),
      icuKa: mpcb.icuKa, bom, timerSec: 0, warnings,
    };
  }

  // ─── STAR-DELTA ──────────────────────────────────────────────────────────
  const flaMain  = fla;                          // main & delta: full FLA
  const flaStar  = fla / Math.sqrt(3);           // star: FLA/√3 ≈ 0.577×FLA
  const flaKit   = fla;                          // kit is sized by FLA (internal contactors pre-matched)

  const kit      = SD_KITS_3RA2.find(k => k.maxA >= flaKit);
  const km1      = pickContactor(flaMain);       // main (fallback for > kit range)
  const km2      = pickContactor(flaStar);       // star
  const km3      = pickContactor(flaStar);       // delta

  let bom: StarterBom[] = [];

  if (kit) {
    // Compact kit path (preferred — per user preference)
    bom = [
      {
        item: "MPCB (Motor Protective Circuit Breaker)",
        partNo: mpcbPartNo,
        qty: 1,
        note: `Set to ${fla.toFixed(1)} A. Feeds the star-delta kit. Trip → simultaneous drop-out of all 3 contactors inside kit.`,
        category: "MPCB",
      },
      {
        item: "Star-Delta Compact Kit (KM1+KM2+KM3+Timer)",
        partNo: kit.partBase,
        qty: 1,
        note: `${kit.note}. Includes main + star + delta contactors + mechanical interlock + ${timer}s adjustable transition timer. Max FLA in kit: ${kit.maxA} A.`,
        category: "KIT",
      },
      {
        item: "Auxiliary contact block (run feedback on KM1)",
        partNo: "3RH2911-1HA11",
        qty: 1,
        note: "1NO+1NC side-mount. Attach to main contactor terminal inside kit. Provides motor RUN status to PLC DI.",
        category: "AUXILIARY",
      },
      {
        item: "Fault transverse auxiliary block (MPCB trip)",
        partNo: "3RV2901-2A",
        qty: 1,
        note: "Clips onto 3RV2 MPCB top. 1NC fault output to PLC fault DI or alarm panel.",
        category: "AUXILIARY",
      },
    ];
  } else {
    // Above kit range: separate contactors
    bom = [
      {
        item: "MPCB (Motor Protective Circuit Breaker)",
        partNo: mpcbPartNo,
        qty: 1,
        note: `Set to ${fla.toFixed(1)} A. For motors > kit range, 3RU2 thermal overload relay may be preferred (set separately at FLA).`,
        category: "MPCB",
      },
      {
        item: "Main Contactor KM1 — AC3 (line side)",
        partNo: `${km1.partBase}${km1.coil}`,
        qty: 1,
        note: `AC3 ${km1.ac3A} A / ${km1.kw400V} kW. Full FLA continuous. Frame ${km1.frameSize}.`,
        category: "CONTACTOR",
      },
      {
        item: "Delta Contactor KM3 — AC3",
        partNo: `${km3.partBase}${km3.coil}`,
        qty: 1,
        note: `AC3 ${km3.ac3A} A. Carries FLA/√3 = ${flaStar.toFixed(1)} A in delta run. Frame ${km3.frameSize}.`,
        category: "CONTACTOR",
      },
      {
        item: "Star Contactor KM2 — AC3",
        partNo: `${km2.partBase}${km2.coil}`,
        qty: 1,
        note: `AC3 ${km2.ac3A} A. Carries FLA/√3 = ${flaStar.toFixed(1)} A during star starting only. Frame ${km2.frameSize}.`,
        category: "CONTACTOR",
      },
      {
        item: "Star-Delta Timer relay",
        partNo: "3RP2025-1BW30",
        qty: 1,
        note: `Star-Delta transition timer. Set to ${timer} s. After timeout: KM2 (star) drops OUT → KM3 (delta) pulls IN. Add 50–80 ms dead-time interlock.`,
        category: "TIMER",
      },
      {
        item: "Mechanical interlock (KM2+KM3 anti-simultaneous)",
        partNo: "3RA1921-1CA00",
        qty: 1,
        note: "Mechanical interlock bridge between star and delta contactors. Prevents simultaneous energisation → would short-circuit motor winding.",
        category: "AUXILIARY",
      },
      {
        item: "Auxiliary contact block (run feedback)",
        partNo: "3RH2911-1HA11",
        qty: 2,
        note: "Attach to KM1 and KM3. KM1 AUX = motor energised; KM3 AUX = delta mode confirmed (PLC interlocking feedback).",
        category: "AUXILIARY",
      },
      {
        item: "Fault transverse auxiliary block (MPCB trip)",
        partNo: "3RV2901-2A",
        qty: 1,
        note: "Clips onto 3RV2 MPCB. Sends 1NC fault contact to PLC fault DI.",
        category: "AUXILIARY",
      },
    ];
    warnings.push(
      `Motor ${input.motorKw} kW (FLA ${fla.toFixed(1)} A) exceeds 3RA2 compact kit range (max 115 A). ` +
      "Using separate contactors + external timer — verify dead-time interlock in PLC ladder (50 ms minimum KM2 drop-out before KM3 energise)."
    );
  }

  if (input.motorKw < 7.5)
    warnings.push("Star-Delta gives small inrush benefit below 7.5 kW — consider DOL + soft-starter if space is tight.");
  if (timer < 5)
    warnings.push("Transition timer < 5 s — motor may not reach sufficient speed in star, causing inrush spike at delta transition.");
  if (input.voltage === 230)
    warnings.push("230 V star-delta: motors must be dual voltage (230V Δ / 400V Y). Verify motor nameplate — winding must be Y during full run.");

  return {
    motorKw: input.motorKw, fla: Math.round(fla * 10) / 10, voltage: input.voltage,
    starterType: "STAR_DELTA",
    mpcbFrame: mpcb.frame, mpcbPartNo, mpcbSetA: mpcbSetSuffix(fla, mpcb),
    icuKa: mpcb.icuKa, bom, timerSec: timer, warnings,
  };
}
