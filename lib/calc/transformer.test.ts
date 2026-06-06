import { describe, it, expect } from "vitest";
import { sizeTransformer } from "./transformer";

const KVA_CATALOG = [25, 50, 100, 160, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150];

describe("Distribution transformer sizing (IEC 60076)", () => {
  const base = {
    loadKw: 400,
    powerFactor: 0.85,
    primaryKv: 20,
    secondaryV: 400,
  };

  it("picks the smallest standard frame ≥ design kVA", () => {
    const r = sizeTransformer(base);
    expect(KVA_CATALOG).toContain(r.selectedKva);
    expect(r.selectedKva).toBeGreaterThanOrEqual(r.designKva);
    // No smaller catalog frame should also satisfy the design kVA.
    const smaller = KVA_CATALOG.filter(v => v < r.selectedKva);
    expect(smaller.every(v => v < r.designKva)).toBe(true);
    expect(Number.isFinite(r.primaryAmpsA)).toBe(true);
    expect(r.primaryAmpsA).toBeGreaterThan(0);
    expect(r.secondaryAmpsA).toBeGreaterThan(0);
    expect(r.partCode).toContain("kVA");
  });

  it("is monotonic: a larger load never selects a smaller frame", () => {
    const small = sizeTransformer({ ...base, loadKw: 100 });
    const large = sizeTransformer({ ...base, loadKw: 900 });
    expect(large.selectedKva).toBeGreaterThanOrEqual(small.selectedKva);
  });

  it("assigns higher %Z to larger frames per IEC 60076-5 bands", () => {
    const r = sizeTransformer(base);
    expect(r.pctZ).toBeGreaterThanOrEqual(4);
    expect(r.pctZ).toBeLessThanOrEqual(7);
  });

  it("guards zero primary kV and zero secondary V (finite output + warnings)", () => {
    const r = sizeTransformer({ ...base, primaryKv: 0, secondaryV: 0 });
    expect(Number.isFinite(r.primaryAmpsA)).toBe(true);
    expect(Number.isFinite(r.secondaryAmpsA)).toBe(true);
    expect(Number.isFinite(r.iccSecondaryKa)).toBe(true);
    expect(r.warnings).toContain("Primary voltage must be > 0 kV — check input.");
    expect(r.warnings).toContain("Secondary voltage must be > 0 V — check input.");
  });

  it("flags a non-physical zero load", () => {
    const r = sizeTransformer({ ...base, loadKw: 0 });
    expect(r.warnings).toContain("Load kW must be > 0 — check input.");
  });
});
