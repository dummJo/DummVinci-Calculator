/**
 * Discrimination / selectivity check between two cascaded breakers.
 *
 * Simplified rule-of-thumb implementation: real coordination requires
 * manufacturer-published I²t & time-current matrices. This produces a
 * conservative first-pass result and tells the engineer when a matrix
 * consult is required.
 *
 * Reference: IEC 60947-2 §7.2 (selectivity classifications), Siemens 3VA
 * coordination tables for thresholds.
 */

export type BreakerKind = "MCB" | "MCCB-thermomag" | "MCCB-electronic" | "ACB";

export interface SelectivityInput {
  upstreamKind: BreakerKind;
  upstreamInA: number;
  upstreamIcuKa: number;
  downstreamKind: BreakerKind;
  downstreamInA: number;
  downstreamIcuKa: number;
  faultIccKa: number;       // expected fault current at downstream location
}

export type SelectivityRating = "full" | "partial" | "none";

export interface SelectivityResult {
  rating: SelectivityRating;
  ratioInIn: number;
  selectivityLimitKa: number;
  notes: string[];
  recommendation: string;
}

export function checkSelectivity(input: SelectivityInput): SelectivityResult {
  const notes: string[] = [];
  const ratio = input.upstreamInA / Math.max(1, input.downstreamInA);

  // Base rating from current-ratio rule of thumb.
  let rating: SelectivityRating;
  let limitKa: number;

  if (ratio >= 2.5) {
    rating = "full";
    limitKa = input.downstreamIcuKa * 0.8;
    notes.push("In ratio ≥ 2.5 — full discrimination on thermal trips");
  } else if (ratio >= 1.6) {
    rating = "partial";
    limitKa = input.downstreamIcuKa * 0.5;
    notes.push("In ratio 1.6–2.5 — partial; consult manufacturer matrix for exact Is");
  } else {
    rating = "none";
    limitKa = 0;
    notes.push("In ratio < 1.6 — no margin for thermal discrimination");
  }

  // Electronic trip improves outcome by allowing adjustable short-time delay.
  if (input.upstreamKind === "MCCB-electronic" || input.upstreamKind === "ACB") {
    if (rating === "partial") {
      rating = "full";
      notes.push("Electronic trip with short-time delay (STD) upgrades partial → full");
    }
    limitKa = input.downstreamIcuKa * 0.9;
  }

  // Compare to actual site fault current.
  if (rating !== "none" && input.faultIccKa > limitKa) {
    notes.push(`Site fault ${input.faultIccKa} kA exceeds selectivity limit ${limitKa.toFixed(1)} kA — discrimination not guaranteed above this point`);
    rating = rating === "full" ? "partial" : "none";
  }

  // Icu sanity check
  if (input.downstreamIcuKa < input.faultIccKa)
    notes.push(`Downstream Icu (${input.downstreamIcuKa} kA) < fault current (${input.faultIccKa} kA) — breaker undersized`);

  let recommendation: string;
  switch (rating) {
    case "full":
      recommendation = `Full selectivity verified up to ${limitKa.toFixed(1)} kA. A downstream fault will not trip the upstream breaker.`;
      break;
    case "partial":
      recommendation = `Partial selectivity up to ${limitKa.toFixed(1)} kA. Above this current, both breakers may trip together.`;
      break;
    case "none":
      recommendation = "No selectivity guaranteed. Options: (a) increase upstream In ratio, (b) switch upstream to electronic-trip MCCB / ACB with adjustable STD, or (c) wire Zone Selective Interlocking (ZSI).";
      break;
  }

  return {
    rating,
    ratioInIn: Math.round(ratio * 100) / 100,
    selectivityLimitKa: Math.round(limitKa * 100) / 100,
    notes,
    recommendation,
  };
}
