import type { AxisLabels, QuadrantPlacement } from "@/lib/types";
import { permutations } from "@/lib/algorithm/quadrant";

type PoleKey = keyof AxisLabels;

const POLE_VECTORS: Record<PoleKey, { x: number; y: number }> = {
  xLeft: { x: -1, y: 0 },
  xRight: { x: 1, y: 0 },
  yTop: { x: 0, y: 1 },
  yBottom: { x: 0, y: -1 },
};

/**
 * Labels each end of the axes with the name of the category that sits
 * closest to it, rather than an abstract contrast phrase — so the chart
 * reads as "your four" instead of made-up jargon. Uses the same
 * optimal-assignment approach as quadrant placement (4! = 24 permutations)
 * so all four selected categories end up labeling a distinct pole.
 */
export function generateAxisLabels(placements: QuadrantPlacement[]): AxisLabels {
  const poleKeys = Object.keys(POLE_VECTORS) as PoleKey[];

  let best = poleKeys;
  let bestCost = Infinity;

  for (const perm of permutations(poleKeys)) {
    let cost = 0;
    perm.forEach((pole, i) => {
      const vector = POLE_VECTORS[pole];
      const point = placements[i];
      cost += Math.hypot(vector.x - point.x, vector.y - point.y);
    });
    if (cost < bestCost) {
      bestCost = cost;
      best = perm;
    }
  }

  const labels = {} as AxisLabels;
  best.forEach((pole, i) => {
    labels[pole] = placements[i].category.name;
  });
  return labels;
}
