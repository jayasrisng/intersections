"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { NeonButton } from "@/components/ui/NeonButton";
import { DraggableSticker } from "@/components/arrange/DraggableSticker";
import { getCategoryById } from "@/lib/data/categories";
import { projectToAxes } from "@/lib/algorithm/axisPosition";
import { generateAxisLabels } from "@/lib/algorithm/axisLabels";
import { useAppStore } from "@/store/useAppStore";
import type { Position } from "@/lib/types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function defaultPosition(entryId: string, isCustom: boolean): Position {
  if (isCustom) return { x: 0, y: 0 };
  const category = getCategoryById(entryId);
  if (!category) return { x: 0, y: 0 };
  const raw = projectToAxes(category);
  return { x: clamp(raw.x * 0.65, -0.85, 0.85), y: clamp(raw.y * 0.65, -0.85, 0.85) };
}

export default function ArrangePage() {
  const router = useRouter();
  const selection = useAppStore((s) => s.selection);
  const photos = useAppStore((s) => s.photos);
  const positions = useAppStore((s) => s.positions);
  const setPosition = useAppStore((s) => s.setPosition);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const containerRef = useRef<HTMLDivElement>(null);

  const allReady = selection.length === 4 && selection.every((e) => Boolean(photos[e.id]));

  useEffect(() => {
    if (!hasHydrated) return;
    if (selection.length !== 4) {
      router.replace("/categories");
    } else if (!allReady) {
      router.replace("/photos");
    }
  }, [hasHydrated, selection, allReady, router]);

  useEffect(() => {
    if (!hasHydrated) return;
    for (const entry of selection) {
      if (!positions[entry.id]) {
        setPosition(entry.id, defaultPosition(entry.id, entry.isCustom));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, selection]);

  const axisLabels = useMemo(() => {
    if (selection.length !== 4) return null;
    const points = selection.map((entry) => ({
      name: entry.name,
      x: positions[entry.id]?.x ?? 0,
      y: positions[entry.id]?.y ?? 0,
    }));
    return generateAxisLabels(points);
  }, [selection, positions]);

  if (!allReady || !axisLabels) {
    return <PageShell wide>{null}</PageShell>;
  }

  return (
    <PageShell wide>
      <button
        onClick={() => router.push("/photos")}
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          Arrange your map
        </h1>
        <p className="mt-2 text-muted text-sm sm:text-base max-w-xl">
          Drag each sticker anywhere on the grid — the axis labels follow.
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto w-full max-w-xl aspect-square rounded-2xl border border-white/10 bg-black/20 overflow-visible"
      >
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/15" />

        <span className="absolute left-1/2 -translate-x-1/2 -top-6 text-xs text-muted">
          {axisLabels.yTop}
        </span>
        <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 text-xs text-muted">
          {axisLabels.yBottom}
        </span>
        <span className="absolute top-1/2 -translate-y-1/2 -left-2 -translate-x-full text-xs text-muted">
          {axisLabels.xLeft}
        </span>
        <span className="absolute top-1/2 -translate-y-1/2 -right-2 translate-x-full text-xs text-muted">
          {axisLabels.xRight}
        </span>

        {selection.map((entry) => (
          <DraggableSticker
            key={entry.id}
            entry={entry}
            stickerDataUrl={photos[entry.id]?.stickerDataUrl}
            position={positions[entry.id] ?? { x: 0, y: 0 }}
            containerRef={containerRef}
            onChange={(position) => setPosition(entry.id, position)}
          />
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <NeonButton href="/result" variant="primary">
          Generate my map
        </NeonButton>
      </div>
    </PageShell>
  );
}
