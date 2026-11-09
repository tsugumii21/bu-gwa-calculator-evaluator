import { ScanFailure, type ScanBox } from '../../types/scan';

export const SCAN_LIMITS = {
  images: 20, fileBytes: 10 * 1024 * 1024, batchBytes: 100 * 1024 * 1024,
  sourcePixels: 12_000_000, canvasPixels: 6_000_000, initializeMs: 30_000,
  imageMs: 45_000, batchMs: 180_000, cloudMs: 15_000,
} as const;

/** Explicit selection failures replace silent file truncation. */
export function validateSelection(existing: File[], incoming: File[]) {
  const accepted: File[] = [];
  const rejected: string[] = [];
  let bytes = existing.reduce((sum, file) => sum + file.size, 0);
  for (const file of incoming) {
    let reason = '';
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) reason = 'use PNG, JPG, or WebP';
    else if (file.size > SCAN_LIMITS.fileBytes) reason = 'maximum file size is 10 MiB';
    else if (existing.length + accepted.length >= SCAN_LIMITS.images) reason = 'maximum batch size is 20 images';
    else if (bytes + file.size > SCAN_LIMITS.batchBytes) reason = 'maximum combined file size is 100 MiB';
    if (reason) rejected.push(`${file.name}: ${reason}.`);
    else { accepted.push(file); bytes += file.size; }
  }
  return { accepted, rejected };
}

/** Detect a header and repeated table rules without fixed screenshot crop percentages. */
export function findTableGeometry(pixels: Uint8ClampedArray, width: number, height: number) {
  const edges: Array<{ y: number; left: number; right: number }> = [];
  const stride = Math.max(1, Math.floor(width / 500));
  for (let y = 1; y < height; y++) {
    let count = 0, left = width, right = 0;
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4, p = i - width * 4;
      if (Math.abs(pixels[i] - pixels[p]) + Math.abs(pixels[i + 1] - pixels[p + 1]) + Math.abs(pixels[i + 2] - pixels[p + 2]) < 12) continue;
      count++; left = Math.min(left, x); right = x;
    }
    if (count * stride < width * .55) continue;
    if (edges.length && y - edges[edges.length - 1].y <= 2) edges[edges.length - 1].y = y;
    else edges.push({ y, left, right });
  }
  let best: typeof edges = [];
  for (let start = 0; start < edges.length - 4; start++) {
    const gap = edges[start + 2].y - edges[start + 1].y;
    if (gap < 15 || gap > width * .12) continue;
    const group = [edges[start]];
    for (let j = start + 1; j < edges.length; j++) {
      const difference = edges[j].y - group[group.length - 1].y;
      if (difference < gap * .65 || difference > gap * 1.35) break;
      const edgeTolerance = Math.max(stride * 2, width * .01);
      if (Math.abs(edges[j].left - group[0].left) > edgeTolerance || Math.abs(edges[j].right - group[0].right) > edgeTolerance) break;
      group.push(edges[j]);
    }
    if (group.length > best.length) best = group;
  }
  if (best.length < 5) return null;
  const last = best[best.length - 1];
  const rowHeight = last.y - best[best.length - 2].y;
  const nextBottom = Math.min(height - 1, last.y + rowHeight);
  const sample = (Math.min(height - 1, last.y + 3) * width + Math.round((best[0].left + best[0].right) / 2)) * 4;
  const darkBackground = pixels[sample] + pixels[sample + 1] + pixels[sample + 2] < 384;
  let finalInk = 0;
  for (let y = last.y + Math.round(rowHeight * .2); y < last.y + rowHeight * .8 && y < height; y++) {
    for (let x = best[0].left; x < best[0].right; x += stride) {
      const i = (y * width + x) * 4;
      if (darkBackground ? Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) > 180 : Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) < 80) finalInk++;
    }
  }
  // Thin rules can disappear in a screenshot; visible text below the last rule must not be cropped away.
  if (finalInk > rowHeight * (best[0].right - best[0].left) / stride * .005) best.push({ ...last, y: nextBottom });
  const padding = Math.max(6, Math.round(width / 200));
  return { box: { x0: Math.max(0, best[0].left - padding), y0: Math.max(0, best[0].y - padding),
    x1: Math.min(width, best[0].right + padding), y1: Math.min(height, best[best.length - 1].y + padding) },
    rowEdges: best.slice(1).map(edge => edge.y) };
}

async function validateSignature(file: Blob) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (!(file.type === 'image/png' && png || file.type === 'image/jpeg' && jpeg || file.type === 'image/webp' && webp)) {
    throw new ScanFailure('invalid', 'The file contents do not match a supported image format.');
  }
}

