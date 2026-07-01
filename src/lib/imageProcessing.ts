const STICKER_SIZE = 480;

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

/**
 * Turns an arbitrary uploaded photo into a soft-masked, sticker-style
 * cutout: a center-cropped square with a feathered circular edge and a
 * thin die-cut ring, ready to be dropped onto the chart canvas.
 */
export async function createStickerCutout(
  originalDataUrl: string,
  size = STICKER_SIZE
): Promise<string> {
  const img = await loadImage(originalDataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Cover-crop the source image into a centered square.
  const srcSize = Math.min(img.width, img.height);
  const srcX = (img.width - srcSize) / 2;
  const srcY = (img.height - srcSize) / 2;
  ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, size, size);

  // Slight punch so photos read well against a black background.
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "source-over";

  // Feathered circular soft-mask ("destination-in" keeps only what overlaps
  // the gradient's alpha, fading the photo out toward the edge).
  const center = size / 2;
  const innerRadius = size * 0.4;
  const outerRadius = size * 0.5;
  const gradient = ctx.createRadialGradient(
    center,
    center,
    innerRadius,
    center,
    center,
    outerRadius
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "source-over";

  // Die-cut sticker ring.
  ctx.beginPath();
  ctx.arc(center, center, size * 0.47, 0, Math.PI * 2);
  ctx.lineWidth = size * 0.014;
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.stroke();

  return canvas.toDataURL("image/png");
}

const PLACEHOLDER_PALETTES: [string, string][] = [
  ["#5ef1ff", "#3a6fe0"],
  ["#b47bff", "#6f3ad1"],
  ["#ff6b6b", "#d1364f"],
  ["#d4ff5e", "#7cbf2a"],
];

/** Generates a stylized initials sticker for demoing without a real photo. */
export function createPlaceholderSticker(
  name: string,
  seed = 0,
  size = STICKER_SIZE
): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const [from, to] = PLACEHOLDER_PALETTES[seed % PLACEHOLDER_PALETTES.length];
  const bgGradient = ctx.createLinearGradient(0, 0, size, size);
  bgGradient.addColorStop(0, from);
  bgGradient.addColorStop(1, to);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, size, size);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  ctx.fillStyle = "rgba(5,5,10,0.85)";
  ctx.font = `700 ${size * 0.34}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, size / 2, size / 2 + size * 0.02);

  const center = size / 2;
  const innerRadius = size * 0.4;
  const outerRadius = size * 0.5;
  const gradient = ctx.createRadialGradient(
    center,
    center,
    innerRadius,
    center,
    center,
    outerRadius
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
