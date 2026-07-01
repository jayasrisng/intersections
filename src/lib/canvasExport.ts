import type { AxisLabels, QuadrantPlacement } from "@/lib/types";

export const CHART_WIDTH = 1600;
export const CHART_HEIGHT = 2000;

const ACCENTS: Record<"TL" | "TR" | "BL" | "BR", string> = {
  TL: "#5ef1ff",
  TR: "#b47bff",
  BL: "#d4ff5e",
  BR: "#ff6b6b",
};

interface RenderModel {
  identityStatement: string;
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

  const { identityStatement, axisLabels, placements } = model;
  const displayFont = getDisplayFontFamily();

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

  // --- Header ---
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "500 22px 'Courier New', monospace";
  ctx.save();
  ctx.letterSpacing = "6px";
  ctx.fillText("IDENTITY INTERSECTION", CHART_WIDTH / 2, 108);
  ctx.restore();

  ctx.fillStyle = "#f5f5f7";
  ctx.font = `500 58px ${displayFont}`;
  const titleLines = wrapText(ctx, identityStatement, CHART_WIDTH * 0.82);
  let titleY = 200;
  for (const line of titleLines) {
    ctx.fillText(line, CHART_WIDTH / 2, titleY);
    titleY += 66;
  }

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "400 23px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    "Four identities. One shape. This is where they meet.",
    CHART_WIDTH / 2,
    titleY + 18
  );

  // --- Chart square geometry ---
  const chartTop = titleY + 90;
  const chartSize = CHART_WIDTH - 320;
  const chartLeft = (CHART_WIDTH - chartSize) / 2;
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

  // Axis labels
  ctx.font = "500 24px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.textAlign = "left";
  ctx.fillText(axisLabels.xRight.toUpperCase(), chartLeft + chartSize + 24, centerY + 8);
  ctx.textAlign = "right";
  ctx.fillText(axisLabels.xLeft.toUpperCase(), chartLeft - 24, centerY + 8);
  ctx.textAlign = "center";
  ctx.fillText(axisLabels.yTop.toUpperCase(), centerX, chartTop - 34);
  ctx.fillText(axisLabels.yBottom.toUpperCase(), centerX, chartTop + chartSize + 56);

  // --- Photo stickers + captions ---
  const stickerDiameter = chartSize * 0.16;
  for (const placement of placements) {
    if (isStale()) return;
    const px = centerX + placement.x * halfSize * 0.86;
    const py = centerY - placement.y * halfSize * 0.86;
    const accent = ACCENTS[placement.quadrant];
    const photoSrc = photosByCategory[placement.category.id];

    // Accent ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, stickerDiameter / 2 + 5, 0, Math.PI * 2);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    if (photoSrc) {
      try {
        const img = await loadImage(photoSrc);
        if (isStale()) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, stickerDiameter / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          img,
          px - stickerDiameter / 2,
          py - stickerDiameter / 2,
          stickerDiameter,
          stickerDiameter
        );
        ctx.restore();
      } catch {
        // ignore broken image, ring + label still render
      }
    }

    // Name + caption, stacked outward from the sticker (away from center for
    // top-quadrant items, downward for bottom-quadrant ones) so text never
    // collides with the photo.
    const isTop = placement.y >= 0;
    const direction = isTop ? -1 : 1;
    const lineHeight = 26;
    const nameY = py + direction * (stickerDiameter / 2 + 34);

    ctx.font = "400 20px system-ui, -apple-system, sans-serif";
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
      ctx.font = "400 20px system-ui, -apple-system, sans-serif";
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
