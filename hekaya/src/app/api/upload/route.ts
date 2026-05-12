import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

/**
 * DEV-ONLY image upload stub.
 *
 * Accepts a single `file` field (multipart/form-data), writes it to
 * `public/uploads/<random>.<ext>` and returns the public URL.
 *
 * Restrictions:
 *  - 5 MB max
 *  - jpeg / png / webp only
 *  - works only when the filesystem is writable (i.e. local dev or a
 *    self-hosted Node deployment). Returns 503 on Vercel/serverless.
 *
 * Production target: replace with Supabase Storage or S3.
 */

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Refuse on read-only filesystems (most serverless runtimes).
  if (process.env.VERCEL || process.env.NEXT_RUNTIME === "edge") {
    return NextResponse.json(
      {
        error:
          "Upload stub is dev-only. On Vercel, switch to Supabase Storage.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing `file` field" },
      { status: 400 },
    );
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type: ${file.type}` },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES} bytes)` },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = EXT[file.type];
  const safeName = `${Date.now()}_${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), buffer);

  return NextResponse.json({
    url: `/uploads/${safeName}`,
    bytes: buffer.byteLength,
    type: file.type,
  });
}
