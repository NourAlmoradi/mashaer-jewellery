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
  /** Permanently delete a product from the database. */
  deleteProduct: (id: string) => Promise<void>;
  /** Permanently delete a collection from the database. */
  deleteCollection: (id: string) => Promise<void>;
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
}));

// Re-fetch the catalog when auth changes. Without this, an admin who signs in
// after the public (active-only) catalog already loaded would keep seeing the
// active-only list (RLS returns inactive rows only to admins). Signing out
// drops back to the public view.
if (typeof window !== "undefined") {
  const supabase = createClient();
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
      void useCatalogStore.getState().refresh();
    }
  });
}
