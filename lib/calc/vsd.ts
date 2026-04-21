/**
 * ABB VSD sizing + required panel airflow.
 * Catalog: ACQ580 (HVAC-R / pump & fan) and ACS880 (industrial / crane / heavy duty).
 * Frame data approximated from ABB hardware manuals.
 */

import drives from "@/data/abb-drives.json";

export type DriveApp = "pump" | "fan" | "crane" | "conveyor" | "compressor";
export type Voltage = 380 | 400 | 415 | 480 | 690;
export type IpRating = "IP20" | "IP21" | "IP55" | "IP66";

export interface VsdInput {
  motorKw: number;
  voltage: Voltage;
  app: DriveApp;
  dutyHeavy: boolean;
  panelDeltaT: number;
  ambientC?: number;
  variant: "01" | "02" | "04" | "07" | "31";
  ipPreference?: IpRating;
}

interface DriveFrame {
  family: "ACQ580" | "ACS880" | "ACS380" | "ACH580";
  variant: string;
  ip: string;
  code: string;
  frame: string;
  voltage: number;
  nominalA: number;
  ratedKw: number;
  ploss: number;
  requiredAirflow: number;
  h: number; w: number; d: number;
  fuseA: number;
}

export interface VsdResult {
  family: string;
  variant: string;
  ip: string;
  partCode: string;
  frame: string;
  nominalA: number;
  ratedKw: number;
  plossW: number;
  heatsinkAirflow: number;
  panelAirflowRequired: number;
  h: number; w: number; d: number;
  fuseA: number;
  recommendation: string;
  warnings: string[];
  keyFeatures: string[];
}

const LIST = drives as DriveFrame[];

export function sizeVsd(input: VsdInput): VsdResult {
  const heavy = input.dutyHeavy || input.app === "crane" || input.app === "conveyor";
  const isMachinery = input.app === "conveyor" && input.motorKw <= 11;
  
  let family: "ACQ580" | "ACS880" | "ACS380" | "ACH580" = "ACQ580";
  if (heavy) family = "ACS880";
  else if (isMachinery) family = "ACS380";
  else if (input.app === "fan") family = "ACH580"; // ACH is usually HVAC/Fan preferred
  
  const oversize = heavy ? 1.2 : 1.05;
  const targetKw = input.motorKw * oversize;
  const ambient = input.ambientC ?? 40;

  const tempDerate = ambient > 40 ? 1 - (ambient - 40) * 0.01 : 1.0;

  const candidates = LIST
    .filter(d => {
      const deratedKw = d.ratedKw * tempDerate;
      const matchFamily = d.family === family;
      const matchVariant = d.variant === input.variant;
      const matchVoltage = d.voltage === input.voltage;
      const matchIp = input.ipPreference ? d.ip === input.ipPreference : true;
      
      return matchFamily && matchVariant && matchVoltage && matchIp && deratedKw >= targetKw;
    })
    .sort((a, b) => {
      // First sort by Kw, then by IP (preferring IP21 if no preference is set)
      if (a.ratedKw !== b.ratedKw) return a.ratedKw - b.ratedKw;
      return a.ip.localeCompare(b.ip);
    });

  const pick = candidates[0];
  const warnings: string[] = [];

  if (!pick) {
    return {
      family, variant: input.variant, ip: input.ipPreference || "IP21",
      partCode: "—", frame: "—", nominalA: 0, ratedKw: 0, plossW: 0,
      heatsinkAirflow: 0, panelAirflowRequired: 0,
      h: 0, w: 0, d: 0, fuseA: 0,
      recommendation: `No ${family}-${input.variant} (${input.ipPreference || "any IP"}) matching ${targetKw.toFixed(1)} kW.`,
      warnings: ["Motor kW exceeds listed catalog frames"],
      keyFeatures: [],
    };
  }

  const panelQ = (pick.ploss * 3.1) / Math.max(input.panelDeltaT, 1);

  if (input.app === "crane" && family !== "ACS880")
    warnings.push("Crane duty — ACS880 mandatory for regenerative support");
  if (pick.ip === "IP66") warnings.push("IP66 Rating — verify cable gland plate seals for wash-down");

  const keyFeatures = getFeatures(pick);

  return {
    family: pick.family,
    variant: pick.variant,
    ip: pick.ip,
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

function getFeatures(d: DriveFrame): string[] {
  const base = [
    "Integrated EMC C2 Filter & DC Choke",
    "Coated circuit boards as standard",
  ];
  
  if (d.family === "ACQ580") return [...base, "Built-in Intelligent Pump Control (IPC)", "Sensorless Flow Calculation", "Soft Pipe Fill Protection"];
  if (d.family === "ACH580") return [...base, "HVAC Specific: Fire Mode included", "Native BACnet/IP support", "Override mode for air handling"];
  if (d.family === "ACS380") return ["Pre-configured for machinery", "Built-in STO SIL3", "Adaptive programming"];
  if (d.family === "ACS880") return [...base, "Direct Torque Control (DTC)", "Safe Torque Off (STO) SIL3", "Brake Chopper support"];
  
  return base;
}

function recommendation(d: DriveFrame, app: DriveApp): string {
  let note = "";
  if (d.variant === "31") note = "ULH: THDi < 3%. No external filters needed.";
  else if (d.ip === "IP66") note = "Extreme: Suitable for food & beverage wash-down areas.";
  else if (d.ip === "IP55") note = "Robust: Protected against dust and water jets.";
  else note = "Standard wall-mount industrial drive.";
  
  return `${d.family} ${d.code} (${d.ip}) — ${d.frame} frame. ${note}`;
}
