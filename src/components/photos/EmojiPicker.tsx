"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { EMOJI_GROUPS } from "@/lib/data/emojis";

export function EmojiPicker({
  onConfirm,
  onClose,
}: {
  onConfirm: (emojis: string[]) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);

  function toggle(emoji: string) {
    setPicked((current) => {
      if (current.includes(emoji)) return current.filter((e) => e !== emoji);
      if (current.length >= 2) return [current[1], emoji];
      return [...current, emoji];
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="absolute z-20 top-full mt-2 w-72 rounded-xl border border-white/15 bg-background shadow-2xl"
    >
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="text-xs text-muted">
          {picked.length === 0
            ? "Pick 1 or 2 to mash up"
            : `${picked.join(" ")} selected`}
        </span>
        <button type="button" onClick={onClose} className="text-xs text-muted hover:text-foreground">
          Close
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto px-3 pb-3">
        {EMOJI_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="text-[10px] uppercase tracking-wider text-muted/70 mb-1 mt-2">
              {group.label}
            </p>
            <div className="grid grid-cols-8 gap-1">
              {group.emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => toggle(emoji)}
                  className={clsx(
                    "text-xl rounded-md p-1 transition-colors",
                    picked.includes(emoji) ? "bg-white/20" : "hover:bg-white/10"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => onConfirm(picked)}
          disabled={picked.length === 0}
          className="w-full rounded-full bg-foreground text-background text-sm font-medium py-2 disabled:opacity-30 transition-opacity"
        >
          Use {picked.length === 2 ? "mashup" : "emoji"}
        </button>
      </div>
    </motion.div>
  );
}
