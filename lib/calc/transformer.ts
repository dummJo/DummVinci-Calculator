/**
 * Distribution transformer sizing — load → standard kVA frame.
 *
 * Method: design kVA = (load kW / pf) × demand × growth → pick smallest
 * IEC/manufacturer standard frame. Returns nominal currents, %Z by frame
 * (typical catalog tiers), regulation under full load, and secondary
 * Icc at terminals (downstream feed for breaker sizing).
 *
 * Reference: IEC 60076-1/-2 ratings; %Z bands match ABB/Schneider /
 * Trafindo Indonesia catalogs.
 */

export type TransformerType = "dry" | "oil";

export interface TransformerInput {
  loadKw: number;
  powerFactor: number;        // 0.7–1.0
  primaryKv: number;          // e.g. 20
  secondaryV: number;         // e.g. 400
  demandFactor?: number;      // default 0.85
  growthFactor?: number;      // default 1.15
  type?: TransformerType;     // default oil
}

export interface TransformerResult {
  loadKva: number;
  designKva: number;
  selectedKva: number;
  pctZ: number;
  primaryAmpsA: number;
  secondaryAmpsA: number;
  regulationPct: number;
  iccSecondaryKa: number;
  partCode: string;
  warnings: string[];
}

// IEC standard transformer kVA tiers (covers 25–3150).
const KVA_CATALOG = [25, 50, 100, 160, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150];

// Typical %Z per IEC 60076-5 and major catalogs.
function impedancePct(kva: number): number {
  if (kva <= 250) return 4;
  if (kva <= 630) return 5;
  if (kva <= 1250) return 6;
  return 7;
}

export function sizeTransformer(input: TransformerInput): TransformerResult {
  const warnings: string[] = [];
  const pf = input.powerFactor;
  const demand = input.demandFactor ?? 0.85;
  const growth = input.growthFactor ?? 1.15;

  const loadKva = input.loadKw / Math.max(0.1, pf);
  const designKva = loadKva * demand * growth;
  const selectedKva = KVA_CATALOG.find(v => v >= designKva) ?? KVA_CATALOG[KVA_CATALOG.length - 1];
  const pctZ = impedancePct(selectedKva);

  const primaryAmpsA = (selectedKva * 1000) / (Math.sqrt(3) * input.primaryKv * 1000);
  const secondaryAmpsA = (selectedKva * 1000) / (Math.sqrt(3) * input.secondaryV);

  // Simplified regulation ≈ %Z × loading × (cosφ + 0.6 × sinφ)
  // (full-form Kapp series collapsed; conservative for engineering use)
  const sinPhi = Math.sqrt(Math.max(0, 1 - pf * pf));
  const loading = designKva / selectedKva;
  const regulationPct = pctZ * loading * (pf + 0.6 * sinPhi);

  // Icc at secondary terminals (assuming infinite bus upstream):
  //   Icc = I_n / (%Z / 100)
  const iccSecondaryKa = (secondaryAmpsA / (pctZ / 100)) / 1000;

  const typeLabel = input.type === "oil" ? "Oil-immersed (ONAN)" : "Dry-type (AN)";
  const partCode = `${typeLabel} ${selectedKva} kVA · ${input.primaryKv} / ${(input.secondaryV / 1000).toFixed(3)} kV · Dyn11 · ${pctZ}% Z`;

  if (selectedKva / Math.max(1, designKva) > 1.5)
    warnings.push("Selected frame > 50 % above design — verify whether smaller frame fits future growth");
  if (regulationPct > 8)
    warnings.push("Regulation > 8 % at full load — consider larger frame or higher pf");
  if (input.type === "dry" && selectedKva >= 2000)
    warnings.push("Dry-type ≥ 2000 kVA — verify cooling class (AF) and IP rating");

  return {
    loadKva:        round1(loadKva),
    designKva:      round1(designKva),
    selectedKva,
    pctZ,
    primaryAmpsA:   round1(primaryAmpsA),
    secondaryAmpsA: Math.round(secondaryAmpsA),
    regulationPct:  round1(regulationPct),
    iccSecondaryKa: round2(iccSecondaryKa),
    partCode,
    warnings,
  };
}

function round1(v: number): number { return Math.round(v * 10) / 10; }
function round2(v: number): number { return Math.round(v * 100) / 100; }
