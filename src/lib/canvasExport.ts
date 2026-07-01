import type { AxisLabels } from "@/lib/types";

export const CHART_WIDTH = 1600;
export const CHART_HEIGHT = 1500;

export interface ChartPoint {
  name: string;
  x: number; // -1..1
  y: number; // -1..1
  stickerDataUrl?: string;
}

interface RenderModel {
  axisLabels: AxisLabels;
  points: ChartPoint[];
}

function quadrantAccent(x: number, y: number): string {
  if (x >= 0 && y >= 0) return "#b47bff"; // TR
  if (x < 0 && y >= 0) return "#5ef1ff"; // TL
  if (x < 0 && y < 0) return "#d4ff5e"; // BL
  return "#ff6b6b"; // BR
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Shrinks the font size until `text` fits within `maxWidth`, so long
 * category names never get clipped at the edge of the chart. */
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  { family, weight = "500", maxSize = 24, minSize = 13 }: {
    family: string;
    weight?: string;
    maxSize?: number;
    minSize?: number;
  }
): number {
  let size = maxSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size = 10
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, size * 0.55);
  ctx.lineTo(-size, -size * 0.55);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fill();
  ctx.restore();
}

export async function renderIntersectionChart(
  canvas: HTMLCanvasElement,
  model: RenderModel,
  isStale: () => boolean = () => false
): Promise<void> {
  canvas.width = CHART_WIDTH;
  canvas.height = CHART_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const { axisLabels, points } = model;
  const sansFont = "system-ui, -apple-system, sans-serif";

  // --- Background ---
  ctx.fillStyle = "#050507";
  ctx.fillRect(0, 0, CHART_WIDTH, CHART_HEIGHT);

  const vignette = ctx.createRadialGradient(
    CHART_WIDTH / 2,
    CHART_HEIGHT * 0.4,
    100,
    CHART_WIDTH / 2,
    CHART_HEIGHT * 0.4,
    CHART_WIDTH * 0.9
  );
  vignette.addColorStop(0, "rgba(255,255,255,0.04)");
  vignette.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CHART_WIDTH, CHART_HEIGHT);

  // --- Chart square geometry ---
  const sideMargin = 230;
  const chartTop = 110;
  const chartSize = CHART_WIDTH - sideMargin * 2;
  const chartLeft = sideMargin;
  const centerX = chartLeft + chartSize / 2;
  const centerY = chartTop + chartSize / 2;
  const halfSize = chartSize / 2;

  // Axis lines
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(chartLeft, centerY);
  ctx.lineTo(chartLeft + chartSize, centerY);
  ctx.moveTo(centerX, chartTop);
  ctx.lineTo(centerX, chartTop + chartSize);
  ctx.stroke();

  drawArrowhead(ctx, chartLeft + chartSize, centerY, 0);
  drawArrowhead(ctx, chartLeft, centerY, Math.PI);
  drawArrowhead(ctx, centerX, chartTop, -Math.PI / 2);
  drawArrowhead(ctx, centerX, chartTop + chartSize, Math.PI / 2);

  // Origin pulse marker
  ctx.beginPath();
  ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  const originGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
  originGlow.addColorStop(0, "rgba(255,255,255,0.35)");
  originGlow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = originGlow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
  ctx.fill();

  // Axis labels — the four selected names, sized to always fit within the
  // margins so nothing gets clipped.
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  const sideMaxWidth = sideMargin - 44;

  ctx.textAlign = "left";
  fitFontSize(ctx, axisLabels.xRight, sideMaxWidth, { family: sansFont });
  ctx.fillText(axisLabels.xRight, chartLeft + chartSize + 24, centerY + 8);

  ctx.textAlign = "right";
  fitFontSize(ctx, axisLabels.xLeft, sideMaxWidth, { family: sansFont });
  ctx.fillText(axisLabels.xLeft, chartLeft - 24, centerY + 8);

  ctx.textAlign = "center";
  fitFontSize(ctx, axisLabels.yTop, chartSize * 0.9, { family: sansFont });
  ctx.fillText(axisLabels.yTop, centerX, chartTop - 34);

  fitFontSize(ctx, axisLabels.yBottom, chartSize * 0.9, { family: sansFont });
  ctx.fillText(axisLabels.yBottom, centerX, chartTop + chartSize + 56);

  // --- Stickers ---
  const stickerDiameter = chartSize * 0.18;
  for (const point of points) {
    if (isStale()) return;
    const px = centerX + point.x * halfSize * 0.82;
    const py = centerY - point.y * halfSize * 0.82;
    const accent = quadrantAccent(point.x, point.y);

    const halo = ctx.createRadialGradient(
      px,
      py,
      stickerDiameter * 0.15,
      px,
      py,
      stickerDiameter * 0.7
    );
    halo.addColorStop(0, `${accent}33`);
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(
      px - stickerDiameter,
      py - stickerDiameter,
      stickerDiameter * 2,
      stickerDiameter * 2
    );

    if (point.stickerDataUrl) {
      try {
        const img = await loadImage(point.stickerDataUrl);
        if (isStale()) return;
        ctx.drawImage(
          img,
          px - stickerDiameter / 2,
          py - stickerDiameter / 2,
          stickerDiameter,
          stickerDiameter
        );
      } catch {
        // ignore broken image, halo still renders
      }
    }
  }

  // --- Footer ---
  ctx.textAlign = "left";
  ctx.font = "500 22px 'Courier New', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText("INTERSECTIONS", chartLeft, CHART_HEIGHT - 70);
  ctx.textAlign = "right";
  ctx.fillText("MAP YOUR IDENTITY", chartLeft + chartSize, CHART_HEIGHT - 70);
}

export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename = "intersections.png") {
  const url = canvas.toDataURL("image/png", 1.0);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}
