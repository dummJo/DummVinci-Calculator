import { describe, it, expect } from "vitest";
import { sizeBusbar } from "./busbar";

describe("Busbar Sizing (DIN 43671 / IEC 61439-1 Annex N)", () => {
  it("should size a copper bar for a typical AC enclosed load", () => {
    const result = sizeBusbar({
      current: 400,
      material: "Cu",
      ambientC: 35,
      enclosed: true,
      forcedCooling: false,
      isDC: false,
    });

    expect(result.sectionMm2).toBeGreaterThan(0);
    expect(result.dimensionMm).toMatch(/mm/);
    expect(result.part).toContain("Cu");
    expect(result.options.length).toBeGreaterThan(0);
    expect(result.options.length).toBeLessThanOrEqual(3);
    // Each option exposes a positive computed capacity
    for (const o of result.options) {
      expect(o.capacityA).toBeGreaterThan(0);
      expect(o.mm2).toBeGreaterThan(0);
    }
  });

  it("should require a larger section for aluminium than copper at equal current", () => {
    const cu = sizeBusbar({
      current: 600, material: "Cu", ambientC: 35,
      enclosed: true, forcedCooling: false, isDC: false,
    });
    const al = sizeBusbar({
      current: 600, material: "Al", ambientC: 35,
      enclosed: true, forcedCooling: false, isDC: false,
    });
    // Al has lower current density → equal-or-larger cross-section required
    expect(al.sectionMm2).toBeGreaterThanOrEqual(cu.sectionMm2);
  });

  it("should be monotonic: higher current picks an equal-or-larger section", () => {
    const low = sizeBusbar({
      current: 200, material: "Cu", ambientC: 35,
      enclosed: true, forcedCooling: false, isDC: false,
    });
    const high = sizeBusbar({
      current: 1000, material: "Cu", ambientC: 35,
      enclosed: true, forcedCooling: false, isDC: false,
    });
    expect(high.sectionMm2).toBeGreaterThanOrEqual(low.sectionMm2);
  });

  it("should mark a segmented DC bus as a 2× configuration", () => {
    const result = sizeBusbar({
      current: 1200, material: "Cu", ambientC: 35,
      enclosed: true, forcedCooling: false, isDC: true, segmented: true,
    });
    expect(result.dimensionMm).toContain("2 ×");
    expect(result.part).toContain("DC");
    expect(result.note).toContain("DC Common Bus");
  });
});
