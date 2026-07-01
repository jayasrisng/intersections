"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { NeonButton } from "@/components/ui/NeonButton";
import { TagChip } from "@/components/categories/TagChip";
import { CATEGORIES } from "@/lib/data/categories";
import { QUIZ_QUESTIONS } from "@/lib/data/questions";
import { buildUserVector, selectTopCategoriesMMR } from "@/lib/algorithm/scoring";
import { useAppStore } from "@/store/useAppStore";
import type { SelectedEntry } from "@/lib/types";

function makeCustomId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function CategoriesPage() {
  const router = useRouter();
  const quizAnswers = useAppStore((s) => s.quizAnswers);
  const storedSelection = useAppStore((s) => s.selection);
  const setSelection = useAppStore((s) => s.setSelection);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const hasQuizData = Object.keys(quizAnswers).length > 0;

  const recommendedIds = useMemo(() => {
    if (!hasQuizData) return [];
    const userVector = buildUserVector(quizAnswers, QUIZ_QUESTIONS);
    return selectTopCategoriesMMR(userVector, CATEGORIES, 4).map(
      (r) => r.category.id
    );
  }, [hasQuizData, quizAnswers]);

  const [selected, setSelected] = useState<SelectedEntry[]>(() => {
    if (storedSelection.length === 4) return storedSelection;
    if (recommendedIds.length === 4) {
      return recommendedIds.map((id) => ({
        id,
        name: CATEGORIES.find((c) => c.id === id)?.name ?? id,
        isCustom: false,
      }));
    }
    return [];
  });

  const [notice, setNotice] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    if (!hasHydrated || selected.length > 0) return;
    if (storedSelection.length === 4) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing initial selection from persisted storage once hydration completes
      setSelected(storedSelection);
    } else if (recommendedIds.length === 4) {
      setSelected(
        recommendedIds.map((id) => ({
          id,
          name: CATEGORIES.find((c) => c.id === id)?.name ?? id,
          isCustom: false,
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  function toggleLibrary(id: string, name: string) {
    setSelected((current) => {
      if (current.some((e) => e.id === id)) {
        setNotice(null);
        return current.filter((e) => e.id !== id);
      }
      if (current.length >= 4) {
        setNotice("You can only map 4 intersections at once — remove one first.");
        return current;
      }
      setNotice(null);
      return [...current, { id, name, isCustom: false }];
    });
  }

  function removeEntry(id: string) {
    setSelected((current) => current.filter((e) => e.id !== id));
    setNotice(null);
  }

  function addCustom() {
    const name = customName.trim();
    if (!name) return;
    if (selected.length >= 4) {
      setNotice("You can only map 4 intersections at once — remove one first.");
      return;
    }
    setSelected((current) => [...current, { id: makeCustomId(), name, isCustom: true }]);
    setCustomName("");
    setNotice(null);
  }

  function handleContinue() {
    setSelection(selected);
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

      <div className="flex flex-col gap-2 mb-8">
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          Choose your four
        </h1>
        <p className="text-muted text-sm sm:text-base max-w-xl">
          {hasQuizData
            ? "Based on your answers, we've highlighted your strongest matches — marked with a dot. Swap any of them, or add your own."
            : "Pick from the library below, or add your own — mommy, travel planner, chef of the group, whatever fits."}
        </p>
      </div>

      {selected.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {selected.map((entry) => (
            <span
              key={entry.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background pl-3 pr-1.5 py-1 text-sm font-medium"
            >
              {entry.name}
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="rounded-full p-0.5 hover:bg-black/10"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addCustom();
          }}
          placeholder="Add your own — e.g. Chef of the group"
          className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm placeholder:text-muted/60 focus:outline-none focus:border-white/40 w-72 max-w-full"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customName.trim() || selected.length >= 4}
          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-4 py-2 text-sm hover:border-white/30 disabled:opacity-30 transition-colors"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {CATEGORIES.map((category) => (
          <TagChip
            key={category.id}
            category={category}
            selected={selected.some((e) => e.id === category.id)}
            recommended={recommendedIds.includes(category.id)}
            onToggle={() => toggleLibrary(category.id, category.name)}
          />
        ))}
      </div>

      {notice && <p className="mt-4 text-sm text-neon-coral">{notice}</p>}

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
