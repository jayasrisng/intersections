"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2, Loader2, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { NeonButton } from "@/components/ui/NeonButton";
import { IntersectionChart } from "@/components/chart/IntersectionChart";
import { generateAxisLabels } from "@/lib/algorithm/axisLabels";
import { downloadCanvasAsPng } from "@/lib/canvasExport";
import { useAppStore } from "@/store/useAppStore";

export default function ResultPage() {
  const router = useRouter();
  const selection = useAppStore((s) => s.selection);
  const photos = useAppStore((s) => s.photos);
  const positions = useAppStore((s) => s.positions);
  const resetAll = useAppStore((s) => s.resetAll);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(true);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const allReady =
    selection.length === 4 &&
    selection.every((e) => Boolean(photos[e.id]) && Boolean(positions[e.id]));

  useEffect(() => {
    if (!hasHydrated) return;
    if (selection.length !== 4) {
      router.replace("/categories");
    } else if (!allReady) {
      router.replace("/photos");
    }
  }, [hasHydrated, selection, allReady, router]);

  const points = useMemo(
    () =>
      selection.map((entry) => ({
        name: entry.name,
        x: positions[entry.id]?.x ?? 0,
        y: positions[entry.id]?.y ?? 0,
        stickerDataUrl: photos[entry.id]?.stickerDataUrl,
      })),
    [selection, positions, photos]
  );

  const axisLabels = useMemo(
    () => (points.length === 4 ? generateAxisLabels(points) : null),
    [points]
  );

  function handleDownload() {
    if (!canvasRef.current) return;
    downloadCanvasAsPng(canvasRef.current, "intersections.png");
  }

  function handleShareLinkedIn() {
    if (!canvasRef.current) return;
    downloadCanvasAsPng(canvasRef.current, "intersections.png");
    setShareNotice(
      "Your map just downloaded — attach it to your LinkedIn post before publishing."
    );
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        typeof window !== "undefined" ? window.location.origin : ""
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleStartOver() {
    resetAll();
    router.push("/");
  }

  if (!allReady || !axisLabels) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-32 text-muted">
          <Loader2 className="animate-spin" size={20} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell wide>
      <button
        onClick={() => router.push("/arrange")}
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          Your intersection map
        </h1>
        <p className="mt-2 text-muted text-sm sm:text-base max-w-xl">
          High-resolution, ready to download or share.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-xl"
      >
        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 z-10">
            <Loader2 className="animate-spin text-foreground" size={28} />
          </div>
        )}
        <IntersectionChart
          ref={canvasRef}
          axisLabels={axisLabels}
          points={points}
          onRendered={() => setRendering(false)}
        />
      </motion.div>

      <div className="mx-auto max-w-xl mt-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <NeonButton onClick={handleDownload} variant="primary" icon={<Download size={16} />}>
            Download PNG
          </NeonButton>
          <NeonButton
            onClick={handleShareLinkedIn}
            variant="secondary"
            icon={<Share2 size={16} />}
          >
            Share to LinkedIn
          </NeonButton>
          <NeonButton onClick={handleStartOver} variant="ghost" icon={<RotateCcw size={14} />}>
            Start over
          </NeonButton>
        </div>
        {shareNotice && (
          <p className="text-center text-xs text-muted">{shareNotice}</p>
        )}
      </div>
    </PageShell>
  );
}
