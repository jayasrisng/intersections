import type { AxisLabels } from "@/lib/types";
import { permutations } from "@/lib/algorithm/permutations";

type PoleKey = keyof AxisLabels;

const POLE_VECTORS: Record<PoleKey, { x: number; y: number }> = {
  xLeft: { x: -1, y: 0 },
  xRight: { x: 1, y: 0 },
  yTop: { x: 0, y: 1 },
  yBottom: { x: 0, y: -1 },
};

export interface NamedPoint {
  name: string;
  x: number;
  y: number;
}

/**
 * Labels each end of the axes with the name of whichever of the four
 * chosen intersections sits closest to it (by current x/y position) — so
 * the chart always reads as "your four," never invented phrases. Finds
 * the optimal one-to-one assignment across all 4! permutations.
 */
export function generateAxisLabels(points: NamedPoint[]): AxisLabels {
  const poleKeys = Object.keys(POLE_VECTORS) as PoleKey[];

  let best = poleKeys;
  let bestCost = Infinity;

  for (const perm of permutations(poleKeys)) {
    let cost = 0;
    perm.forEach((pole, i) => {
      const vector = POLE_VECTORS[pole];
      const point = points[i];
      cost += Math.hypot(vector.x - point.x, vector.y - point.y);
    });
    if (cost < bestCost) {
      bestCost = cost;
      best = perm;
    }
  }

  const labels = {} as AxisLabels;
  best.forEach((pole, i) => {
    labels[pole] = points[i].name;
  });
  return labels;
}
