"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import type { QuizQuestion } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"];

export function QuestionCard({
  question,
  selectedOptionId,
  onSelect,
}: {
  question: QuizQuestion;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl font-normal tracking-tight leading-snug">
        {question.prompt}
      </h2>
      {question.helper && (
        <p className="mt-2 text-sm text-muted">{question.helper}</p>
      )}

      <div className="mt-9 flex flex-col divide-y divide-white/8 border-t border-b border-white/8">
        {question.options.map((option, i) => {
          const isSelected = option.id === selectedOptionId;
          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className={clsx(
                "group flex items-center gap-4 px-1 py-4 text-left text-sm sm:text-base transition-colors duration-150",
                isSelected ? "text-foreground" : "text-foreground/75 hover:text-foreground"
              )}
            >
              <span
                className={clsx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] transition-colors",
                  isSelected
                    ? "bg-foreground text-background"
                    : "border border-white/20 text-muted group-hover:border-white/40"
                )}
              >
                {LETTERS[i]}
              </span>
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
