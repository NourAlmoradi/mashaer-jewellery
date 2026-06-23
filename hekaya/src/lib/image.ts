/**
 * Client-side image preparation for uploads. Validates the file is an image and
 * within a sane size, then downscales the longest edge to `maxDim` and re-encodes
 * as high-quality JPEG. Quality is preserved as much as possible: if the image is
 * already within `maxDim` and already a JPEG, the original bytes are kept (no
 * re-encode at all). Only oversized images are touched.
 */

export type PrepareImageOptions = {
  /** Cap for the longest edge in pixels. Images larger than this are downscaled. */
  maxDim?: number;
  /** JPEG quality 0..1 used when (re-)encoding. */
  quality?: number;
  /** Reject inputs larger than this many bytes before any work. */
  maxInputBytes?: number;
};

/** Distinguishable validation failure so callers can show a precise message. */
export class ImageError extends Error {
  constructor(public code: "not-image" | "too-large" | "decode" | "encode") {
    super(code);
    this.name = "ImageError";
  }
}

const DEFAULT_MAX_INPUT = 12 * 1024 * 1024; // 12 MB — phone photos are often 5–10 MB

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new ImageError("decode"));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new ImageError("decode"));
    img.src = src;
  });
}

/** Prepare a picked file for upload. Returns a Blob ready to send to Storage. */
export async function prepareImage(
  file: File,
  opts: PrepareImageOptions = {},
): Promise<Blob> {
  const {
    maxDim = 1600,
    quality = 0.92,
    maxInputBytes = DEFAULT_MAX_INPUT,
  } = opts;

  if (!file.type.startsWith("image/")) throw new ImageError("not-image");
  if (file.size > maxInputBytes) throw new ImageError("too-large");

  const img = await loadImage(await readAsDataUrl(file));
  const longest = Math.max(img.width, img.height);
  const scale = Math.min(1, maxDim / longest);

  // Already small enough and already a JPEG → keep the original bytes untouched
  // so there is zero additional quality loss.
  if (scale === 1 && (file.type === "image/jpeg" || file.type === "image/jpg")) {
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageError("encode");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/jpeg", quality),
  );
  if (!blob) throw new ImageError("encode");
  return blob;
}

/** Same as prepareImage but returns a data URL (for JSON upload endpoints). */
export async function prepareImageDataUrl(
  file: File,
  opts: PrepareImageOptions = {},
): Promise<string> {
  const blob = await prepareImage(file, opts);
  return readAsDataUrl(blob);
}
