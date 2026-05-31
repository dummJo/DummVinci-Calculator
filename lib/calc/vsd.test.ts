import { describe, it, expect } from "vitest";
import { sizeVsd } from "./vsd";

describe("VSD Sizing Calculator (ABB Drives)", () => {
  it("should size vsd for pump application correctly", () => {
    const result = sizeVsd({
      motorKw: 15,
      voltage: 400,
      app: "pump",
      dutyHeavy: false,
      panelDeltaT: 10,
      variant: "01", // Wall-mounted single drive
    });

    expect(result.family).toBe("ACQ580"); // default for pump
    expect(result.ratedKw).toBeGreaterThanOrEqual(15);
    expect(result.plossW).toBeGreaterThan(0);
    expect(result.panelAirflowRequired).toBeGreaterThan(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("should enforce ACS880 for heavy duty or crane applications", () => {
    const result = sizeVsd({
      motorKw: 15,
      voltage: 400,
      app: "crane",
      dutyHeavy: true,
      panelDeltaT: 10,
      variant: "01",
    });

    expect(result.family).toBe("ACS880");
  });

  it("should apply altitude and temperature derating correctly", () => {
    const baseline = sizeVsd({
      motorKw: 5.5,
      voltage: 400,
      app: "pump",
      dutyHeavy: false,
      panelDeltaT: 15,
      variant: "01",
      ambientC: 30,
      altitudeM: 0,
    });

    const extreme = sizeVsd({
      motorKw: 5.5,
      voltage: 400,
      app: "pump",
      dutyHeavy: false,
      panelDeltaT: 15,
      variant: "01",
      ambientC: 52, // high temperature
      altitudeM: 2500, // high altitude
    });

    // Extreme conditions should apply derating and pick a larger or equal drive frame
    expect(extreme.warnings.some(w => w.includes("derate"))).toBe(true);
    expect(extreme.ratedKw).toBeGreaterThanOrEqual(baseline.ratedKw);
  });
});
