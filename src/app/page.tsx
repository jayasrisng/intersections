"use client";

import { motion } from "framer-motion";
import { NeonButton } from "@/components/ui/NeonButton";
import { PreviewChart } from "@/components/landing/PreviewChart";
import { CATEGORIES } from "@/lib/data/categories";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <section className="relative mx-auto w-full max-w-6xl px-6 pt-24 pb-16 sm:pt-32 flex-1 flex flex-col justify-center">
        <div className="grid gap-16 lg:grid-cols-[1.15fr_0.85fr] items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-mono text-xs tracking-[0.35em] uppercase text-muted mb-8"
            >
              Intersections
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-4xl sm:text-5xl md:text-6xl leading-[1.08] tracking-tight"
            >
              You are not <em className="font-display italic font-normal text-accent">one thing.</em>
              <br />
              Map your <em className="font-display italic font-normal text-accent">intersections.</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-7 max-w-md text-base sm:text-lg text-muted leading-relaxed"
            >
              Twelve quick questions. No spirit animals, no &quot;which
              character are you.&quot; Just some quiet math across people and
              professions — landing on the four that actually add up to you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <NeonButton href="/quiz" variant="primary">
                Start the quiz
              </NeonButton>
              <NeonButton href="/categories" variant="secondary">
                Pick manually instead
              </NeonButton>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-14 text-xs font-mono text-muted/70 leading-loose max-w-md"
            >
              {CATEGORIES.slice(0, 12)
                .map((c) => c.name)
                .join("  /  ")}
              {"  /  "}+{CATEGORIES.length - 12} more
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <PreviewChart />
          </motion.div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-10 text-xs text-muted/70 font-mono">
        No account. No backend. Everything lives in your browser.
      </footer>
    </main>
  );
}
