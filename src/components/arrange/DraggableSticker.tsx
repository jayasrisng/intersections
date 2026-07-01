"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import clsx from "clsx";
import type { Position, SelectedEntry } from "@/lib/types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function DraggableSticker({
  entry,
  stickerDataUrl,
  position,
  containerRef,
  onChange,
}: {
  entry: SelectedEntry;
  stickerDataUrl?: string;
  position: Position;
  containerRef: RefObject<HTMLDivElement | null>;
  onChange: (position: Position) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);

  function updateFromClientPos(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;
    onChange({
      x: clamp(relX * 2 - 1, -1, 1),
      y: clamp((1 - relY) * 2 - 1, -1, 1),
    });
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    elRef.current?.setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    updateFromClientPos(e.clientX, e.clientY);
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    setDragging(false);
    elRef.current?.releasePointerCapture(e.pointerId);
  }

  const leftPct = ((position.x + 1) / 2) * 100;
  const topPct = ((1 - position.y) / 2) * 100;

  return (
    <div
      ref={elRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ left: `${leftPct}%`, top: `${topPct}%`, touchAction: "none" }}
      className={clsx(
        "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 select-none",
        dragging ? "cursor-grabbing z-10" : "cursor-grab"
      )}
    >
      {stickerDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={stickerDataUrl}
          alt={entry.name}
          draggable={false}
          className={clsx(
            "h-16 w-16 sm:h-20 sm:w-20 object-contain pointer-events-none drop-shadow-lg transition-transform",
            dragging && "scale-110"
          )}
        />
      )}
      <p className="text-[11px] font-medium text-foreground/90 whitespace-nowrap pointer-events-none">
        {entry.name}
      </p>
    </div>
  );
}
