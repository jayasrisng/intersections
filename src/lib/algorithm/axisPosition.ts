import type { Category } from "@/lib/types";

/**
 * Projects a category's 8-dim vector down onto the two chart axes.
 *
 * x: inner orientation (deep individual craft) <-> outer orientation (social/impact)
 * y: stability (calm, considered) <-> motion (exploratory, expressive)
 *
 * Both returned in -1..1, where negative = left/bottom, positive = right/top.
 */
export function projectToAxes(category: Category): { x: number; y: number } {
  const v = category.vector;
  const innerScore = (v.analyticalDepth + v.technicalExecution) / 2;
  const outerScore = (v.socialEnergy + v.leadership) / 2;
  const x = outerScore - innerScore;

  const stabilityScore = v.calmUnderAmbiguity;
  const motionScore = (v.exploration + v.creativeExpression) / 2;
  const y = motionScore - stabilityScore;

  return { x, y };
}
