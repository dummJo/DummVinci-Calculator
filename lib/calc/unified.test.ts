import { describe, it, expect } from "vitest";
import { sizeMotorStarter, estimateAmps } from "./unified";

describe("Unified Motor Drive Train Sizing (VSD + Cable + Breaker)", () => {
  it("should estimate FLA from kW using the documented PF/efficiency defaults", () => {
    // I = P/(√3·V·PF·η), PF=0.85, η=0.9 → ~26.8 A for 15 kW @ 400V
    const amps = estimateAmps(15, 400);
    expect(amps).toBeGreaterThan(24);
    expect(amps).toBeLessThan(30);
  });

  it("should produce a coordinated VSD + cable + breaker package for a pump", () => {
    const result = sizeMotorStarter({
      motorKw: 15,
      voltage: 400,
      app: "pump",
      dutyHeavy: false,
      cableLengthM: 50,
      cableInsulation: "XLPE",
      cableInstall: "air",
      ambientC: 35,
      faultCurrentKa: 10,
      panelDeltaT: 10,
      driveVariant: "01",
    });

    expect(result.vsd.family).toBe("ACQ580"); // default for pump
    expect(result.vsd.ratedKw).toBeGreaterThanOrEqual(15);
    expect(result.cable.phaseSize).toBeGreaterThan(0);
    expect(result.breaker.partCode.length).toBeGreaterThan(0);
    // Drive load → breaker trip curve forced to D
    expect(result.breaker.curve).toBe("D");
    expect(result.estimatedMotorAmps).toBeGreaterThan(0);
  });

  it("should honour a manual nameplate motor current override", () => {
    const result = sizeMotorStarter({
      motorKw: 11,
      motorAmps: 21,
      voltage: 400,
      app: "fan",
      dutyHeavy: false,
      cableLengthM: 30,
      cableInsulation: "PVC",
      cableInstall: "air",
      ambientC: 30,
      faultCurrentKa: 6,
      panelDeltaT: 10,
      driveVariant: "01",
    });
    expect(result.estimatedMotorAmps).toBe(21);
  });

  it("should be monotonic: a larger motor yields an equal-or-larger cable", () => {
    const common = {
      voltage: 400 as const,
      app: "pump" as const,
      dutyHeavy: false,
      cableLengthM: 40,
      cableInsulation: "XLPE" as const,
      cableInstall: "air" as const,
      ambientC: 35,
      faultCurrentKa: 10,
      panelDeltaT: 10,
      driveVariant: "01" as const,
    };
    const small = sizeMotorStarter({ ...common, motorKw: 5.5 });
    const big = sizeMotorStarter({ ...common, motorKw: 45 });
    expect(big.estimatedMotorAmps).toBeGreaterThan(small.estimatedMotorAmps);
    expect(big.cable.phaseSize).toBeGreaterThanOrEqual(small.cable.phaseSize);
  });
});
