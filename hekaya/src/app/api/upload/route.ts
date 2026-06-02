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

/**
 * Naive in-memory rate limiter (per server instance). Good enough to blunt
 * accidental floods in dev / single-instance hosting. Replace with a shared
 * store (e.g. Upstash) once Supabase + real auth land.
 */
const RATE_LIMIT = 20; // requests
const RATE_WINDOW_MS = 60_000; // per minute
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

/** Reject cross-site POSTs (basic CSRF guard) by comparing Origin to Host. */
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser / same-origin fetches may omit it
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

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

  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Cross-origin denied" }, { status: 403 });
  }

  // TODO(Phase 2): replace with Supabase auth — gate to authenticated users.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many uploads, slow down." },
      { status: 429 },
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
