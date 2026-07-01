"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { NeonButton } from "@/components/ui/NeonButton";
import { PhotoSlot } from "@/components/photos/PhotoSlot";
import { createEmojiSticker, createStickerCutout, fileToDataUrl } from "@/lib/imageProcessing";
import { useAppStore } from "@/store/useAppStore";

export default function PhotosPage() {
  const router = useRouter();
  const selection = useAppStore((s) => s.selection);
  const photos = useAppStore((s) => s.photos);
  const setPhoto = useAppStore((s) => s.setPhoto);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && selection.length !== 4) {
      router.replace("/categories");
    }
  }, [hasHydrated, selection, router]);

  async function handleFile(entryId: string, file: File) {
    const originalDataUrl = await fileToDataUrl(file);
    const stickerDataUrl = await createStickerCutout(originalDataUrl);
    setPhoto(entryId, { entryId, originalDataUrl, stickerDataUrl });
  }

  function handleEmoji(entryId: string, emojis: string[], seed: number) {
    const stickerDataUrl = createEmojiSticker(emojis, seed);
    setPhoto(entryId, { entryId, originalDataUrl: stickerDataUrl, stickerDataUrl });
  }

  const allReady = selection.every((e) => Boolean(photos[e.id]));

  return (
    <PageShell wide>
      <button
        onClick={() => router.push("/categories")}
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-10">
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          One photo per intersection
        </h1>
        <p className="mt-2 text-muted text-sm sm:text-base max-w-xl">
          Each photo becomes a die-cut sticker, background removed
          automatically. No photo? Mash up to two emoji yourself, or let us
          suggest an icon from the name — chef + traveller becomes one icon.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {selection.map((entry, i) => (
          <PhotoSlot
            key={entry.id}
            entry={entry}
            stickerDataUrl={photos[entry.id]?.stickerDataUrl}
            onFile={(file) => handleFile(entry.id, file)}
            onEmoji={(emojis) => handleEmoji(entry.id, emojis, i)}
          />
        ))}
      </div>

      <div className="sticky bottom-0 mt-10 flex items-center justify-between gap-4 border-t border-white/10 bg-background/90 backdrop-blur px-1 py-5">
        <span className="font-mono text-sm text-muted">
          {selection.filter((e) => Boolean(photos[e.id])).length} / 4 photos ready
        </span>
        <NeonButton href="/arrange" disabled={!allReady} variant="primary">
          Arrange your map
        </NeonButton>
      </div>
    </PageShell>
  );
}
