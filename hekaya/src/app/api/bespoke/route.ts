import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createHash } from "node:crypto";
import { sendBespokeAlert } from "@/lib/email/sendBespokeAlert";
import { clientIp, rateLimited } from "@/lib/rateLimit";
import { BESPOKE_BUCKET, MAX_REFERENCE_BYTES, MAX_REFERENCES, validateBespokeBrief, requestReference, isBespokeId, parseBespokeBrief, type StoredBespokeBrief } from "@/lib/bespoke";

export const runtime = "nodejs";
const noStore = { "Cache-Control": "no-store" };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: noStore });

function imageType(bytes: Buffer): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) return fail("forbidden", 403);
  if (rateLimited("bespoke", clientIp(req), { limit: 5, windowMs: 10 * 60 * 1000 })) return fail("rate_limited", 429);
  if (Number(req.headers.get("content-length")) > 4 * 1024 * 1024) return fail("too_large", 413);
  let form: FormData;
  try {
    const reader = req.body?.getReader();
    if (!reader) return fail("invalid", 400);
    const chunks: Buffer[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4 * 1024 * 1024) { await reader.cancel(); return fail("too_large", 413); }
      chunks.push(Buffer.from(value));
    }
    form = await new Response(Buffer.concat(chunks), { headers: { "Content-Type": req.headers.get("content-type") || "" } }).formData();
  } catch { return fail("invalid", 400); }
  // Honeypot: deliberately do not claim a persisted request for bots.
  if (form.get("website")) return fail("invalid", 400);
  let input: unknown;
  try { input = JSON.parse(String(form.get("brief"))); } catch { return fail("invalid", 400); }
  const brief = validateBespokeBrief(input);
  if (!brief || form.get("consent") !== "true") return fail("invalid", 400);
  const id = String(form.get("requestKey") || "");
  if (!isBespokeId(id)) return fail("invalid", 400);
  const files = form.getAll("references");
  if (files.length > MAX_REFERENCES) return fail("too_many_images", 400);
  const images: { bytes: Buffer; type: string }[] = [];
  for (const file of files) {
    if (!(file instanceof File) || !file.size || file.size > MAX_REFERENCE_BYTES) return fail("bad_image", 400);
    const bytes = Buffer.from(await file.arrayBuffer());
    const type = imageType(bytes);
    if (!type || type !== file.type) return fail("bad_image", 400);
    images.push({ bytes, type });
  }
  const fingerprint = createHash("sha256").update(JSON.stringify(brief)).update(images.map((image) => createHash("sha256").update(image.bytes).digest("hex")).join(":")).digest("hex");
  const { data: existing, error: existingError } = await supabaseAdmin.from("contact_messages").select("message").eq("id", id).maybeSingle();
  if (existingError) return fail("send_failed", 502);
  if (existing) {
    if (parseBespokeBrief(existing.message)?.fingerprint !== fingerprint) return fail("request_conflict", 409);
    return NextResponse.json({ ok: true, reference: requestReference(id) }, { headers: noStore });
  }
  const paths: string[] = [];
  let stored: StoredBespokeBrief;
  try {
    if (images.length) {
      const { data: bucket, error: lookupError } = await supabaseAdmin.storage.getBucket(BESPOKE_BUCKET);
      if (bucket?.public) return fail("storage_unavailable", 503);
      if (!bucket) {
        if (lookupError && !/not found/i.test(lookupError.message)) return fail("storage_unavailable", 503);
        const { error } = await supabaseAdmin.storage.createBucket(BESPOKE_BUCKET, {
          public: false, fileSizeLimit: MAX_REFERENCE_BYTES, allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        });
        // A concurrent request may have created the bucket. Verify privacy again.
        if (error) {
          const { data: created } = await supabaseAdmin.storage.getBucket(BESPOKE_BUCKET);
          if (!created || created.public) return fail("storage_unavailable", 503);
        }
      }
      for (const image of images) {
        const ext = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
        const path = `${id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabaseAdmin.storage.from(BESPOKE_BUCKET).upload(path, image.bytes, { contentType: image.type, upsert: false });
        if (error) throw new Error("upload_failed");
        paths.push(path);
      }
    }
    stored = { ...brief, source: "mashaer-bespoke-v1", references: paths, status: "new", fingerprint, notificationStatus: "pending", consentAt: new Date().toISOString() };
    const message = JSON.stringify(stored);
    if (message.length > 2000) throw new Error("brief_too_large");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      // The legacy inbox requires a nonempty reply identifier in `email`.
      // WhatsApp-only enquiries use their real phone here. Email sending and
      // the custom inbox always use brief.email, never this legacy column.
      id, name: brief.name, email: brief.email || brief.phone, topic: "custom", locale: brief.locale, message, user_id: null,
    });
    if (error?.code === "23505") {
      if (paths.length) await supabaseAdmin.storage.from(BESPOKE_BUCKET).remove(paths);
      const { data } = await supabaseAdmin.from("contact_messages").select("message").eq("id", id).maybeSingle();
      if (data && parseBespokeBrief(data.message)?.fingerprint === fingerprint) return NextResponse.json({ ok: true, reference: requestReference(id) }, { headers: noStore });
      return fail("request_conflict", 409);
    }
    if (error) throw new Error("store_failed");
  } catch {
    if (paths.length) await supabaseAdmin.storage.from(BESPOKE_BUCKET).remove(paths);
    return fail("send_failed", 502);
  }
  // Persist first. A notification failure must never discard a customer's brief.
  try {
    const notified = await sendBespokeAlert(id, stored, new URL(req.url).origin);
    await supabaseAdmin.from("contact_messages").update({ message: JSON.stringify({ ...stored, notificationStatus: notified ? "sent" : "failed" }) }).eq("id", id).eq("message", JSON.stringify(stored));
  } catch {
    // The request is already durable. The owner can retry its notification.
  }
  return NextResponse.json({ ok: true, reference: requestReference(id) }, { headers: noStore });
}
