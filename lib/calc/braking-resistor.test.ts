import { describe, it, expect } from "vitest";
import { sizeBrakingResistor } from "./braking-resistor";

describe("Braking resistor sizing (ABB ACS880 / STAHL)", () => {
  const base = {
    motorKw: 30,
    lineVoltage: 400 as const,
    edPct: 25 as const,
  };

  it("computes the DC-bus and chopper voltages and a valid R window", () => {
    const r = sizeBrakingResistor(base);
    // Udc = 1.35 × Vline → 540 V @ 400 V line.
    expect(r.udcV).toBe(540);
    // Uchop ≈ 1.07 × Udc.
    expect(r.uchopV).toBeGreaterThan(r.udcV);
    expect(Number.isFinite(r.rMinOhm)).toBe(true);
    expect(Number.isFinite(r.rMaxOhm)).toBe(true);
    expect(r.rMinOhm).toBeGreaterThan(0);
    expect(r.rMinOhm).toBeLessThan(r.rMaxOhm);
    // rTarget is the geometric mean and must sit inside the window.
    expect(r.rTargetOhm).toBeGreaterThanOrEqual(r.rMinOhm);
    expect(r.rTargetOhm).toBeLessThanOrEqual(r.rMaxOhm);
    expect(typeof r.part).toBe("string");
  });

  it("marks any matched STAHL code as indicative (*) with a verification note", () => {
    const r = sizeBrakingResistor(base);
    if (r.part.startsWith("STAHL")) {
      expect(r.part).toContain("*");
      expect(
        r.warnings.some(w => w.includes("indicative") && w.includes("STAHL")),
      ).toBe(true);
    }
  });

  it("warns on a collapsed R-window when the peak factor is too high", () => {
    const r = sizeBrakingResistor({ ...base, cranePeakFactor: 3 });
    expect(r.warnings.some(w => w.includes("R-window collapsed"))).toBe(true);
  });

  it("guards a zero motor rating: finite rMin (not Infinity) + explicit warning", () => {
    const r = sizeBrakingResistor({ ...base, motorKw: 0 });
    expect(Number.isFinite(r.rMinOhm)).toBe(true);
    expect(Number.isFinite(r.rMaxOhm)).toBe(true);
    expect(r.warnings).toContain("Motor kW must be > 0 — check input.");
  });

  it("flags 690 V insulation and ED ≥ 40% cooling requirements", () => {
    const r = sizeBrakingResistor({ motorKw: 55, lineVoltage: 690, edPct: 40 });
    expect(r.warnings.some(w => w.includes("1000 V"))).toBe(true);
    expect(r.warnings.some(w => w.includes("forced-cooled"))).toBe(true);
  });
});
