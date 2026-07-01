"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { NeonButton } from "@/components/ui/NeonButton";
import { TagChip } from "@/components/categories/TagChip";
import { CATEGORIES } from "@/lib/data/categories";
import { QUIZ_QUESTIONS } from "@/lib/data/questions";
import { buildUserVector, selectTopCategoriesMMR } from "@/lib/algorithm/scoring";
import { useAppStore } from "@/store/useAppStore";

export default function CategoriesPage() {
  const router = useRouter();
  const quizAnswers = useAppStore((s) => s.quizAnswers);
  const storedSelection = useAppStore((s) => s.selectedCategoryIds);
  const setSelectedCategories = useAppStore((s) => s.setSelectedCategories);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const hasQuizData = Object.keys(quizAnswers).length > 0;

  const recommendedIds = useMemo(() => {
    if (!hasQuizData) return [];
    const userVector = buildUserVector(quizAnswers, QUIZ_QUESTIONS);
    return selectTopCategoriesMMR(userVector, CATEGORIES, 4).map(
      (r) => r.category.id
    );
  }, [hasQuizData, quizAnswers]);

  const [selected, setSelected] = useState<string[]>(() => {
    if (storedSelection.length === 4) return storedSelection;
    if (recommendedIds.length === 4) return recommendedIds;
    return [];
  });

  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated || selected.length > 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing initial selection from persisted storage once hydration completes
    if (storedSelection.length === 4) setSelected(storedSelection);
    else if (recommendedIds.length === 4) setSelected(recommendedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  function toggle(id: string) {
    setSelected((current) => {
      if (current.includes(id)) {
        setNotice(null);
        return current.filter((c) => c !== id);
      }
      if (current.length >= 4) {
        setNotice("You can only map 4 intersections at once — deselect one first.");
        return current;
      }
      setNotice(null);
      return [...current, id];
    });
  }

  function handleContinue() {
    setSelectedCategories(selected);
    router.push("/photos");
  }

  return (
    <PageShell wide>
      <button
        onClick={() => router.push(hasQuizData ? "/quiz" : "/")}
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="flex flex-col gap-2 mb-10">
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          Choose your four
        </h1>
        <p className="text-muted text-sm sm:text-base max-w-xl">
          {hasQuizData
            ? "Based on your answers, we've highlighted your strongest matches — marked with a dot. Swap any of them for something else from the library. You need exactly four."
            : "Pick any four identities from the library below to build your map."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {CATEGORIES.map((category) => (
          <TagChip
            key={category.id}
            category={category}
            selected={selected.includes(category.id)}
            recommended={recommendedIds.includes(category.id)}
            onToggle={() => toggle(category.id)}
          />
        ))}
      </div>

      {notice && (
        <p className="mt-4 text-sm text-neon-coral">{notice}</p>
      )}

      <div className="sticky bottom-0 mt-10 flex items-center justify-between gap-4 border-t border-white/10 bg-background/90 backdrop-blur px-1 py-5">
        <span className="font-mono text-sm text-muted">
          {selected.length} / 4 selected
        </span>
        <NeonButton
          onClick={handleContinue}
          disabled={selected.length !== 4}
          variant="primary"
        >
          Continue to photos
        </NeonButton>
      </div>
    </PageShell>
  );
}
