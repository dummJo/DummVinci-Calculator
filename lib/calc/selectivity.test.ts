import { describe, it, expect } from "vitest";
import { checkSelectivity } from "./selectivity";

describe("Breaker Selectivity / Discrimination (IEC 60947-2 §7.2)", () => {
  it("should report full discrimination for a high In ratio within fault limit", () => {
    const result = checkSelectivity({
      upstreamKind: "MCCB-thermomag",
      upstreamInA: 250,
      upstreamIcuKa: 50,
      downstreamKind: "MCB",
      downstreamInA: 63,
      downstreamIcuKa: 10,
      faultIccKa: 5, // below 0.8 × 10 = 8 kA limit
    });

    expect(result.rating).toBe("full");
    expect(result.ratioInIn).toBeGreaterThanOrEqual(2.5);
    expect(result.selectivityLimitKa).toBeGreaterThan(0);
    expect(result.recommendation).toContain("Full selectivity");
  });

  it("should report no selectivity when In ratio is below 1.6", () => {
    const result = checkSelectivity({
      upstreamKind: "MCCB-thermomag",
      upstreamInA: 100,
      upstreamIcuKa: 36,
      downstreamKind: "MCCB-thermomag",
      downstreamInA: 80,
      downstreamIcuKa: 36,
      faultIccKa: 10,
    });

    expect(result.rating).toBe("none");
    expect(result.ratioInIn).toBeLessThan(1.6);
    expect(result.selectivityLimitKa).toBe(0);
  });

  it("should upgrade partial to full for an electronic-trip upstream breaker", () => {
    // ratio 2.0 → base partial; electronic trip should lift it to full
    const result = checkSelectivity({
      upstreamKind: "MCCB-electronic",
      upstreamInA: 160,
      upstreamIcuKa: 50,
      downstreamKind: "MCCB-thermomag",
      downstreamInA: 80,
      downstreamIcuKa: 36,
      faultIccKa: 5, // below 0.9 × 36 limit
    });

    expect(result.ratioInIn).toBeGreaterThanOrEqual(1.6);
    expect(result.ratioInIn).toBeLessThan(2.5);
    expect(result.rating).toBe("full");
    expect(result.notes.some(n => n.includes("Electronic trip"))).toBe(true);
  });

  it("should degrade the rating when site fault exceeds the selectivity limit", () => {
    const result = checkSelectivity({
      upstreamKind: "MCCB-thermomag",
      upstreamInA: 250,
      upstreamIcuKa: 50,
      downstreamKind: "MCB",
      downstreamInA: 63,
      downstreamIcuKa: 10,
      faultIccKa: 9, // above 0.8 × 10 = 8 kA → full degrades to partial
    });

    expect(result.rating).toBe("partial");
    expect(result.notes.some(n => n.includes("exceeds selectivity limit"))).toBe(true);
  });
});
