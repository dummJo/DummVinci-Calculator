/**
 * ABB VSD sizing + required panel airflow.
 * Catalog: ACQ580 (HVAC-R / pump & fan) and ACS880 (industrial / crane / heavy duty).
 * Frame data approximated from ABB hardware manuals (3AUA0000099584 ACQ580, 3AUA0000078093 ACS880).
 * Heat dissipation ≈ 3% of drive rated kW (typical for IGBT).
 * Required panel airflow Q [m³/h] = Ploss_W * 3.6 / (ρ·cp·ΔT) ≈ Ploss_W * 3.1 / ΔT,
 * using air ρ·cp ≈ 1.16 kJ/m³·K and ΔT in K.
 */

import drives from "@/data/abb-drives.json";

export type DriveApp = "pump" | "fan" | "crane" | "conveyor" | "compressor";
export type Voltage = 380 | 400 | 415 | 480 | 690;

export interface VsdInput {
  motorKw: number;
  voltage: Voltage;
  app: DriveApp;
  dutyHeavy: boolean;        // crane / conveyor high-inertia → oversize
  panelDeltaT: number;       // allowed ΔT inside panel vs ambient (K), typical 10–15
  ambientC?: number;         // Ambient temperature outside panel (°C), base 40°C
}

interface DriveFrame {
  family: "ACQ580" | "ACS880";
  code: string;
  frame: string;
  voltage: number;
  nominalA: number;
  ratedKw: number;
  ploss: number;             // W at nominal load
  requiredAirflow: number;   // m³/h through heatsink per ABB manual
  h: number; w: number; d: number;
  fuseA: number;
}

export interface VsdResult {
  family: "ACQ580" | "ACS880";
  partCode: string;
  frame: string;
  nominalA: number;
  ratedKw: number;
  plossW: number;
  heatsinkAirflow: number;        // drive's own heatsink demand (m³/h)
  panelAirflowRequired: number;   // panel-level Q for ΔT limit (m³/h)
  h: number; w: number; d: number;
  fuseA: number;
  recommendation: string;
  warnings: string[];
  keyFeatures: string[];
}

const LIST = drives as DriveFrame[];

export function sizeVsd(input: VsdInput): VsdResult {
  const heavy = input.dutyHeavy || input.app === "crane" || input.app === "conveyor";
  const family: "ACQ580" | "ACS880" = heavy ? "ACS880" : "ACQ580";
  const oversize = heavy ? 1.2 : 1.05;
  const targetKw = input.motorKw * oversize;
  const ambient = input.ambientC ?? 40;

  // ABB Manual: 1% derating per 1°C above 40°C
  const tempDerate = ambient > 40 ? 1 - (ambient - 40) * 0.01 : 1.0;

  const candidates = LIST
    .filter(d => {
      const deratedA = d.nominalA * tempDerate;
      // Rough kW check after derating (matching A/kW ratio)
      const deratedKw = d.ratedKw * tempDerate;
      return d.family === family && d.voltage === input.voltage && deratedKw >= targetKw;
    })
    .sort((a, b) => a.ratedKw - b.ratedKw);

  const pick = candidates[0];
  const warnings: string[] = [];

  if (!pick) {
    return {
      family, partCode: "—", frame: "—", nominalA: 0, ratedKw: 0, plossW: 0,
      heatsinkAirflow: 0, panelAirflowRequired: 0,
      recommendation: `No ${family} @ ${input.voltage}V matches ${targetKw.toFixed(1)} kW. Check catalog / use HV.`,
      warnings: ["Motor kW exceeds listed frames"],
      keyFeatures: [],
    };
  }

  const panelQ = (pick.ploss * 3.1) / Math.max(input.panelDeltaT, 1);

  if (input.app === "crane" && family !== "ACS880")
    warnings.push("Crane duty — ACS880 mandatory for regen / BR support");
  if (input.voltage >= 480) warnings.push("≥480V — verify regional standards & insulation class");
  if (panelQ > 800) warnings.push("High airflow > 800 m³/h — consider forced ventilation + filter");

  const keyFeatures = pick.family === "ACQ580"
    ? [
      "Built-in Intelligent Pump Control (IPC)",
      "Sensorless Flow Calculation",
      "Soft Pipe Fill & Dry Run Protection",
      "Integrated EMC C2 Filter & DC Choke",
      "Coated circuit boards as standard",
    ]
    : [
      "Direct Torque Control (DTC) technology",
      "Integrated Safe Torque Off (STO) SIL3",
      "Built-in Brake Chopper (up to R4 frames)",
      "Supports various fieldbus adapters",
      "Optimized for heavy-duty applications",
    ];

  return {
    family: pick.family,
    partCode: pick.code,
    frame: pick.frame,
    nominalA: pick.nominalA,
    ratedKw: pick.ratedKw,
    plossW: pick.ploss,
    heatsinkAirflow: pick.requiredAirflow,
    panelAirflowRequired: Math.round(panelQ),
    h: pick.h, w: pick.w, d: pick.d,
    fuseA: pick.fuseA,
    recommendation: recommendation(pick, input.app),
    warnings,
    keyFeatures,
  };
}

function recommendation(d: DriveFrame, app: DriveApp): string {
  const note = app === "crane"
    ? "Crane: enable brake chopper + connect STAHL BR to R+/R-. Safety STO via FSO-12."
    : app === "pump" || app === "fan"
      ? "HVAC-R: enable built-in pump/fan control macro; set Vdc curve for pipe resonance"
      : "Industrial: verify motor data plate, run ID-run (first start)";
  return `${d.family} ${d.code} — ${d.frame} frame. ${note}`;
}
