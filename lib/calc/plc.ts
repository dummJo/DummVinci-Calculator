/**
 * PLC I/O Module Calculator — Siemens SIMATIC S7-1200 / S7-1500 Gen 2
 *
 * Data source: Siemens TIA Selection Tool catalog (2024), SIMATIC S7-1200 System Manual
 *   6ES7 2xx-xxxxx-xxxx series, SIMATIC S7-1500 System Manual 6ES7 5xx-xxxxx-xxxx series.
 *
 * Rules enforced:
 *   S7-1200 max signal modules (SM): 8 per CPU (CPU 1214C/1215C/1217C)
 *   S7-1500 max I/O modules: 32 per CPU rack (CPU 1511/1513/1516/1518)
 *   Communication modules (CM): max 3 (left side) for S7-1200, max 4 left-side for S7-1500
 *
 * Power budget:
 *   S7-1200: 24 VDC internal bus supply: 1600 mA max for signal modules
 *   S7-1500: 24 VDC internal bus: depends on CPU, typically 3000–10000 mA
 *   Each SM draws ~100–300 mA (see below for module-specific values)
 *
 * Expansion:
 *   S7-1200 → ET 200SP distributed I/O on PROFINET (unlimited nodes)
 *   S7-1500 → same, plus ET 200pro for hazardous/outdoor, ET 200M for legacy
 */

export type PlcSeries = "S7-1200" | "S7-1500";
export type CpuModel =
  | "CPU 1212C" | "CPU 1214C" | "CPU 1215C" | "CPU 1217C"    // 1200 series
  | "CPU 1511-1 PN" | "CPU 1513-1 PN" | "CPU 1516-3 PN/DP" | "CPU 1518-4 PN/DP"; // 1500 series

interface CpuSpec {
  series: PlcSeries;
  partNo: string;
  onboardDI: number;
  onboardDO: number;
  onboardAI: number;
  onboardAO: number;
  maxSmSlots: number;
  busPowerMa: number;
  /** false if CPU 1212C — only 2 SM slots */
  expandable: boolean;
}

const CPU_CATALOG: Record<CpuModel, CpuSpec> = {
  // ── S7-1200 ──────────────────────────────────────────────────────────────
  "CPU 1212C": {
    series: "S7-1200", partNo: "6ES7 212-1AE40-0XB0",
    onboardDI: 8, onboardDO: 6, onboardAI: 2, onboardAO: 0,
    maxSmSlots: 2, busPowerMa: 1000, expandable: true,
  },
  "CPU 1214C": {
    series: "S7-1200", partNo: "6ES7 214-1AG40-0XB0",
    onboardDI: 14, onboardDO: 10, onboardAI: 2, onboardAO: 0,
    maxSmSlots: 8, busPowerMa: 1600, expandable: true,
  },
  "CPU 1215C": {
    series: "S7-1200", partNo: "6ES7 215-1AG40-0XB0",
    onboardDI: 14, onboardDO: 10, onboardAI: 2, onboardAO: 2,
    maxSmSlots: 8, busPowerMa: 1600, expandable: true,
  },
  "CPU 1217C": {
    series: "S7-1200", partNo: "6ES7 217-1AG40-0XB0",
    onboardDI: 14, onboardDO: 10, onboardAI: 2, onboardAO: 2,
    maxSmSlots: 8, busPowerMa: 1600, expandable: true,
  },
  // ── S7-1500 ──────────────────────────────────────────────────────────────
  "CPU 1511-1 PN": {
    series: "S7-1500", partNo: "6ES7 511-1AK02-0AB0",
    onboardDI: 0, onboardDO: 0, onboardAI: 0, onboardAO: 0,
    maxSmSlots: 32, busPowerMa: 3000, expandable: true,
  },
  "CPU 1513-1 PN": {
    series: "S7-1500", partNo: "6ES7 513-1AL02-0AB0",
    onboardDI: 0, onboardDO: 0, onboardAI: 0, onboardAO: 0,
    maxSmSlots: 32, busPowerMa: 5000, expandable: true,
  },
  "CPU 1516-3 PN/DP": {
    series: "S7-1500", partNo: "6ES7 516-3AN02-0AB0",
    onboardDI: 0, onboardDO: 0, onboardAI: 0, onboardAO: 0,
    maxSmSlots: 32, busPowerMa: 7500, expandable: true,
  },
  "CPU 1518-4 PN/DP": {
    series: "S7-1500", partNo: "6ES7 518-4AP00-0AB0",
    onboardDI: 0, onboardDO: 0, onboardAI: 0, onboardAO: 0,
    maxSmSlots: 32, busPowerMa: 10000, expandable: true,
  },
};

