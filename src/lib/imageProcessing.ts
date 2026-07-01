import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { removeBackground } from "@imgly/background-removal";
import { getCategoryIcon } from "@/lib/data/categoryIcons";

const STICKER_SIZE = 640;

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function createCanvas(size: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  return { canvas, ctx };
}

/** Finds the bounding box of non-transparent pixels in a canvas. */
function getAlphaBoundingBox(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { x: number; y: number; w: number; h: number } | null {
  const { data } = ctx.getImageData(0, 0, width, height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  const alphaThreshold = 12;
  const step = 2; // sample every other pixel for speed on large photos
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) return null;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Builds a solid-white silhouette of `source`'s visible pixels. */
function buildSilhouette(
  source: HTMLCanvasElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1);
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(source, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  return canvas;
}

/**
 * Composites a background-removed cutout onto a square canvas: trims the
 * transparent padding down to the subject's silhouette, then stamps a
 * dilated white halo behind it to fake a die-cut sticker outline (the
 * classic "stamp the silhouette at N angles" trick).
 */
function compositeSticker(img: HTMLImageElement, size: number): string {
  const { canvas: full, ctx: fullCtx } = createCanvas(1);
  full.width = img.naturalWidth || img.width;
  full.height = img.naturalHeight || img.height;
  fullCtx.drawImage(img, 0, 0);

  const bbox = getAlphaBoundingBox(fullCtx, full.width, full.height);

  const { canvas, ctx } = createCanvas(size);

  if (!bbox) {
    // Nothing detected — just contain-fit the raw image, no outline.
    const scale = Math.min(size / full.width, size / full.height);
    const dw = full.width * scale;
    const dh = full.height * scale;
    ctx.drawImage(full, (size - dw) / 2, (size - dh) / 2, dw, dh);
    return canvas.toDataURL("image/png");
  }

  const pad = Math.round(Math.max(bbox.w, bbox.h) * 0.05);
  const sx = Math.max(0, bbox.x - pad);
  const sy = Math.max(0, bbox.y - pad);
  const sw = Math.min(full.width - sx, bbox.w + pad * 2);
  const sh = Math.min(full.height - sy, bbox.h + pad * 2);

  const { canvas: crop, ctx: cropCtx } = createCanvas(1);
  crop.width = sw;
  crop.height = sh;
  cropCtx.drawImage(full, sx, sy, sw, sh, 0, 0, sw, sh);

  const scale = (size * 0.78) / Math.max(sw, sh);
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;

  const silhouette = buildSilhouette(crop, sw, sh);

  const outlineWidth = size * 0.02;
  const steps = 28;
  ctx.save();
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const ox = Math.cos(angle) * outlineWidth;
    const oy = Math.sin(angle) * outlineWidth;
    ctx.drawImage(silhouette, dx + ox, dy + oy, dw, dh);
  }
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = size * 0.025;
  ctx.shadowOffsetY = size * 0.012;
  ctx.drawImage(crop, dx, dy, dw, dh);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

/** Feathered circular crop, used when background removal isn't available. */
function createCircularFallback(img: HTMLImageElement, size: number): string {
  const { canvas, ctx } = createCanvas(size);

  const srcSize = Math.min(img.width, img.height);
  const srcX = (img.width - srcSize) / 2;
  const srcY = (img.height - srcSize) / 2;
  ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, size, size);

  const center = size / 2;
  const gradient = ctx.createRadialGradient(
    center,
    center,
    size * 0.4,
    center,
    center,
    size * 0.5
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "source-over";

  ctx.beginPath();
  ctx.arc(center, center, size * 0.47, 0, Math.PI * 2);
  ctx.lineWidth = size * 0.014;
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.stroke();

  return canvas.toDataURL("image/png");
}

/**
 * Turns an uploaded photo into a sticker-style cutout: removes the
 * background client-side (WASM, no server involved) and stamps a die-cut
 * white outline around the person's actual silhouette. Falls back to a
 * soft circular crop if background removal can't run in this browser.
 */
export async function createStickerCutout(
  originalDataUrl: string,
  size = STICKER_SIZE
): Promise<string> {
  try {
    const blob = await removeBackground(originalDataUrl, {
      model: "isnet_quint8",
      output: { format: "image/png" },
    });
    const objectUrl = URL.createObjectURL(blob);
    try {
      const cutoutImg = await loadImage(objectUrl);
      return compositeSticker(cutoutImg, size);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    const img = await loadImage(originalDataUrl);
    return createCircularFallback(img, size);
  }
}

const PLACEHOLDER_PALETTES: [string, string][] = [
  ["#5ef1ff", "#3a6fe0"],
  ["#b47bff", "#6f3ad1"],
  ["#ff6b6b", "#d1364f"],
  ["#d4ff5e", "#7cbf2a"],
];

function blobPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  seed: number
) {
  const points = 9;
  const radii = Array.from({ length: points }, (_, i) => {
    const n = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    const rand = n - Math.floor(n);
    return baseRadius * (0.82 + rand * 0.28);
  });
  const pts = radii.map((r, i) => {
    const a = (i / points) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  });
  const mid = (a: readonly [number, number], b: readonly [number, number]) =>
    [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const;

  ctx.beginPath();
  const start = mid(pts[points - 1], pts[0]);
  ctx.moveTo(start[0], start[1]);
  for (let i = 0; i < points; i++) {
    const next = pts[(i + 1) % points];
    const m = mid(pts[i], next);
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
  }
  ctx.closePath();
}

async function loadIconImage(
  categoryId: string,
  color: string,
  size: number
): Promise<HTMLImageElement> {
  const Icon = getCategoryIcon(categoryId);
  const markup = renderToStaticMarkup(
    createElement(Icon, { color, strokeWidth: 1.6, size, absoluteStrokeWidth: true })
  );
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(markup)}`;
  return loadImage(svgDataUrl);
}

/**
 * Generates a sticker for someone who skips the photo step: an organic
 * blob in a gradient unique to this quadrant, with a white die-cut outline
 * and a glyph representing the category itself (not a generic initial).
 */
export async function createPlaceholderSticker(
  categoryId: string,
  seed = 0,
  size = STICKER_SIZE
): Promise<string> {
  const { canvas, ctx } = createCanvas(size);
  const center = size / 2;
  const baseRadius = size * 0.36;

  // Outline: the same blob path, slightly larger, filled white first.
  blobPath(ctx, center, center, baseRadius * 1.09, seed);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fill();

  // The blob itself, gradient-filled.
  const [from, to] = PLACEHOLDER_PALETTES[seed % PLACEHOLDER_PALETTES.length];
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, from);
  gradient.addColorStop(1, to);
  blobPath(ctx, center, center, baseRadius, seed);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = size * 0.02;
  ctx.shadowOffsetY = size * 0.01;
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  try {
    const iconSize = size * 0.4;
    const iconImg = await loadIconImage(categoryId, "#0b0b0f", iconSize);
    ctx.drawImage(iconImg, center - iconSize / 2, center - iconSize / 2, iconSize, iconSize);
  } catch {
    // If icon rendering fails for any reason, the colored blob still stands alone.
  }

  return canvas.toDataURL("image/png");
}
