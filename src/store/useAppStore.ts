import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PhotoAsset, QuizAnswerMap } from "@/lib/types";

interface AppState {
  quizAnswers: QuizAnswerMap;
  selectedCategoryIds: string[];
  photos: Record<string, PhotoAsset>;
  hasHydrated: boolean;

  setAnswer: (questionId: string, optionId: string) => void;
  resetQuiz: () => void;
  setSelectedCategories: (ids: string[]) => void;
  setPhoto: (categoryId: string, asset: PhotoAsset) => void;
  removePhoto: (categoryId: string) => void;
  resetAll: () => void;
  setHasHydrated: (value: boolean) => void;
}

const initialState = {
  quizAnswers: {} as QuizAnswerMap,
  selectedCategoryIds: [] as string[],
  photos: {} as Record<string, PhotoAsset>,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,

      setAnswer: (questionId, optionId) =>
        set((state) => ({
          quizAnswers: { ...state.quizAnswers, [questionId]: optionId },
        })),

      resetQuiz: () => set({ quizAnswers: {} }),

      setSelectedCategories: (ids) =>
        set(() => ({ selectedCategoryIds: ids.slice(0, 4) })),

      setPhoto: (categoryId, asset) =>
        set((state) => ({
          photos: { ...state.photos, [categoryId]: asset },
        })),

      removePhoto: (categoryId) =>
        set((state) => {
          const next = { ...state.photos };
          delete next[categoryId];
          return { photos: next };
        }),

      resetAll: () => set({ ...initialState, hasHydrated: true }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "intersections-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
