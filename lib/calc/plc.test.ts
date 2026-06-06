import { describe, it, expect } from "vitest";
import { sizePlcModules } from "./plc";

describe("PLC I/O Module Calculator (Siemens SIMATIC S7-1200/1500)", () => {
  it("should consume onboard channels before allocating expansion modules", () => {
    // CPU 1214C has 14 DI / 10 DO onboard; small demand should need no SM
    const result = sizePlcModules({
      cpuModel: "CPU 1214C",
      requiredDI: 10,
      requiredDO: 6,
      requiredAI: 1,
      requiredAO: 0,
      sparePct: 20,
    });

    expect(result.cpuPartNo).toContain("6ES7");
    expect(result.modulesUsed.length).toBe(0);
    expect(result.usedSmSlots).toBe(0);
    expect(result.overflowToEt200).toBe(false);
    expect(result.powerOk).toBe(true);
  });

  it("should allocate signal modules and apply the spare margin", () => {
    const result = sizePlcModules({
      cpuModel: "CPU 1214C",
      requiredDI: 48,
      requiredDO: 32,
      requiredAI: 0,
      requiredAO: 0,
      sparePct: 20,
    });

    const di = result.modulesUsed.find(m => m.type === "DI");
    expect(di).toBeDefined();
    // (48-14)*1.2 = 40.8 → 41 channels → SM 1221 is 16ch → 3 modules
    expect(di!.qty).toBe(3);
    expect(result.channelSummary.di).toBeGreaterThanOrEqual(48);
    expect(result.usedSmSlots).toBeGreaterThan(0);
  });

  it("should overflow to ET 200SP when SM count exceeds CPU slots", () => {
    // CPU 1214C supports 8 SM slots; demand many channels to force overflow
    const result = sizePlcModules({
      cpuModel: "CPU 1214C",
      requiredDI: 500,
      requiredDO: 500,
      requiredAI: 100,
      requiredAO: 50,
      sparePct: 20,
    });

    expect(result.overflowToEt200).toBe(true);
    expect(result.et200Heads).toBeGreaterThanOrEqual(1);
    expect(result.usedSmSlots).toBeLessThanOrEqual(result.totalSmSlots);
    expect(result.warnings.some(w => w.includes("Slot overflow"))).toBe(true);
  });

  it("should warn when the spare margin is below 15%", () => {
    const result = sizePlcModules({
      cpuModel: "CPU 1511-1 PN",
      requiredDI: 64,
      requiredDO: 64,
      requiredAI: 8,
      requiredAO: 8,
      sparePct: 10,
    });
    expect(result.warnings.some(w => w.includes("Spare margin < 15%"))).toBe(true);
  });
});
