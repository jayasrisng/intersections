import type { Category, QuadrantPlacement } from "@/lib/types";
import { projectToAxes } from "@/lib/algorithm/axisPosition";
import { generateQuadrantCaption } from "@/lib/algorithm/caption";

type QuadrantKey = "TL" | "TR" | "BL" | "BR";

const QUADRANT_SLOTS: Record<QuadrantKey, { x: number; y: number }> = {
  TL: { x: -1, y: 1 },
  TR: { x: 1, y: 1 },
  BL: { x: -1, y: -1 },
  BR: { x: 1, y: -1 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  const result: T[][] = [];
  items.forEach((item, i) => {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([item, ...perm]);
    }
  });
  return result;
}

/**
 * Places exactly one category per quadrant. Computes each category's raw
 * (x, y) from its trait vector, then finds the assignment of categories to
 * quadrants that minimizes total distance to the four quadrant anchors
 * (a small optimal-assignment search — only 4! = 24 permutations).
 */
export function placeCategoriesInQuadrants(
  categories: Category[]
): QuadrantPlacement[] {
  const raw = categories.map((category) => ({
    category,
    ...projectToAxes(category),
  }));

  const quadrantKeys: QuadrantKey[] = ["TL", "TR", "BL", "BR"];
  let bestAssignment: QuadrantKey[] = quadrantKeys;
  let bestCost = Infinity;

  for (const perm of permutations(quadrantKeys)) {
    let cost = 0;
    perm.forEach((quadrant, i) => {
      const slot = QUADRANT_SLOTS[quadrant];
      const point = raw[i];
      cost += Math.hypot(slot.x - point.x, slot.y - point.y);
    });
    if (cost < bestCost) {
      bestCost = cost;
      bestAssignment = perm;
    }
  }

  return raw.map((point, i) => {
    const quadrant = bestAssignment[i];
    const slot = QUADRANT_SLOTS[quadrant];
    const magnitudeX = clamp(0.35 + Math.abs(point.x) * 0.5, 0.35, 0.7);
    const magnitudeY = clamp(0.3 + Math.abs(point.y) * 0.4, 0.3, 0.6);

    return {
      category: point.category,
      quadrant,
      x: slot.x * magnitudeX,
      y: slot.y * magnitudeY,
      caption: generateQuadrantCaption(point.category, quadrant),
    };
  });
}
