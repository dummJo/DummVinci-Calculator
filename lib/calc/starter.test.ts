import { describe, it, expect } from "vitest";
import { sizeStarter } from "./starter";

describe("Motor Starter Sizing (Siemens SIRIUS, IEC 60947-4-1)", () => {
  it("should size a DOL starter with MPCB + main contactor + aux blocks", () => {
    // 7.5 kW @ 400V → FLA ≈ 13.8 A
    const result = sizeStarter({
      motorKw: 7.5,
      voltage: 400,
      starterType: "DOL",
    });

    expect(result.starterType).toBe("DOL");
    expect(result.fla).toBeGreaterThan(0);
    expect(result.mpcbPartNo).toContain("3RV2");
    expect(result.mpcbFrame).toMatch(/3RV2/);
    expect(result.icuKa).toBeGreaterThan(0);
    expect(result.timerSec).toBe(0); // DOL has no transition timer

    // BOM must contain an MPCB and at least one contactor
    expect(result.bom.some(b => b.category === "MPCB")).toBe(true);
    expect(result.bom.some(b => b.category === "CONTACTOR")).toBe(true);
  });

  it("should estimate FLA from kW with the documented PF/η defaults", () => {
    // I = P/(√3·V·PF·η), PF=0.85, η=0.92 → ~26.6 A for 15 kW @ 400V
    const result = sizeStarter({ motorKw: 15, voltage: 400, starterType: "DOL" });
    expect(result.fla).toBeGreaterThan(24);
    expect(result.fla).toBeLessThan(30);
  });

  it("should honour a nameplate FLA override", () => {
    const result = sizeStarter({
      motorKw: 11,
      voltage: 400,
      fla: 22,
      starterType: "DOL",
    });
    expect(result.fla).toBe(22);
  });

  it("should pick a compact star-delta kit within range and set the timer", () => {
    // 15 kW @ 400V → FLA ≈ 26.6 A, within 3RA2 kit range
    const result = sizeStarter({
      motorKw: 15,
      voltage: 400,
      starterType: "STAR_DELTA",
      timerSec: 12,
    });

    expect(result.starterType).toBe("STAR_DELTA");
    expect(result.timerSec).toBe(12);
    expect(result.bom.some(b => b.category === "KIT")).toBe(true);
  });

  it("should fall back to separate contactors and warn when motor exceeds kit range", () => {
    // 132 kW @ 400V → FLA well above the 115 A compact-kit ceiling
    const result = sizeStarter({
      motorKw: 132,
      voltage: 400,
      starterType: "STAR_DELTA",
    });

    expect(result.bom.some(b => b.category === "KIT")).toBe(false);
    expect(result.bom.some(b => b.category === "TIMER")).toBe(true);
    expect(result.bom.filter(b => b.category === "CONTACTOR").length).toBeGreaterThanOrEqual(3);
    expect(result.warnings.some(w => w.includes("compact kit range"))).toBe(true);
  });
});
