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
  /** Installation altitude (m above sea level). Default 0. ABB derate kicks in >1000 m. */
  altitudeM?: number;
  variant: "01" | "02" | "04" | "07" | "31" | "34" | "37" | "040C" | "040S";
  ipPreference?: IpRating;
  familyPreference?: "ACQ580" | "ACS880" | "ACS580" | "ACH580" | "ACS380";
}

interface DriveFrame {
  family: "ACQ580" | "ACS880" | "ACS380" | "ACH580" | "ACS580";
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
  
  let family: "ACQ580" | "ACS880" | "ACS380" | "ACH580" | "ACS580" = input.familyPreference || "ACQ580";
  
  if (!input.familyPreference) {
    if (heavy) family = "ACS880";
    else if (isMachinery) family = "ACS380";
    else if (input.app === "fan") family = "ACH580";
    else if (input.app === "compressor") family = "ACS580";
    else family = "ACQ580";
  }
  
  const oversize = heavy ? 1.2 : 1.05;
  const targetKw = input.motorKw * oversize;
  const ambient = input.ambientC ?? 40;
  const altitude = Math.max(0, input.altitudeM ?? 0);

  // ABB ACQ580 / ACS880 HW manual derating (piecewise, conservative):
  //   ≤ 40 °C: 1.00  · 40–50 °C: 1% / °C  · 50–60 °C: 2% / °C (steeper, fan-limited region)
  //   floor 0.40 so absurd ambient still returns a candidate frame rather than empty list.
  let tempDerate = 1.0;
  if (ambient > 40) tempDerate -= Math.min(10, ambient - 40) * 0.01;
  if (ambient > 50) tempDerate -= Math.min(10, ambient - 50) * 0.02;
  tempDerate = Math.max(0.4, tempDerate);

  // ABB altitude derating: full rating up to 1000 m, then 1% per 100 m up to 4000 m.
  // Above 4000 m: special handling, derate flattens to 0.7 with warning.
  let altDerate = 1.0;
  if (altitude > 1000) altDerate -= Math.min(3000, altitude - 1000) / 100 * 0.01;
  altDerate = Math.max(0.7, altDerate);

  const combinedDerate = tempDerate * altDerate;

  const candidates = LIST
    .filter(d => {
      const deratedKw = d.ratedKw * combinedDerate;
      const matchFamily = d.family === family;
      const matchVariant = d.variant === input.variant;
      const matchVoltage = d.voltage === input.voltage;
      const matchIp = input.ipPreference ? d.ip === input.ipPreference : true;

      return matchFamily && matchVariant && matchVoltage && matchIp && deratedKw >= targetKw;
    })
    .sort((a, b) => {
      // Pick the smallest frame whose *derated* rating meets target (not raw rating).
      const da = a.ratedKw * combinedDerate;
      const db = b.ratedKw * combinedDerate;
      if (da !== db) return da - db;
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

  // Same volumetric heat-removal factor as panel.ts (≈3.1 m³·K/(h·W)); aligns with IEC 60890-style panel airflow practice.
  const panelQ = (pick.ploss * 3.1) / Math.max(input.panelDeltaT, 1);

  if (input.app === "crane" && family !== "ACS880")
    warnings.push("Crane duty — ACS880 mandatory for regenerative support");
  if (pick.ip === "IP66") warnings.push("IP66 Rating — verify cable gland plate seals for wash-down");
  if (ambient > 50) warnings.push(`Ambient ${ambient}°C — derate ${Math.round((1 - tempDerate) * 100)}% applied; verify ABB curve for formal submission`);
  if (altitude > 1000) warnings.push(`Altitude ${altitude} m — derate ${Math.round((1 - altDerate) * 100)}% applied per ABB HW manual`);
  if (altitude > 4000) warnings.push("Altitude > 4000 m — ABB special configuration required; contact ABB engineering");

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
    recommendation: recommendation(pick),
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
  if (d.family === "ACS580") return [...base, "General Purpose: Easy set-up with primary settings", "Embedded Modbus RTU", "Reduced energy consumption calculator"];
  if (d.family === "ACS380") return ["Pre-configured for machinery", "Built-in STO SIL3", "Adaptive programming"];
  if (d.family === "ACS880") return [...base, "Direct Torque Control (DTC)", "Safe Torque Off (STO) SIL3", "Brake Chopper support"];
  
  return base;
}

function recommendation(d: DriveFrame): string {
  let note = "";
  if (d.variant === "31" || d.variant === "34" || d.variant === "37") 
    note = "ULH: Ultra-Low Harmonic (THDi < 3%). No external filters needed.";
  else if (d.variant === "040C") note = "ACS380-C: Compact machinery drive with pre-configured I/O.";
  else if (d.variant === "040S") note = "ACS380-S: Standard machinery drive with modular options.";
  else if (d.ip === "IP66") note = "Extreme: Suitable for food & beverage wash-down areas.";
  else if (d.ip === "IP55") note = "Robust: Protected against dust and water jets.";
  else note = "Standard industrial drive configuration.";
  
  return `${d.family} ${d.code} (${d.ip}) — ${d.frame} frame. ${note}`;
}
