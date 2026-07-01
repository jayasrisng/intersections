"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import type { Category } from "@/lib/types";

export function TagChip({
  category,
  selected,
  recommended,
  onToggle,
}: {
  category: Category;
  selected: boolean;
  recommended: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      layout
      onClick={onToggle}
      title={category.tagline}
      whileTap={{ scale: 0.96 }}
      className={clsx(
        "relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-150",
        selected
          ? "border-foreground bg-foreground text-background font-medium"
          : "border-white/15 text-foreground/85 hover:border-white/35"
      )}
    >
      {recommended && !selected && (
        <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" />
      )}
      {category.name}
    </motion.button>
  );
}