/** Decodes and prepares only the active image; no selected image leaves the device. */
export async function prepareScanImage(file: Blob, crop?: ScanBox) {
  await validateSignature(file);
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > SCAN_LIMITS.sourcePixels) throw new ScanFailure('invalid', 'Image exceeds 12 megapixels. Crop or resize it first.');
    const probe = document.createElement('canvas');
    probe.width = bitmap.width; probe.height = bitmap.height;
    const context = probe.getContext('2d', { willReadFrequently: true });
    if (!context) throw new ScanFailure('recognition', 'Image processing is unavailable in this browser.');
    context.drawImage(bitmap, 0, 0);
    const geometry = findTableGeometry(context.getImageData(0, 0, probe.width, probe.height).data, probe.width, probe.height);
    const box = crop ?? geometry?.box ?? { x0: 0, y0: 0, x1: bitmap.width, y1: bitmap.height };
    const canvas = prepareCanvas(bitmap, box);
    probe.width = 0; probe.height = 0;
    const scale = canvas.width / (box.x1 - box.x0);
    return { canvas, box, scale, rowEdges: crop ? [] : (geometry?.rowEdges ?? []).map(y => (y - box.y0) * scale),
      coverageKnown: !!geometry && !crop };
  } finally { bitmap.close(); }
}

function prepareCanvas(image: ImageBitmap, box: ScanBox) {
  const width = Math.max(1, box.x1 - box.x0), height = Math.max(1, box.y1 - box.y0);
  // A modest first pass avoids magnifying browser chrome; small glyphs can be retried in a row crop.
  const scale = Math.min(2, Math.max(1, 2800 / width), Math.sqrt(SCAN_LIMITS.canvasPixels / (width * height)));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new ScanFailure('recognition', 'Could not prepare the image.');
  context.drawImage(image, box.x0, box.y0, width, height, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  normalizePolarity(imageData.data);
  context.putImageData(imageData, 0, 0);
  return canvas;
}

function normalizePolarity(data: Uint8ClampedArray) {
  let total = 0, count = 0;
  for (let i = 0; i < data.length; i += 64) { total += data[i] * .299 + data[i + 1] * .587 + data[i + 2] * .114; count++; }
  const dark = total / count < 128;
  for (let i = 0; i < data.length; i += 4) {
    let gray = data[i] * .299 + data[i + 1] * .587 + data[i + 2] * .114;
    if (dark) gray = 255 - gray;
    if (data[i + 1] > 80 && data[i + 1] > data[i] * 1.25 && data[i + 1] > data[i + 2] * 1.25) gray = 255;
    gray = Math.max(0, Math.min(255, (gray - 25) * 255 / 205));
    data[i] = gray; data[i + 1] = gray; data[i + 2] = gray; data[i + 3] = 255;
  }
}

/** Confirms an actual small ink component between two digit-sized components; never infers a decimal from the number alone. */
export function visibleDecimalInk(data: Uint8ClampedArray, width: number, height: number): boolean {
  const seen = new Uint8Array(width * height);
  const parts: Array<{ left: number; right: number; top: number; bottom: number; pixels: number }> = [];
  for (let i = 0; i < seen.length; i++) {
    if (seen[i] || data[i * 4] > 140) continue;
    const queue = [i], part = { left: width, right: 0, top: height, bottom: 0, pixels: 0 };
    seen[i] = 1;
    while (queue.length) {
      const position = queue.pop()!, x = position % width, y = Math.floor(position / width);
      part.left = Math.min(part.left, x); part.right = Math.max(part.right, x);
      part.top = Math.min(part.top, y); part.bottom = Math.max(part.bottom, y); part.pixels++;
      for (const next of [position - 1, position + 1, position - width, position + width]) {
        if (next < 0 || next >= seen.length || seen[next] || data[next * 4] > 140) continue;
        if (Math.abs(next % width - x) + Math.abs(Math.floor(next / width) - y) !== 1) continue;
        seen[next] = 1; queue.push(next);
      }
    }
    parts.push(part);
  }
  const glyphHeight = Math.max(0, ...parts.map(part => part.bottom - part.top + 1));
  const digits = parts.filter(part => part.bottom - part.top + 1 > glyphHeight * .65).sort((a, b) => a.left - b.left);
  if (digits.length !== 2 || glyphHeight < 8) return false;
  return parts.filter(part => part.pixels >= 3 && part.bottom - part.top + 1 <= glyphHeight * .35 && part.right - part.left + 1 <= glyphHeight * .35
    && part.left > digits[0].right && part.right < digits[1].left && part.top >= digits[0].top + glyphHeight * .55).length === 1;
}

/** Looks only inside the observed grade word; uncertain decimals remain unresolved. */
export function hasVisibleDecimal(canvas: HTMLCanvasElement, box: ScanBox): boolean {
  const left = Math.max(0, Math.floor(box.x0) - 2), top = Math.max(0, Math.floor(box.y0) - 2);
  const width = Math.min(canvas.width - left, Math.ceil(box.x1 - left) + 2);
  const height = Math.min(canvas.height - top, Math.ceil(box.y1 - top) + 2);
  if (width <= 0 || height <= 0 || width * height > 50_000) return false;
  const pixels = canvas.getContext('2d', { willReadFrequently: true })?.getImageData(left, top, width, height);
  return pixels ? visibleDecimalInk(pixels.data, width, height) : false;
}