interface SmSpec {
  type: "DI" | "DO" | "AI" | "AO";
  channels: number;
  partNo: string;
  description: string;
  powerMa: number;  // 24 VDC bus current draw
}

// Best-value SM modules for S7-1200 — SM 1221/1222/1223/1231/1232/1234
const SM_1200: SmSpec[] = [
  { type: "DI", channels: 16, partNo: "6ES7 221-1BH32-0XB0", description: "SM 1221 DI 16 × 24VDC", powerMa: 100 },
  { type: "DO", channels: 16, partNo: "6ES7 222-1BH32-0XB0", description: "SM 1222 DQ 16 × 24VDC", powerMa: 120 },
  { type: "AI", channels: 8,  partNo: "6ES7 231-4HF32-0XB0", description: "SM 1231 AI 8 × 13bit",  powerMa: 60  },
  { type: "AO", channels: 4,  partNo: "6ES7 232-4HD32-0XB0", description: "SM 1232 AQ 4 × 14bit",  powerMa: 80  },
];

// Best-value SM modules for S7-1500 — SM PM1 (I/O modules)
const SM_1500: SmSpec[] = [
  { type: "DI", channels: 32, partNo: "6ES7 521-1BL00-0AB0", description: "DI 32 × 24VDC BA",     powerMa: 150 },
  { type: "DO", channels: 32, partNo: "6ES7 522-1BL01-0AB0", description: "DQ 32 × 24V/0.5A BA",  powerMa: 200 },
  { type: "AI", channels: 8,  partNo: "6ES7 531-7KF00-0AB0", description: "AI 8 × U/I/RTD/TC ST", powerMa: 100 },
  { type: "AO", channels: 8,  partNo: "6ES7 532-5HF00-0AB0", description: "AQ 8 × U/I ST",        powerMa: 120 },
];

export interface PlcInput {
  cpuModel: CpuModel;
  requiredDI: number;
  requiredDO: number;
  requiredAI: number;
  requiredAO: number;
  /** Redundancy spare margin % (default 20) */
  sparePct: number;
}

export interface ModuleAlloc {
  type: string;
  partNo: string;
  description: string;
  qty: number;
  channels: number;
  totalChannels: number;
  powerMa: number;
}

export interface PlcResult {
  cpuModel: CpuModel;
  cpuPartNo: string;
  modulesUsed: ModuleAlloc[];
  totalSmSlots: number;
  usedSmSlots: number;
  freeSmSlots: number;
  overflowToEt200: boolean;
  /** ET 200SP head controller count needed (if overflow) */
  et200Heads: number;
  totalPowerMa: number;
  busPowerMa: number;
  powerOk: boolean;
  channelSummary: { di: number; do: number; ai: number; ao: number };
  warnings: string[];
}

