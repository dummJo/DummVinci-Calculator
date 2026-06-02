import { describe, it, expect } from "vitest";
import { sizeCable } from "./cable";

describe("Cable Sizing Calculator (IEC 60364-5-52)", () => {
  it("should size a simple 3-phase load correctly", () => {
    const result = sizeCable({
      current: 40,
      lengthM: 50,
      voltage: 400,
      phase: "3ph",
      insulation: "XLPE",
      install: "air",
      ambientC: 30,
    });

    expect(result.phaseSize).toBeGreaterThan(0);
    expect(result.groundSize).toBeGreaterThan(0);
    expect(result.ampacity).toBeGreaterThanOrEqual(40 * 1.25); // conservative 25% safety margin
    expect(result.vdropPct).toBeLessThanOrEqual(3); // default 3% limit
    expect(result.warnings).toHaveLength(0);
  });

  it("should apply ambient temperature derating", () => {
    // 30C ambient vs 50C ambient
    const baseline = sizeCable({
      current: 30,
      lengthM: 10,
      voltage: 400,
      phase: "3ph",
      insulation: "PVC",
      install: "air",
      ambientC: 30,
    });

    const hot = sizeCable({
      current: 30,
      lengthM: 10,
      voltage: 400,
      phase: "3ph",
      insulation: "PVC",
      install: "air",
      ambientC: 50,
    });

    // High temp must reduce derating factor and potentially increase cable size
    expect(hot.deratingFactor).toBeLessThan(baseline.deratingFactor);
    if (hot.phaseSize === baseline.phaseSize) {
      expect(hot.ampacity).toBeLessThan(baseline.ampacity);
    } else {
      expect(hot.phaseSize).toBeGreaterThan(baseline.phaseSize);
    }
  });

  it("should trigger warnings for high ambient temperatures", () => {
    const result = sizeCable({
      current: 20,
      lengthM: 10,
      voltage: 400,
      phase: "3ph",
      insulation: "PVC",
      install: "air",
      ambientC: 45,
    });

    expect(result.warnings).toContain("Ambient ≥ 45°C — consider XLPE or up-size one step");
  });

  it("should return fallback suggestion when load is out of range", () => {
    const result = sizeCable({
      current: 5000, // excessively large load
      lengthM: 10,
      voltage: 400,
      phase: "3ph",
      insulation: "PVC",
      install: "air",
      ambientC: 30,
    });

    expect(result.phaseSize).toBe(0);
    expect(result.suggestion).toContain("No single cable meets load");
  });
});
