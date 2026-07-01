"use client";

import { motion } from "framer-motion";

const DOTS = [
  { x: 26, y: 24, color: "var(--neon-cyan)", label: "Researcher" },
  { x: 76, y: 30, color: "var(--neon-violet)", label: "Advocate" },
  { x: 30, y: 78, color: "var(--neon-lime)", label: "Healer" },
  { x: 80, y: 74, color: "var(--neon-coral)", label: "Explorer" },
];

export function PreviewChart() {
  return (
    <div className="relative aspect-square w-full max-w-sm mx-auto rounded-2xl border border-white/10 p-6 overflow-hidden">
      <div className="absolute left-1/2 top-6 bottom-6 w-px bg-white/10" />
      <div className="absolute top-1/2 left-6 right-6 h-px bg-white/10" />
      {DOTS.map((dot, i) => (
        <motion.div
          key={dot.label}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.15, type: "spring", stiffness: 200, damping: 14 }}
          className="absolute flex flex-col items-center gap-1.5"
          style={{ left: `${dot.x}%`, top: `${dot.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <span
            className="block h-2.5 w-2.5 rounded-full"
            style={{ background: dot.color }}
          />
          <span className="text-[10px] font-mono text-muted whitespace-nowrap">
            {dot.label}
          </span>
        </motion.div>
      ))}
      <div className="absolute inset-x-0 bottom-2 text-center text-[10px] tracking-[0.3em] text-muted/60 font-mono uppercase">
        Sample map
      </div>
    </div>
  );
}
