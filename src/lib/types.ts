// Eight-dimensional trait space every library category lives in.
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

/** One of the user's four chosen intersections — either pulled from the
 * library (has a trait vector, used for quiz recommendations and a
 * starting position) or typed in freehand (no vector, user places it
 * manually). */
export interface SelectedEntry {
  id: string;
  name: string;
  isCustom: boolean;
}

export interface Position {
  x: number; // -1..1
  y: number; // -1..1
}

export interface AxisLabels {
  xLeft: string;
  xRight: string;
  yTop: string;
  yBottom: string;
}

export interface PhotoAsset {
  entryId: string;
  originalDataUrl: string;
  stickerDataUrl: string;
}

export interface PlacedItem {
  entry: SelectedEntry;
  stickerDataUrl?: string;
  x: number;
  y: number;
}
