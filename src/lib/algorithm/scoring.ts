import { TRAIT_DIMENSIONS } from "@/lib/types";
import type {
  Category,
  QuizAnswerMap,
  QuizQuestion,
  SelectedCategoryResult,
  TraitVector,
} from "@/lib/types";

const ZERO_VECTOR: TraitVector = TRAIT_DIMENSIONS.reduce((acc, dim) => {
  acc[dim] = 0;
  return acc;
}, {} as TraitVector);

/**
 * Builds the user's raw trait vector by summing the weighted deltas of each
 * selected quiz answer, then min-max normalizes into 0..1 so it lives in the
 * same space as category vectors.
 */
export function buildUserVector(
  answers: QuizAnswerMap,
  questions: QuizQuestion[]
): TraitVector {
  const raw: TraitVector = { ...ZERO_VECTOR };

  for (const question of questions) {
    const chosenId = answers[question.id];
    if (!chosenId) continue;
    const option = question.options.find((o) => o.id === chosenId);
    if (!option) continue;
    for (const dim of TRAIT_DIMENSIONS) {
      raw[dim] += option.weights[dim] ?? 0;
    }
  }

  const max = Math.max(...TRAIT_DIMENSIONS.map((d) => raw[d]), 1e-6);
  const normalized: TraitVector = { ...ZERO_VECTOR };
  for (const dim of TRAIT_DIMENSIONS) {
    normalized[dim] = raw[dim] / max;
  }
  return normalized;
}

export function cosineSimilarity(a: TraitVector, b: TraitVector): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const dim of TRAIT_DIMENSIONS) {
    dot += a[dim] * b[dim];
    magA += a[dim] * a[dim];
    magB += b[dim] * b[dim];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Maximal Marginal Relevance selection: greedily picks categories that are
 * both similar to the user vector AND dissimilar from what's already been
 * picked, so the final set isn't four near-synonyms of the same archetype.
 *
 * score(candidate) = lambda * sim(user, candidate)
 *                     - (1 - lambda) * max(sim(candidate, selected))
 */
export function selectTopCategoriesMMR(
  userVector: TraitVector,
  categories: Category[],
  count = 4,
  lambda = 0.72
): SelectedCategoryResult[] {
  const candidates = [...categories];
  const selected: SelectedCategoryResult[] = [];

  while (selected.length < count && candidates.length > 0) {
    let bestIndex = -1;
    let bestScore = -Infinity;
    let bestSimilarity = 0;

    candidates.forEach((candidate, index) => {
      const relevance = cosineSimilarity(userVector, candidate.vector);
      const redundancy =
        selected.length === 0
          ? 0
          : Math.max(
              ...selected.map((s) =>
                cosineSimilarity(candidate.vector, s.category.vector)
              )
            );
      const mmrScore = lambda * relevance - (1 - lambda) * redundancy;
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIndex = index;
        bestSimilarity = relevance;
      }
    });

    if (bestIndex === -1) break;
    const [chosen] = candidates.splice(bestIndex, 1);
    selected.push({ category: chosen, similarity: bestSimilarity });
  }

  return selected;
}
