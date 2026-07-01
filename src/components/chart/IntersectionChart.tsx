"use client";

import { forwardRef, useEffect } from "react";
import type { AxisLabels, QuadrantPlacement } from "@/lib/types";
import { CHART_HEIGHT, CHART_WIDTH, renderIntersectionChart } from "@/lib/canvasExport";

interface Props {
  photosByCategory: Record<string, string>;
  axisLabels: AxisLabels;
  placements: QuadrantPlacement[];
  onRendered?: () => void;
}

export const IntersectionChart = forwardRef<HTMLCanvasElement, Props>(
  function IntersectionChart(
    { photosByCategory, axisLabels, placements, onRendered },
    ref
  ) {
    useEffect(() => {
      const canvas = (ref as React.RefObject<HTMLCanvasElement>)?.current;
      if (!canvas) return;
      let cancelled = false;
      renderIntersectionChart(
        canvas,
        photosByCategory,
        { axisLabels, placements },
        () => cancelled
      ).then(() => {
        if (!cancelled) onRendered?.();
      });
      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [photosByCategory, axisLabels, placements]);

    return (
      <canvas
        ref={ref}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        className="w-full h-auto rounded-2xl border border-white/10"
        style={{ aspectRatio: `${CHART_WIDTH} / ${CHART_HEIGHT}` }}
      />
    );
  }
);
