import { describe, it, expect } from "vitest";
import { sizePanel } from "./panel";

describe("Panel / Enclosure Sizing (IEC 60890 / 61439, Rittal & XLTC)", () => {
  it("should select a natural-convection indoor enclosure for a light heat load", () => {
    const result = sizePanel({
      totalHeatW: 150,
      ambientC: 30,
      location: "indoor",
      ip: "IP55",
      coolingMode: "natural",
      spacePreference: "comfortable",
    });

    expect(result.cooling).toBe("natural");
    expect(result.part).not.toBe("—");
    expect(result.surfaceM2).toBeGreaterThan(0);
    expect(result.naturalDissW).toBeGreaterThan(0);
    expect(result.dimMm).toMatch(/mm/);
  });

  it("should attach a fan spec sized from the airflow formula in fan mode", () => {
    const result = sizePanel({
      totalHeatW: 800,
      ambientC: 30,
      location: "indoor",
      ip: "IP55",
      coolingMode: "fan",
      spacePreference: "compact",
    });

    expect(result.cooling).toBe("fan");
    expect(result.fan).toBeDefined();
    expect(result.fan!.airflowM3h).toBeGreaterThan(0);
    expect(result.fan!.rittalCode.length).toBeGreaterThan(0);
    expect(result.fan!.intake.filterAreaCm2).toBeGreaterThan(0);
  });

  it("should force AC mode and warn when a fan is requested with IP66", () => {
    const result = sizePanel({
      totalHeatW: 600,
      ambientC: 30,
      location: "indoor",
      ip: "IP66",
      coolingMode: "fan",
      spacePreference: "compact",
    });

    expect(result.cooling).toBe("ac");
    expect(result.ac).toBeDefined();
    expect(result.warnings.some(w => w.includes("IP66"))).toBe(true);
  });

  it("should warn about IP54 outdoors and add solar/transmission gain to AC load", () => {
    const result = sizePanel({
      totalHeatW: 1000,
      ambientC: 30,
      location: "outdoor",
      ip: "IP54",
      coolingMode: "ac",
      spacePreference: "comfortable",
    });

    expect(result.warnings.some(w => w.includes("IP54 not recommended outdoors"))).toBe(true);
    expect(result.ac).toBeDefined();
    // Outdoor applies 1.25× gain → AC heat load exceeds raw 1000 W
    expect(result.ac!.heatLoadW).toBeGreaterThan(1000);
    expect(result.ac!.mode).toBe("cooling+heating");
    expect(result.ac!.nominalW).toBeGreaterThanOrEqual(result.ac!.heatLoadW);
  });

  it("should warn that AC is mandatory at high ambient temperature", () => {
    const result = sizePanel({
      totalHeatW: 500,
      ambientC: 48,
      location: "indoor",
      ip: "IP55",
      coolingMode: "ac",
      spacePreference: "compact",
    });
    expect(result.warnings.some(w => w.includes("AC mandatory"))).toBe(true);
  });
});
