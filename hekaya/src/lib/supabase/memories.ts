import type { Db } from "@/lib/supabase/types";
import type { Database } from "@/lib/supabase/database.types";

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
 * What get_memory() returns: existence plus the linked product, never the
 * private title/message/photos.
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
  supabase: Db,
  token: string,
): Promise<MemoryMeta | null> {
  const { data, error } = await supabase.rpc("get_memory", { p_token: token });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as MetaRow | undefined;
  return row ? mapMeta(row) : null;
}

/**
 * A wrong or locked PIN comes back as DATA, not an exception: raising would
 * roll back the failed-attempt counter in the same RPC transaction. Real
 * transport errors still reject.
 */
export type UnlockResult =
  | { status: "ok"; memory: PublicMemory }
  | { status: "wrong"; attemptsLeft: number | null }
  | { status: "locked"; minutesLeft: number };

type UnlockRow = ContentRow & {
  status?: string;
  attempts_left?: number | null;
  minutes_left?: number | null;
};

/**
 * Unlock the private content with a PIN — the only PIN-gated read. Rejects
 * only on a real network error; tolerates an older RAISE-based deployment.
 */
export async function unlockMemory(
  supabase: Db,
  token: string,
  pin: string,
): Promise<UnlockResult> {
  const { data, error } = await supabase.rpc("unlock_memory", {
    p_token: token,
    p_pin: pin,
  });
  if (error) {
    // Legacy function: it raises instead of returning a status row.
    const msg = error.message ?? "";
    if (/PIN_LOCKED|too many/i.test(msg)) {
      const m = /PIN_LOCKED:(\d+)/.exec(msg)?.[1];
      return { status: "locked", minutesLeft: m ? Number(m) : 15 };
    }
    if (/PIN_WRONG|wrong pin/i.test(msg)) {
      const n = /PIN_WRONG:(\d+)/.exec(msg)?.[1];
      return { status: "wrong", attemptsLeft: n ? Number(n) : null };
    }
    throw error; // genuine transport / unexpected failure
  }
  const row = (Array.isArray(data) ? data[0] : data) as UnlockRow | undefined;
  if (!row) return { status: "wrong", attemptsLeft: null };
  if (row.status === "locked") {
    return { status: "locked", minutesLeft: row.minutes_left ?? 15 };
  }
  if (row.status === "wrong") {
    return { status: "wrong", attemptsLeft: row.attempts_left ?? null };
  }
  // status 'ok', or a legacy row that returned content with no status column.
  return { status: "ok", memory: mapContent(row) };
}

/**
 * Direct read of the full memory, which RLS allows only the owner or an admin.
 * Null means "not allowed", and the caller falls back to the PIN prompt.
 */
export async function fetchMemoryByToken(
  supabase: Db,
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

/** Reports failure as DATA, for the same reason as {@link UnlockResult}. */
export type SaveResult =
  | { status: "ok" }
  /** The caller isn't the buyer or an admin. A PIN cannot lift this. */
  | { status: "forbidden" }
  | { status: "wrong"; attemptsLeft: number | null }
  | { status: "locked"; minutesLeft: number };

type SaveRow = {
  status?: string;
  attempts_left?: number | null;
  minutes_left?: number | null;
};

/** Create or update a memory. PIN is required for first setup and for edits. */
export async function saveMemory(
  supabase: Db,
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
): Promise<SaveResult> {
  // The generator emits every RPC argument as non-nullable, but save_memory
  // derives p_order_id / p_product_id / p_product_label from NULL and takes a
  // null p_pin for an owner edit. The cast works around that, not a constraint.
  const args = {
    p_token: input.token,
    p_order_id: input.orderId ?? null,
    p_product_id: input.productId ?? null,
    p_product_label: input.productLabel ?? null,
    p_pin: input.pin ?? null,
    p_title: input.title,
    p_message: input.message,
    p_photos: input.photos,
  } as unknown as Database["public"]["Functions"]["save_memory"]["Args"];

  const { data, error } = await supabase.rpc("save_memory", args);

  if (error) {
    // Legacy deployment: save_memory still raises 'Wrong PIN' and returns void.
    // Treat it as a wrong PIN with an unknown remaining-attempt count so the UI
    // keeps working before migration 0006 has been applied.
    if (/wrong pin/i.test(error.message ?? "")) {
      return { status: "wrong", attemptsLeft: null };
    }
    if (/too many wrong attempts/i.test(error.message ?? "")) {
      return { status: "locked", minutesLeft: 15 };
    }
    throw error; // unknown token, missing PIN, transport failure
  }

  const row = (Array.isArray(data) ? data[0] : data) as SaveRow | undefined;
  // A legacy `returns void` function yields no row — that means it succeeded,
  // since any failure would have raised.
  if (!row?.status || row.status === "ok") return { status: "ok" };
  if (row.status === "forbidden") return { status: "forbidden" };
  if (row.status === "locked") {
    return { status: "locked", minutesLeft: row.minutes_left ?? 15 };
  }
  return { status: "wrong", attemptsLeft: row.attempts_left ?? null };
}

/**
 * May the caller edit this token's memory? Buyer or admin only; a PIN holder
 * gets a read-only page. Drives the UI — `save_memory` re-checks server-side.
 * Throws on a failed read: the caller must treat that as unknown, not "no".
 */
export async function canManageMemory(
  supabase: Db,
  token: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .contains("qr_tokens", [token])
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/**
 * The memories on `userId`'s own orders. The owner filter is in the query, not
 * left to RLS, whose `is_admin() OR …` policy would hand an admin every row.
 */
export async function fetchMyMemories(
  supabase: Db,
  userId: string,
): Promise<PublicMemory[]> {
  const { data, error } = await supabase
    .from("memories")
    .select(
      "token, order_id, product_id, product_label, title, message, photos, created_at, updated_at, orders!inner(user_id)",
    )
    .eq("orders.user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as ContentRow[]).map(mapContent);
}

/**
 * Every memory in the shop, for the admin dashboards. No owner filter, so it
 * must never back a "yours" view — use {@link fetchMyMemories} there.
 */
export async function fetchAllMemories(supabase: Db): Promise<PublicMemory[]> {
  const { data, error } = await supabase
    .from("memories")
    .select(
      "token, order_id, product_id, product_label, title, message, photos, created_at, updated_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ContentRow[]).map(mapContent);
}

/** Admin-only: reset a memory's PIN without knowing the old one. */
export async function adminResetMemoryPin(
  supabase: Db,
  token: string,
  pin: string,
): Promise<void> {
  const { error } = await supabase.rpc("admin_reset_memory_pin", {
    p_token: token,
    p_pin: pin,
  });
  if (error) throw error;
}

/**
 * Admin-only: delete the row and every file under `memory-photos/<token>/`.
 * Goes through a server route — the bucket has no client delete policy.
 */
export async function adminDeleteMemory(token: string): Promise<void> {
  const res = await fetch("/api/admin/memory/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const { error } = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(error || "Failed to delete memory");
  }
}

/**
 * Admin-only: delete every photo no saved memory references. Returns the
 * scanned and removed counts. Server route — sweeping needs the service role.
 */
export async function cleanOrphanMemoryPhotos(): Promise<{
  scanned: number;
  removed: number;
}> {
  const res = await fetch("/api/admin/memory/orphans", { method: "POST" });
  if (!res.ok) {
    const { error } = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(error || "Failed to clean orphan photos");
  }
  return (await res.json()) as { scanned: number; removed: number };
}
