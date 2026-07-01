"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, Wand2 } from "lucide-react";
import type { Category } from "@/lib/types";

export function PhotoSlot({
  category,
  stickerDataUrl,
  onFile,
  onPlaceholder,
}: {
  category: Category;
  stickerDataUrl?: string;
  onFile: (file: File) => Promise<void>;
  onPlaceholder: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      await onFile(file);
    } finally {
      setProcessing(false);
      e.target.value = "";
    }
  }

  return (
    <motion.div
      layout
      className="rounded-2xl border border-white/10 p-5 flex flex-col items-center text-center gap-3"
    >
      <p className="font-display text-base">{category.name}</p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative h-32 w-32 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center hover:border-white/30 transition-colors"
      >
        {processing ? (
          <Loader2 className="animate-spin text-muted" size={22} />
        ) : stickerDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stickerDataUrl}
            alt={category.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="flex flex-col items-center gap-1 text-muted text-xs">
            <Upload size={18} />
            Upload
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      <button
        type="button"
        onClick={onPlaceholder}
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
      >
        <Wand2 size={12} />
        Use a generated placeholder
      </button>
    </motion.div>
  );
}
