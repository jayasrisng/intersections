import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PhotoAsset, Position, QuizAnswerMap, SelectedEntry } from "@/lib/types";

interface AppState {
  quizAnswers: QuizAnswerMap;
  selection: SelectedEntry[];
  photos: Record<string, PhotoAsset>;
  positions: Record<string, Position>;
  hasHydrated: boolean;

  setAnswer: (questionId: string, optionId: string) => void;
  resetQuiz: () => void;
  setSelection: (entries: SelectedEntry[]) => void;
  setPhoto: (entryId: string, asset: PhotoAsset) => void;
  removePhoto: (entryId: string) => void;
  setPosition: (entryId: string, position: Position) => void;
  resetAll: () => void;
  setHasHydrated: (value: boolean) => void;
}

const initialState = {
  quizAnswers: {} as QuizAnswerMap,
  selection: [] as SelectedEntry[],
  photos: {} as Record<string, PhotoAsset>,
  positions: {} as Record<string, Position>,
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

      setSelection: (entries) => set(() => ({ selection: entries.slice(0, 4) })),

      setPhoto: (entryId, asset) =>
        set((state) => ({
          photos: { ...state.photos, [entryId]: asset },
        })),

      removePhoto: (entryId) =>
        set((state) => {
          const next = { ...state.photos };
          delete next[entryId];
          return { photos: next };
        }),

      setPosition: (entryId, position) =>
        set((state) => ({
          positions: { ...state.positions, [entryId]: position },
        })),

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
