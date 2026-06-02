// Curated excerpts of the standards each calculator cites, surfaced inline via
// <StandardsRef code="..." />. Builds trust when defending a number to a customer.
//
// These are concise, paraphrased reference notes — NOT verbatim standard text
// (which is copyrighted). Each entry points the engineer at the exact clause to
// open in the official document for a formal submission.

export interface StandardRef {
  title: string;       // standard + clause
  summary: string;     // what it governs, in one or two sentences
  source: string;      // where the value in this tool comes from
}

export const STANDARD_REFS: Record<string, StandardRef> = {
  "iec60364-cable-ampacity": {
    title: "IEC 60364-5-52, Table B.52.4",
    summary:
      "Continuous current-carrying capacity (Iz) for Cu/PVC and Cu/XLPE multicore cables, reference method C (clipped direct, on tray, or in conduit in air at 30 °C). The tool picks the smallest cross-section whose derated Iz ≥ 1.25 × design current.",
    source: "Ampacity tables in lib/calc/cable.ts; PUIL 2011 §5 mirrors these for Indonesia.",
  },
  "iec60364-grouping": {
    title: "IEC 60364-5-52, Table B.52.20",
    summary:
      "Reduction factor for groups of more than one circuit installed touching (in air, on a tray, or in conduit). 2 circuits → 0.85, 3 → 0.79, 4 → 0.75, and so on. Applied multiplicatively to the base ampacity.",
    source: "groupingFactor() in lib/calc/cable.ts.",
  },
  "iec60364-vdrop": {
    title: "IEC 60364-5-52, voltage-drop appendix",
    summary:
      "Recommended max voltage drop 3% (lighting) / 5% (other loads) from origin to load. AC drop is k·I·L·(R·cosφ + X·sinφ) where k = 2 (1φ) or √3 (3φ); reactance matters for ≥ 50 mm².",
    source: "Vdrop loop in lib/calc/cable.ts (resistance + reactance terms).",
  },
  "iec60947-mccb": {
    title: "IEC 60947-2 (MCCB)",
    summary:
      "Low-voltage circuit-breakers: rated current In ≥ design current, breaking capacity Icu ≥ prospective fault current. For motor/drive loads, curve D (10–20× In) avoids nuisance trips on inrush.",
    source: "Siemens 3VA selection in lib/calc/breaker.ts.",
  },
  "iec60898-mcb": {
    title: "IEC 60898 (MCB)",
    summary:
      "Miniature circuit-breakers for household/similar. Tripping curves B (3–5×), C (5–10×), D (10–20× In). Final-circuit protection below MCCB frame sizes.",
    source: "Siemens 5SL/5SY selection in lib/calc/breaker.ts.",
  },
  "din43671-busbar": {
    title: "DIN 43671 / IEC 61439-1 Annex N",
    summary:
      "Rectangular copper/aluminium busbar current rating vs. cross-section and temperature rise. Baseline density ~1.6 A/mm² (Cu) enclosed; forced cooling and open runs raise it, high ambient lowers it.",
    source: "Current-density model in lib/calc/busbar.ts.",
  },
  "iec60890-panel": {
    title: "IEC 60890 / IEC 61439-1",
    summary:
      "Method of temperature-rise verification for enclosures. Natural dissipation P = k·A·ΔT (k ≈ 5.5 W/m²K); forced cooling / AC sizing when heat load exceeds the permissible internal rise.",
    source: "Cooling calc in lib/calc/panel.ts; enclosure footprint per IEC 61439 clearances.",
  },
  "abb-vsd-derate": {
    title: "ABB ACQ580 / ACS880 HW manual — derating",
    summary:
      "Output-current derating above 40 °C (≈1%/°C, steeper above 50 °C) and above 1000 m altitude (≈1%/100 m to 4000 m). Pick a frame whose derated rating still meets the load.",
    source: "Derating curves in lib/calc/vsd.ts (3AUA0000099584 / 3AUA0000078093).",
  },
  "stahl-br": {
    title: "STAHL CraneSystems BR catalog / ABB ACS880 BR guide",
    summary:
      "Braking-resistor selection: R between chopper-overcurrent minimum and peak-power maximum; continuous power = peak × ED%. Duty class (15/25/40/60% ED) sets thermal sizing.",
    source: "R-window + ED model in lib/calc/braking-resistor.ts.",
  },
  "iec60947-starter": {
    title: "IEC 60947-4-1 (motor-starter)",
    summary:
      "Type-2 coordination requirement: protective device (MPCB/contactor) shall withstand fault current without damage that prevents continued service. Star-delta starter uses ~58% of DOL inrush; coordination chart sets contactor/overload selection per AC-3 utilisation category.",
    source: "Siemens SIRIUS 3RV/3RT selection in lib/calc/starter.ts.",
  },
  "siemens-s7-tia": {
    title: "Siemens SIMATIC S7-1200 / S7-1500 system manuals",
    summary:
      "I/O budget per CPU (S7-1200: 8 SM slots, 1600 mA bus; S7-1500: 32 SM slots, 3–10 A bus). Overflow routes to ET 200SP via PROFINET (up to 64 SM per IM 155-6 head). Spare margin ≥ 20 % is standard engineering practice.",
    source: "CPU catalog + SM allocator in lib/calc/plc.ts (TIA Selection Tool 2024).",
  },
};

export type StandardRefCode = keyof typeof STANDARD_REFS;
