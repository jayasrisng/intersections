"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { NeonButton } from "@/components/ui/NeonButton";
import { PhotoSlot } from "@/components/photos/PhotoSlot";
import { getCategoryById } from "@/lib/data/categories";
import {
  createPlaceholderSticker,
  createStickerCutout,
  fileToDataUrl,
} from "@/lib/imageProcessing";
import { useAppStore } from "@/store/useAppStore";

export default function PhotosPage() {
  const router = useRouter();
  const selectedCategoryIds = useAppStore((s) => s.selectedCategoryIds);
  const photos = useAppStore((s) => s.photos);
  const setPhoto = useAppStore((s) => s.setPhoto);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const categories = useMemo(
    () =>
      selectedCategoryIds
        .map((id) => getCategoryById(id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c)),
    [selectedCategoryIds]
  );

  useEffect(() => {
    if (hasHydrated && selectedCategoryIds.length !== 4) {
      router.replace("/categories");
    }
  }, [hasHydrated, selectedCategoryIds, router]);

  async function handleFile(categoryId: string, file: File) {
    const originalDataUrl = await fileToDataUrl(file);
    const stickerDataUrl = await createStickerCutout(originalDataUrl);
    setPhoto(categoryId, { categoryId, originalDataUrl, stickerDataUrl });
  }

  async function handlePlaceholder(categoryId: string, seed: number) {
    const stickerDataUrl = await createPlaceholderSticker(categoryId, seed);
    setPhoto(categoryId, {
      categoryId,
      originalDataUrl: stickerDataUrl,
      stickerDataUrl,
    });
  }

  const allUploaded = categories.every((c) => Boolean(photos[c.id]));

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
          Each photo becomes a die-cut sticker of you, background removed
          automatically. No photo? Generate an icon for the intersection
          instead.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category, i) => (
          <PhotoSlot
            key={category.id}
            category={category}
            stickerDataUrl={photos[category.id]?.stickerDataUrl}
            onFile={(file) => handleFile(category.id, file)}
            onPlaceholder={() => handlePlaceholder(category.id, i)}
          />
        ))}
      </div>

      <div className="sticky bottom-0 mt-10 flex items-center justify-between gap-4 border-t border-white/10 bg-background/90 backdrop-blur px-1 py-5">
        <span className="font-mono text-sm text-muted">
          {categories.filter((c) => Boolean(photos[c.id])).length} / 4 photos ready
        </span>
        <NeonButton
          href="/result"
          disabled={!allUploaded}
          variant="primary"
        >
          Generate my map
        </NeonButton>
      </div>
    </PageShell>
  );
}
