import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteImagesByUrl } from "@/lib/supabase/storage";

/** A memory with its private content — never includes the PIN hash. */
export type PublicMemory = {
  token: string;
  orderId: string | null;
  productId: string | null;
  productLabel: string | null;
  title: string;
  message: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
};

/**
 * The public "does a memory exist?" shape returned by get_memory(). It carries
 * the linked product (catalog data) but NOT the private title/message/photos —
 * those only come back from unlockMemory() after a correct PIN, or from a
 * direct table read by the order owner / admin (RLS).
 */
export type MemoryMeta = Omit<PublicMemory, "title" | "message" | "photos">;

type ContentRow = {
  token: string;
  order_id: string | null;
  product_id: string | null;
  product_label: string | null;
  title: string;
  message: string;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
};

type MetaRow = Omit<ContentRow, "title" | "message" | "photos">;

function mapContent(row: ContentRow): PublicMemory {
  return {
    token: row.token,
    orderId: row.order_id,
    productId: row.product_id,
    productLabel: row.product_label,
    title: row.title,
    message: row.message,
    photos: row.photos ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMeta(row: MetaRow): MemoryMeta {
  return {
    token: row.token,
    orderId: row.order_id,
    productId: row.product_id,
    productLabel: row.product_label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Does a memory exist for this token? Returns linked product, never content. */
export async function getMemoryMeta(
  supabase: SupabaseClient,
  token: string,
): Promise<MemoryMeta | null> {
  const { data, error } = await supabase.rpc("get_memory", { p_token: token });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as MetaRow | undefined;
  return row ? mapMeta(row) : null;
}

/**
 * Unlock the private content with a PIN (the only PIN-gated read). Throws
 * "Wrong PIN" on a bad PIN and "Too many wrong attempts…" once locked.
 */
export async function unlockMemory(
  supabase: SupabaseClient,
  token: string,
  pin: string,
): Promise<PublicMemory | null> {
  const { data, error } = await supabase.rpc("unlock_memory", {
    p_token: token,
    p_pin: pin,
  });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as ContentRow | undefined;
  return row ? mapContent(row) : null;
}

/**
 * Direct table read of the full memory — succeeds only for the order owner or
 * an admin (RLS). Used to skip the PIN gate for the person who owns the order.
 * Returns null when the caller isn't allowed (so the PIN prompt is shown).
 */
export async function fetchMemoryByToken(
  supabase: SupabaseClient,
  token: string,
): Promise<PublicMemory | null> {
  const { data } = await supabase
    .from("memories")
    .select(
      "token, order_id, product_id, product_label, title, message, photos, created_at, updated_at",
    )
    .eq("token", token)
    .maybeSingle();
  return data ? mapContent(data as ContentRow) : null;
}

/** Create or update a memory. PIN is required for first setup and for edits. */
export async function saveMemory(
  supabase: SupabaseClient,
  input: {
    token: string;
    pin?: string;
    title: string;
    message: string;
    photos: string[];
    orderId?: string | null;
    productId?: string | null;
    productLabel?: string | null;
  },
): Promise<void> {
  const { error } = await supabase.rpc("save_memory", {
    p_token: input.token,
    p_order_id: input.orderId ?? null,
    p_product_id: input.productId ?? null,
    p_product_label: input.productLabel ?? null,
    p_pin: input.pin ?? null,
    p_title: input.title,
    p_message: input.message,
    p_photos: input.photos,
  });
  if (error) throw error;
}

/** All memories belonging to the signed-in user's orders (RLS-scoped). */
export async function fetchMyMemories(
  supabase: SupabaseClient,
): Promise<PublicMemory[]> {
  const { data, error } = await supabase
    .from("memories")
    .select(
      "token, order_id, product_id, product_label, title, message, photos, created_at, updated_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ContentRow[]).map(mapContent);
}

/** All memories (admin only — RLS returns every row for admins). */
export async function fetchAllMemories(
  supabase: SupabaseClient,
): Promise<PublicMemory[]> {
  return fetchMyMemories(supabase);
}

/** Admin-only: reset a memory's PIN without knowing the old one. */
export async function adminResetMemoryPin(
  supabase: SupabaseClient,
  token: string,
  pin: string,
): Promise<void> {
  const { error } = await supabase.rpc("admin_reset_memory_pin", {
    p_token: token,
    p_pin: pin,
  });
  if (error) throw error;
}

/** Admin-only: delete a memory by token (and its photos from the bucket). */
export async function adminDeleteMemory(
  supabase: SupabaseClient,
  token: string,
): Promise<void> {
  // Read the photos first so we can clean the bucket after the row is gone.
  const existing = await fetchMemoryByToken(supabase, token).catch(() => null);
  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("token", token);
  if (error) throw error;
  if (existing?.photos?.length)
    void deleteImagesByUrl(supabase, existing.photos).catch(() => {});
}
