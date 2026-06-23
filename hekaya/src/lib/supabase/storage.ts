import type { SupabaseClient } from "@supabase/supabase-js";

const PRODUCT_BUCKET = "product-images";

/**
 * Upload one prepared product image (a Blob from `prepareImage`) to the public
 * `product-images` bucket and return its permanent public URL. Admins are
 * allowed to write by the storage RLS policy. Keeping images in Storage — not
 * as base64 in Postgres — keeps catalog payloads small and CDN-cacheable.
 */
export async function uploadProductImage(
  supabase: SupabaseClient,
  blob: Blob,
): Promise<string> {
  const ext = blob.type === "image/png" ? "png" : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .upload(path, blob, {
      cacheControl: "3600",
      upsert: false,
      contentType: blob.type || "image/jpeg",
    });
  if (error) throw error;
  return supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Parse a Supabase public object URL into { bucket, path }. Returns null for
 * anything that isn't a storage URL (e.g. a legacy base64 data URL) so callers
 * can safely skip it.
 */
function parsePublicUrl(
  url: string,
): { bucket: string; path: string } | null {
  const marker = "/storage/v1/object/public/";
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const rest = url.slice(i + marker.length); // "<bucket>/<path...>"
  const slash = rest.indexOf("/");
  if (slash === -1) return null;
  return { bucket: rest.slice(0, slash), path: rest.slice(slash + 1) };
}

/**
 * Best-effort deletion of Storage objects by their public URLs (grouped per
 * bucket). Non-storage URLs and legacy data URLs are ignored. Caller decides
 * whether to await or fire-and-forget.
 */
export async function deleteImagesByUrl(
  supabase: SupabaseClient,
  urls: string[],
): Promise<void> {
  const byBucket = new Map<string, string[]>();
  for (const url of urls) {
    const parsed = parsePublicUrl(url);
    if (!parsed) continue;
    const arr = byBucket.get(parsed.bucket) ?? [];
    arr.push(parsed.path);
    byBucket.set(parsed.bucket, arr);
  }
  for (const [bucket, paths] of byBucket) {
    if (paths.length) await supabase.storage.from(bucket).remove(paths);
  }
}
