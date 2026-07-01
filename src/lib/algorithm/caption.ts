import { TRAIT_DIMENSIONS } from "@/lib/types";
import type { Category, TraitDimension } from "@/lib/types";

const DIMENSION_PHRASES: Record<TraitDimension, string> = {
  analyticalDepth: "deep analysis",
  creativeExpression: "creative expression",
  technicalExecution: "hands-on execution",
  socialEnergy: "social energy",
  exploration: "restless curiosity",
  leadership: "quiet leadership",
  calmUnderAmbiguity: "calm under pressure",
  productIntuition: "sharp product instinct",
};

const QUADRANT_FLAVOR: Record<"TL" | "TR" | "BL" | "BR", string> = {
  TL: "living in restless depth",
  TR: "in constant creative motion",
  BL: "quietly, deeply, consistently",
  BR: "calm command of the room",
};

function topDimension(category: Category): TraitDimension {
  return TRAIT_DIMENSIONS.reduce((top, dim) =>
    category.vector[dim] > category.vector[top] ? dim : top
  );
}

/** A short generated caption blending the category's identity with its quadrant. */
export function generateQuadrantCaption(
  category: Category,
  quadrant: "TL" | "TR" | "BL" | "BR"
): string {
  const flavor = QUADRANT_FLAVOR[quadrant];
  return `${category.tagline} — ${flavor}.`;
}

export function topTraitPhrase(category: Category): string {
  return DIMENSION_PHRASES[topDimension(category)];
}

/** Generates the center identity statement joining all four categories. */
export function generateIdentityStatement(categories: Category[]): string {
  const names = categories.map((c) => c.name);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  const last = names[names.length - 1];
  const rest = names.slice(0, -1);
  return `${rest.join(" · ")} · ${last}`;
}
