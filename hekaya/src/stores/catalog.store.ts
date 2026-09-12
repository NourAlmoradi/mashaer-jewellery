"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import {
  fetchCategories,
  fetchCollections,
  fetchProducts,
  createProduct,
  updateProduct,
  setProductActive,
  createCollection,
  updateCollection,
  setCollectionSortOrder,
} from "@/lib/supabase/catalog";
import { deleteImagesByUrl } from "@/lib/supabase/storage";
import type { Category, Collection, Product } from "@/types";

type CatalogStatus = "idle" | "loading" | "ready" | "error";

type CatalogState = {
  collections: Collection[];
  categories: Category[];
  products: Product[];
  status: CatalogStatus;
  error: string | null;
  /** Fetch the catalog once from Supabase. Safe to call from many components. */
  load: () => Promise<void>;
  /** Force a re-fetch (e.g. after an admin write). */
  refresh: () => Promise<void>;
  /** Create or update a product in the database, then refresh. */
  saveProduct: (product: Product, isNew: boolean) => Promise<void>;
  /** Toggle a product's active flag in the database, then refresh. */
  setProductActive: (id: string, isActive: boolean) => Promise<void>;
  /** Create or update a collection in the database, then refresh. */
  saveCollection: (collection: Collection, isNew: boolean) => Promise<void>;
  /**
   * Persist a new order: `sort_order` becomes each id's index in `orderedIds`.
   * Renumbering, not swapping, so rows sharing a `sort_order` still move.
   */
  reorderCollections: (orderedIds: string[]) => Promise<void>;
  /** Permanently delete a product from the database. */
  deleteProduct: (id: string) => Promise<void>;
  /** Permanently delete a collection from the database. */
  deleteCollection: (id: string) => Promise<void>;
  /**
   * Delete a collection and its products in one transaction, so it can't be
   * left half-emptied. Returns the number of products removed.
   */
  deleteCollectionCascade: (id: string) => Promise<number>;
};

async function fetchAll() {
  const supabase = createClient();
  const [collections, categories, products] = await Promise.all([
    fetchCollections(supabase),
    fetchCategories(supabase),
    fetchProducts(supabase),
  ]);
  return { collections, categories, products };
}

export const useCatalogStore = create<CatalogState>()((set, get) => ({
  collections: [],
  categories: [],
  products: [],
  status: "idle",
  error: null,
  load: async () => {
    if (get().status === "loading" || get().status === "ready") return;
    set({ status: "loading", error: null });
    try {
      const { collections, categories, products } = await fetchAll();
      set({ collections, categories, products, status: "ready" });
    } catch (e) {
      set({ status: "error", error: (e as Error).message });
    }
  },
  refresh: async () => {
    try {
      const { collections, categories, products } = await fetchAll();
      set({ collections, categories, products, status: "ready", error: null });
    } catch (e) {
      set({ status: "error", error: (e as Error).message });
    }
  },
  saveProduct: async (product, isNew) => {
    const supabase = createClient();
    if (isNew) {
      await createProduct(supabase, product);
    } else {
      const old = get().products.find((p) => p.id === product.id);
      await updateProduct(supabase, product);
      // Clean up images that were removed during this edit (best-effort).
      if (old) {
        const removed = old.images.filter((u) => !product.images.includes(u));
        if (removed.length)
          void deleteImagesByUrl(supabase, removed).catch(() => {});
      }
    }
    await get().refresh();
  },
  setProductActive: async (id, isActive) => {
    await setProductActive(createClient(), id, isActive);
    await get().refresh();
  },
  saveCollection: async (collection, isNew) => {
    const supabase = createClient();
    if (isNew) await createCollection(supabase, collection);
    else await updateCollection(supabase, collection);
    await get().refresh();
  },
  reorderCollections: async (orderedIds) => {
    const supabase = createClient();
    const byId = new Map(get().collections.map((c) => [c.id, c]));
    const writes = orderedIds.flatMap((id, sortOrder) => {
      const current = byId.get(id);
      if (!current || current.sortOrder === sortOrder) return [];
      return [setCollectionSortOrder(supabase, id, sortOrder)];
    });
    if (writes.length === 0) return;
    // allSettled, not all: every write must finish before the refetch, or the
    // grid repaints from a read that raced an in-flight write.
    const results = await Promise.allSettled(writes);
    await get().refresh();
    const failed = results.find((r) => r.status === "rejected");
    if (failed) throw failed.reason;
  },
  deleteProduct: async (id) => {
    const supabase = createClient();
    const product = get().products.find((p) => p.id === id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    // Remove the product's images from the bucket so nothing is orphaned.
    if (product?.images?.length)
      void deleteImagesByUrl(supabase, product.images).catch(() => {});
    await get().refresh();
  },
  deleteCollection: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) throw error;
    await get().refresh();
  },
  deleteCollectionCascade: async (id) => {
    const supabase = createClient();
    const removed = get().products.filter((p) => p.collection === id).length;
    // One atomic RPC: either the collection and all its products go, or none do.
    const { data, error } = await supabase.rpc("delete_collection_cascade", {
      p_id: id,
    });
    if (error) throw error;
    // Sweep the deleted products' images out of the bucket. Best-effort: an
    // orphaned file is much cheaper than failing a completed delete.
    const images = (data as string[] | null) ?? [];
    if (images.length) void deleteImagesByUrl(supabase, images).catch(() => {});
    await get().refresh(); // exactly one refetch, not one per product
    return removed;
  },
}));

// Re-fetch on auth change: RLS returns inactive rows only to admins, so a
// cached public catalog would stay active-only after an admin signs in.
// setTimeout(0) defers past the auth lock — calling Supabase here deadlocks.
if (typeof window !== "undefined") {
  const supabase = createClient();
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
      setTimeout(() => void useCatalogStore.getState().refresh(), 0);
    }
  });
}
