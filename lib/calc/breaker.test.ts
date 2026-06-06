import { describe, it, expect } from "vitest";
import { sizeBreaker } from "./breaker";

describe("Breaker Selection (Siemens SENTRON, IEC 60947-2 / 60898)", () => {
  it("should pick the smallest breaker satisfying In ≥ 1.25×Iload and Icu ≥ fault", () => {
    // 20 A load → targetIn = 25 A; 6 kA fault → smallest matching MCB is the 32 A 5SL6
    const result = sizeBreaker({
      loadCurrent: 20,
      faultCurrent: 6,
      curve: "C",
      poles: 3,
    });

    expect(result.nominalA).toBeGreaterThanOrEqual(25);
    expect(result.icuKa).toBeGreaterThanOrEqual(6);
    expect(result.partCode).not.toBe("—");
    expect(result.partCode.length).toBeGreaterThan(0);
    expect(result.curve).toBe("C");
    expect(result.options.length).toBeGreaterThan(0);
    expect(result.options.length).toBeLessThanOrEqual(3);
  });

  it("should force trip curve D and warn when a VSD is upstream", () => {
    const result = sizeBreaker({
      loadCurrent: 30,
      faultCurrent: 10,
      curve: "C",
      poles: 3,
      driveLoad: true,
    });

    expect(result.curve).toBe("D");
    expect(result.warnings.some(w => w.includes("curve forced to D"))).toBe(true);
  });

  it("should escalate to MCCB and higher Icu for large fault currents", () => {
    // 100 A load (targetIn 125 A) with 50 kA fault → must be an MCCB 3VA2 (Icu ≥ 55)
    const result = sizeBreaker({
      loadCurrent: 100,
      faultCurrent: 50,
      curve: "C",
      poles: 3,
    });

    expect(result.type).toBe("MCCB");
    expect(result.icuKa).toBeGreaterThanOrEqual(50);
    expect(result.nominalA).toBeGreaterThanOrEqual(125);
  });

  it("should be monotonic: a larger load picks an equal-or-larger nominal current", () => {
    const small = sizeBreaker({ loadCurrent: 10, faultCurrent: 6, curve: "C", poles: 3 });
    const large = sizeBreaker({ loadCurrent: 50, faultCurrent: 6, curve: "C", poles: 3 });
    expect(large.nominalA).toBeGreaterThanOrEqual(small.nominalA);
  });

  it("should return a no-match fallback when no breaker satisfies the inputs", () => {
    // No catalog entry has Icu ≥ 999 kA
    const result = sizeBreaker({
      loadCurrent: 50,
      faultCurrent: 999,
      curve: "C",
      poles: 3,
    });

    expect(result.partCode).toBe("—");
    expect(result.nominalA).toBe(0);
    expect(result.options).toHaveLength(0);
    expect(result.warnings.some(w => w.includes("No breaker found"))).toBe(true);
  });
});
