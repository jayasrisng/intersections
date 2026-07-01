import type { AxisLabels, QuadrantPlacement } from "@/lib/types";

export const CHART_WIDTH = 1600;
export const CHART_HEIGHT = 1500;

const ACCENTS: Record<"TL" | "TR" | "BL" | "BR", string> = {
  TL: "#5ef1ff",
  TR: "#b47bff",
  BL: "#d4ff5e",
  BR: "#ff6b6b",
};

interface RenderModel {
  axisLabels: AxisLabels;
  placements: QuadrantPlacement[];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
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

let cachedDisplayFont: string | null = null;

function getDisplayFontFamily(): string {
  if (cachedDisplayFont) return cachedDisplayFont;
  if (typeof document === "undefined") return "Georgia, serif";
  const probe = document.createElement("span");
  probe.className = "font-display";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily || "Georgia, serif";
  document.body.removeChild(probe);
  cachedDisplayFont = family;
  return family;
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
  photosByCategory: Record<string, string>,
  model: RenderModel,
  isStale: () => boolean = () => false
): Promise<void> {
  canvas.width = CHART_WIDTH;
  canvas.height = CHART_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const { axisLabels, placements } = model;
  const displayFont = getDisplayFontFamily();
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

  // Quadrant tint glows
  const quadrantCenters: Record<"TL" | "TR" | "BL" | "BR", [number, number]> = {
    TL: [centerX - halfSize / 2, centerY - halfSize / 2],
    TR: [centerX + halfSize / 2, centerY - halfSize / 2],
    BL: [centerX - halfSize / 2, centerY + halfSize / 2],
    BR: [centerX + halfSize / 2, centerY + halfSize / 2],
  };
  (Object.keys(quadrantCenters) as Array<"TL" | "TR" | "BL" | "BR">).forEach(
    (key) => {
      const [qx, qy] = quadrantCenters[key];
      const glow = ctx.createRadialGradient(qx, qy, 10, qx, qy, halfSize * 0.9);
      glow.addColorStop(0, `${ACCENTS[key]}14`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(chartLeft, chartTop, chartSize, chartSize);
    }
  );

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

  // Axis labels — the actual selected category names, sized to always fit
  // within the side/top/bottom margins so nothing gets clipped.
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

  // --- Photo stickers + captions ---
  const stickerDiameter = chartSize * 0.16;
  for (const placement of placements) {
    if (isStale()) return;
    const px = centerX + placement.x * halfSize * 0.86;
    const py = centerY - placement.y * halfSize * 0.86;
    const accent = ACCENTS[placement.quadrant];
    const photoSrc = photosByCategory[placement.category.id];

    // Soft quadrant-colored halo behind the sticker (the sticker itself
    // already carries its own die-cut white outline).
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

    if (photoSrc) {
      try {
        const img = await loadImage(photoSrc);
        if (isStale()) return;
        ctx.drawImage(
          img,
          px - stickerDiameter / 2,
          py - stickerDiameter / 2,
          stickerDiameter,
          stickerDiameter
        );
      } catch {
        // ignore broken image, halo + label still render
      }
    }

    // Name + caption, stacked outward from the sticker (away from center for
    // top-quadrant items, downward for bottom-quadrant ones) so text never
    // collides with the photo.
    const isTop = placement.y >= 0;
    const direction = isTop ? -1 : 1;
    const lineHeight = 26;
    const nameY = py + direction * (stickerDiameter / 2 + 34);

    ctx.font = `400 20px ${sansFont}`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    const captionLines = wrapText(ctx, placement.caption, stickerDiameter * 2.1).slice(0, 2);

    if (isTop) {
      // Draw furthest line first (smallest y), walking down toward the name.
      let y = nameY - lineHeight * captionLines.length;
      captionLines.forEach((line) => {
        ctx.fillText(line, px, y);
        y += lineHeight;
      });
    }

    ctx.font = `500 32px ${displayFont}`;
    ctx.fillStyle = "#f5f5f7";
    ctx.textAlign = "center";
    ctx.fillText(placement.category.name, px, nameY);

    if (!isTop) {
      ctx.font = `400 20px ${sansFont}`;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      let y = nameY + lineHeight;
      captionLines.forEach((line) => {
        ctx.fillText(line, px, y);
        y += lineHeight;
      });
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
