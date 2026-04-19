import { sizeVsd, VsdInput, VsdResult, Voltage, DriveApp } from "./vsd";
import { sizeCable, CableInput, CableResult, Phase, Insulation, Install } from "./cable";
import { sizeBreaker, BreakerInput, BreakerResult, Curve } from "./breaker";

export interface UnifiedInput {
  motorKw: number;
  motorAmps?: number;         // Manual FLA entry
  voltage: Voltage;
  app: DriveApp;
  dutyHeavy: boolean;
  cableLengthM: number;
  cableInsulation: Insulation;
  cableInstall: Install;
  ambientC: number;
  faultCurrentKa: number;    // kA for breaker
  panelDeltaT: number;       // For VSD airflow
}

export interface UnifiedResult {
  vsd: VsdResult;
  cable: CableResult;
  breaker: BreakerResult;
  estimatedMotorAmps: number;
}

/**
 * Estimates FLA based on kW and Voltage if not provided.
 * Rough formula: I = P / (V * sqrt(3) * pf * eff)
 */
export function estimateAmps(kw: number, v: number, pf = 0.85, eff = 0.9): number {
  return (kw * 1000) / (v * Math.sqrt(3) * pf * eff);
}

export function sizeMotorStarter(input: UnifiedInput): UnifiedResult {
  const motorAmps = input.motorAmps || estimateAmps(input.motorKw, input.voltage);

  // 1. Size VSD
  const vsd = sizeVsd({
    motorKw: input.motorKw,
    voltage: input.voltage,
    app: input.app,
    dutyHeavy: input.dutyHeavy,
    panelDeltaT: input.panelDeltaT,
    ambientC: input.ambientC,
  });

  // 2. Size Cable (using motor amps)
  const cable = sizeCable({
    current: motorAmps,
    lengthM: input.cableLengthM,
    voltage: input.voltage,
    phase: "3ph",
    insulation: input.cableInsulation,
    install: input.cableInstall,
    ambientC: input.ambientC,
  });

  // 3. Size Breaker (using vsd result or motor amps?)
  // Usually sizing for the drive's nominal current or motor's FLA + margin. 
  // We use the drive load flag for D curve.
  const breaker = sizeBreaker({
    loadCurrent: motorAmps,
    faultCurrent: input.faultCurrentKa,
    curve: "C", // will be forced to D by driveLoad: true
    poles: 3,
    driveLoad: true,
  });

  return {
    vsd,
    cable,
    breaker,
    estimatedMotorAmps: Math.round(motorAmps * 10) / 10,
  };
}
