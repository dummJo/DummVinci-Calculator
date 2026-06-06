import { describe, it, expect } from "vitest";
import { calcIcc } from "./icc";

describe("Short-circuit Icc (IEC 60909-0, simplified LV)", () => {
  const base = {
    sourceMva: 500,
    primaryKv: 20,
    secondaryV: 400,
    transformerKva: 630,
    transformerZpct: 5,
  };

  it("computes a finite, plausible Icc for a typical 630 kVA / 400 V feed", () => {
    const r = calcIcc(base);
    expect(Number.isFinite(r.icc3Ka)).toBe(true);
    expect(r.icc3Ka).toBeGreaterThan(0);
    // Peak must exceed the symmetric rms value (Ip = √2·κ·Icc, κ≈1.8).
    expect(r.ipKa).toBeGreaterThan(r.icc3Ka);
    // 1-s thermal ≈ Icc3 for LV.
    expect(r.icw1sKa).toBeCloseTo(r.icc3Ka, 5);
    // Recommended Icu is a standard rating ≥ 1.25 × Icc3.
    const STANDARD_ICU = [10, 16, 25, 36, 50, 65, 85, 100, 150, 200];
    expect(STANDARD_ICU).toContain(r.recommendedIcuKa);
    expect(r.recommendedIcuKa).toBeGreaterThanOrEqual(r.icc3Ka * 1.25 - 1e-9);
    expect(r.warnings).not.toContain("Secondary voltage must be > 0 V — check input.");
  });

  it("adds cable impedance, lowering Icc vs the no-cable case", () => {
    const noCable = calcIcc(base);
    const withCable = calcIcc({ ...base, cableLengthM: 50, cableMm2: 95, cableMaterial: "Cu" });
    expect(withCable.zCableMOhm).toBeGreaterThan(0);
    expect(withCable.icc3Ka).toBeLessThan(noCable.icc3Ka);
  });

  it("guards a zero secondary voltage: finite output + explicit warning (no Infinity/NaN)", () => {
    const r = calcIcc({ ...base, secondaryV: 0 });
    expect(Number.isFinite(r.icc3Ka)).toBe(true);
    expect(Number.isFinite(r.zTotalMOhm)).toBe(true);
    expect(r.warnings).toContain("Secondary voltage must be > 0 V — check input.");
  });

  it("guards a zero source MVA and zero transformer kVA without producing Infinity", () => {
    const r = calcIcc({ ...base, sourceMva: 0, transformerKva: 0 });
    expect(Number.isFinite(r.icc3Ka)).toBe(true);
    expect(Number.isFinite(r.zSourceMOhm)).toBe(true);
    expect(Number.isFinite(r.zTransformerMOhm)).toBe(true);
    expect(r.warnings).toContain("Source short-circuit MVA must be > 0 — check input.");
    expect(r.warnings).toContain("Transformer kVA must be > 0 — check input.");
  });

  it("flags an out-of-band transformer %Z", () => {
    const low = calcIcc({ ...base, transformerZpct: 2 });
    expect(low.warnings.some(w => w.includes("%Z"))).toBe(true);
  });
});
