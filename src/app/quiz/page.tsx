"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QUIZ_QUESTIONS } from "@/lib/data/questions";
import { useAppStore } from "@/store/useAppStore";

export default function QuizPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const answers = useAppStore((s) => s.quizAnswers);
  const setAnswer = useAppStore((s) => s.setAnswer);

  const question = QUIZ_QUESTIONS[index];
  const isLast = index === QUIZ_QUESTIONS.length - 1;

  function handleSelect(optionId: string) {
    setAnswer(question.id, optionId);
    window.setTimeout(() => {
      if (isLast) {
        router.push("/categories");
      } else {
        setIndex((i) => i + 1);
      }
    }, 260);
  }

  function handleBack() {
    if (index === 0) {
      router.push("/");
    } else {
      setIndex((i) => i - 1);
    }
  }

  return (
    <PageShell>
      <button
        onClick={handleBack}
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <ProgressBar current={index + 1} total={QUIZ_QUESTIONS.length} />

      <div className="mt-10 min-h-[360px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <QuestionCard
              question={question}
              selectedOptionId={answers[question.id]}
              onSelect={handleSelect}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
