// Eight-dimensional trait space every category and every user lives in.
export const TRAIT_DIMENSIONS = [
  "analyticalDepth",
  "creativeExpression",
  "technicalExecution",
  "socialEnergy",
  "exploration",
  "leadership",
  "calmUnderAmbiguity",
  "productIntuition",
] as const;

export type TraitDimension = (typeof TRAIT_DIMENSIONS)[number];

export type TraitVector = Record<TraitDimension, number>;

export interface Category {
  id: string;
  name: string;
  tagline: string;
  vector: TraitVector;
}

export interface QuizOption {
  id: string;
  label: string;
  // Partial deltas across dimensions. Not every dimension needs an entry.
  weights: Partial<TraitVector>;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  helper?: string;
  options: QuizOption[];
}

export interface QuizAnswerMap {
  [questionId: string]: string; // selected option id
}

export interface SelectedCategoryResult {
  category: Category;
  similarity: number;
}

export interface QuadrantPlacement {
  category: Category;
  quadrant: "TL" | "TR" | "BL" | "BR";
  x: number; // -1..1, position within the full chart space
  y: number; // -1..1
  caption: string;
}

export interface AxisLabels {
  xLeft: string;
  xRight: string;
  yTop: string;
  yBottom: string;
}

export interface PhotoAsset {
  categoryId: string;
  originalDataUrl: string;
  stickerDataUrl: string;
}
