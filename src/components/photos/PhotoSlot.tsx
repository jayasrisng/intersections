"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, Smile, Wand2 } from "lucide-react";
import { EmojiPicker } from "@/components/photos/EmojiPicker";
import { suggestEmojisForName } from "@/lib/data/emojiKeywords";
import type { SelectedEntry } from "@/lib/types";

export function PhotoSlot({
  entry,
  stickerDataUrl,
  onFile,
  onEmoji,
}: {
  entry: SelectedEntry;
  stickerDataUrl?: string;
  onFile: (file: File) => Promise<void>;
  onEmoji: (emojis: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const suggestion = suggestEmojisForName(entry.name);

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

  function handleEmojiConfirm(emojis: string[]) {
    onEmoji(emojis);
    setPickerOpen(false);
  }

  function handleSuggest() {
    onEmoji(suggestion.length > 0 ? suggestion : ["✨"]);
  }

  return (
    <motion.div
      layout
      className="relative rounded-2xl border border-white/10 p-5 flex flex-col items-center text-center gap-3"
    >
      <p className="font-display text-base">{entry.name}</p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={processing}
        className="relative h-32 w-32 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center hover:border-white/30 transition-colors disabled:cursor-wait"
      >
        {processing ? (
          <Loader2 className="animate-spin text-muted" size={22} />
        ) : stickerDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stickerDataUrl}
            alt={entry.name}
            className="h-full w-full object-contain p-1"
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

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          disabled={processing}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors disabled:opacity-40"
        >
          <Smile size={12} />
          Emoji
        </button>
        <button
          type="button"
          onClick={handleSuggest}
          disabled={processing}
          title={suggestion.length > 0 ? `Suggested: ${suggestion.join(" ")}` : "No match — uses a sparkle"}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors disabled:opacity-40"
        >
          <Wand2 size={12} />
          Suggest icon
        </button>
      </div>

      <AnimatePresence>
        {pickerOpen && (
          <EmojiPicker onConfirm={handleEmojiConfirm} onClose={() => setPickerOpen(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
