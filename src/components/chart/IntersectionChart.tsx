"use client";

import { forwardRef, useEffect } from "react";
import type { AxisLabels } from "@/lib/types";
import {
  CHART_HEIGHT,
  CHART_WIDTH,
  renderIntersectionChart,
  type ChartPoint,
} from "@/lib/canvasExport";

interface Props {
  axisLabels: AxisLabels;
  points: ChartPoint[];
  onRendered?: () => void;
}

export const IntersectionChart = forwardRef<HTMLCanvasElement, Props>(
  function IntersectionChart({ axisLabels, points, onRendered }, ref) {
    useEffect(() => {
      const canvas = (ref as React.RefObject<HTMLCanvasElement>)?.current;
      if (!canvas) return;
      let cancelled = false;
      renderIntersectionChart(canvas, { axisLabels, points }, () => cancelled).then(() => {
        if (!cancelled) onRendered?.();
      });
      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [axisLabels, points]);

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
