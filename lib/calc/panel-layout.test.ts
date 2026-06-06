import { describe, it, expect } from "vitest";
import { estimatePanelLayout } from "./panel-layout";

describe("Panel Layout Estimator (IEC 61439-1 Annex N)", () => {
  it("should size an enclosure to standard dimensions for a typical VSD + MCB panel", () => {
    const result = estimatePanelLayout({
      vsdFrame: "R3",
      vsdQty: 2,
      mcbCount3p: 6,
      mccbCount: 1,
      mccbFrame: "M",
      busbarTier: "single",
      spacePreference: "comfortable",
    });

    // Standard catalog dimensions
    expect([600, 800, 1000, 1200, 1600, 2000, 2200]).toContain(result.enclosureHmm);
    expect([400, 600, 800, 1000, 1200]).toContain(result.enclosureWmm);
    expect([250, 300, 400, 600]).toContain(result.enclosureDmm);
    expect(result.dinRailRows).toBeGreaterThanOrEqual(1);
    expect(result.breakdown.length).toBeGreaterThan(0);
    expect(result.cabinetMountRequired).toBe(false);
  });

  it("should flag cabinet-mount and warn for R9 frames", () => {
    const result = estimatePanelLayout({
      vsdFrame: "R9",
      vsdQty: 1,
      mcbCount3p: 0,
      mccbCount: 0,
      mccbFrame: "S",
      busbarTier: "none",
      spacePreference: "comfortable",
    });

    expect(result.cabinetMountRequired).toBe(true);
    expect(result.warnings.some(w => w.includes("R9"))).toBe(true);
  });

  it("should be monotonic: more/larger VSDs need an equal-or-taller enclosure", () => {
    const small = estimatePanelLayout({
      vsdFrame: "R2", vsdQty: 1, mcbCount3p: 2, mccbCount: 0,
      mccbFrame: "S", busbarTier: "single", spacePreference: "compact",
    });
    const big = estimatePanelLayout({
      vsdFrame: "R5", vsdQty: 4, mcbCount3p: 2, mccbCount: 0,
      mccbFrame: "S", busbarTier: "single", spacePreference: "compact",
    });
    expect(big.enclosureHmm).toBeGreaterThanOrEqual(small.enclosureHmm);
  });

  it("should add DIN rail rows as the breaker count grows", () => {
    const few = estimatePanelLayout({
      vsdFrame: "none", vsdQty: 0, mcbCount3p: 4, mccbCount: 0,
      mccbFrame: "S", busbarTier: "none", spacePreference: "compact",
    });
    const many = estimatePanelLayout({
      vsdFrame: "none", vsdQty: 0, mcbCount3p: 60, mccbCount: 0,
      mccbFrame: "S", busbarTier: "none", spacePreference: "compact",
    });
    expect(many.dinRailRows).toBeGreaterThan(few.dinRailRows);
  });
});
