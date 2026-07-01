import type { AxisLabels, Category, TraitDimension } from "@/lib/types";

interface AxisPair {
  low: string;
  high: string;
  affinityDim: TraitDimension;
}

// x-axis: inner orientation (low) <-> outer orientation (high)
const X_AXIS_PAIRS: AxisPair[] = [
  { low: "Deep Focus", high: "External Impact", affinityDim: "analyticalDepth" },
  { low: "Quiet Craft", high: "Public Stage", affinityDim: "technicalExecution" },
  { low: "Inner World", high: "Outward Motion", affinityDim: "creativeExpression" },
  { low: "Solo Depth", high: "Shared Momentum", affinityDim: "socialEnergy" },
];

// y-axis: stability (low) <-> motion (high)
const Y_AXIS_PAIRS: AxisPair[] = [
  { low: "Calm Clarity", high: "Creative Chaos", affinityDim: "creativeExpression" },
  { low: "Steady Ground", high: "Constant Motion", affinityDim: "exploration" },
  { low: "Still Waters", high: "Kinetic Energy", affinityDim: "leadership" },
  { low: "Grounded Clarity", high: "In Flux", affinityDim: "productIntuition" },
];

function pickPair(pairs: AxisPair[], categories: Category[]): AxisPair {
  let best = pairs[0];
  let bestScore = -Infinity;
  for (const pair of pairs) {
    const avg =
      categories.reduce((sum, c) => sum + c.vector[pair.affinityDim], 0) /
      categories.length;
    if (avg > bestScore) {
      bestScore = avg;
      best = pair;
    }
  }
  return best;
}

/**
 * Chooses axis label wording dynamically based on which trait dimension is
 * most dominant across the user's four selected categories, rather than a
 * single hardcoded pair of labels.
 */
export function generateAxisLabels(categories: Category[]): AxisLabels {
  const xPair = pickPair(X_AXIS_PAIRS, categories);
  const yPair = pickPair(Y_AXIS_PAIRS, categories);

  return {
    xLeft: xPair.low,
    xRight: xPair.high,
    yTop: yPair.high,
    yBottom: yPair.low,
  };
}