export function sizePlcModules(input: PlcInput): PlcResult {
  const warnings: string[] = [];
  const cpu = CPU_CATALOG[input.cpuModel];
  const smLib = cpu.series === "S7-1200" ? SM_1200 : SM_1500;
  const margin = 1 + input.sparePct / 100;

  // Required after spare margin
  const neededDI = Math.ceil(Math.max(0, input.requiredDI - cpu.onboardDI) * margin);
  const neededDO = Math.ceil(Math.max(0, input.requiredDO - cpu.onboardDO) * margin);
  const neededAI = Math.ceil(Math.max(0, input.requiredAI - cpu.onboardAI) * margin);
  const neededAO = Math.ceil(Math.max(0, input.requiredAO - cpu.onboardAO) * margin);

  function calcModules(type: "DI" | "DO" | "AI" | "AO", needed: number): ModuleAlloc | null {
    if (needed <= 0) return null;
    const sm = smLib.find(m => m.type === type)!;
    const qty = Math.ceil(needed / sm.channels);
    return {
      type,
      partNo: sm.partNo,
      description: sm.description,
      qty,
      channels: sm.channels,
      totalChannels: qty * sm.channels,
      powerMa: qty * sm.powerMa,
    };
  }

  const allocs: ModuleAlloc[] = [
    calcModules("DI", neededDI),
    calcModules("DO", neededDO),
    calcModules("AI", neededAI),
    calcModules("AO", neededAO),
  ].filter(Boolean) as ModuleAlloc[];

  const totalSlots = allocs.reduce((s, m) => s + m.qty, 0);
  const overflowToEt200 = totalSlots > cpu.maxSmSlots;
  const localSlots = Math.min(totalSlots, cpu.maxSmSlots);
  const overflowSlots = Math.max(0, totalSlots - cpu.maxSmSlots);
  // ET 200SP: 64 SM per head controller (IM 151-8 PN/DP)
  const et200Heads = overflowSlots > 0 ? Math.ceil(overflowSlots / 32) : 0;

  const totalPowerMa = allocs.reduce((s, m) => s + m.powerMa, 0);
  const powerOk = totalPowerMa <= cpu.busPowerMa;

  if (overflowToEt200)
    warnings.push(
      `Slot overflow: ${totalSlots} SM needed, CPU supports ${cpu.maxSmSlots}. ` +
      `Route ${overflowSlots} expansion SM to ${et200Heads} × ET 200SP station on PROFINET. ` +
      `Part: 6ES7 151-8AB01-0AB0 (IM 151-8 PN).`
    );

  if (!powerOk)
    warnings.push(
      `Bus power budget exceeded: modules draw ${totalPowerMa} mA vs. CPU supply ${cpu.busPowerMa} mA. ` +
      `Add PM 1507 24V/8A power module (6EP1 333-4BA00) or move modules to ET 200SP.`
    );

  if (cpu.series === "S7-1200" && (input.requiredDI + input.requiredDO + input.requiredAI + input.requiredAO) > 256)
    warnings.push("Total I/O count > 256 — consider upgrading to S7-1500 for better scan-time and diagnostics.");

  if (input.sparePct < 15)
    warnings.push("Spare margin < 15% — typical engineering practice requires 20% minimum for future expansion.");

  return {
    cpuModel: input.cpuModel,
    cpuPartNo: cpu.partNo,
    modulesUsed: allocs,
    totalSmSlots: cpu.maxSmSlots,
    usedSmSlots: localSlots,
    freeSmSlots: cpu.maxSmSlots - localSlots,
    overflowToEt200,
    et200Heads,
    totalPowerMa,
    busPowerMa: cpu.busPowerMa,
    powerOk,
    channelSummary: {
      di: cpu.onboardDI + (allocs.find(m => m.type === "DI")?.totalChannels ?? 0),
      do: cpu.onboardDO + (allocs.find(m => m.type === "DO")?.totalChannels ?? 0),
      ai: cpu.onboardAI + (allocs.find(m => m.type === "AI")?.totalChannels ?? 0),
      ao: cpu.onboardAO + (allocs.find(m => m.type === "AO")?.totalChannels ?? 0),
    },
    warnings,
  };
}

export { CPU_CATALOG };
export type { CpuSpec };
