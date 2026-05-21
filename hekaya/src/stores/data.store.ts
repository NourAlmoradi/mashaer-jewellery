"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Collection, Memory, Order, Product } from "@/types";

type DataState = {
  orders: Order[];
  memories: Record<string, Memory>; // by token
  collections: Collection[];
  hiddenProductIds: string[];
  productOverrides: Record<string, Partial<Product>>;
  customProducts: Product[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  upsertOrders: (orders: Order[]) => void;
  saveMemory: (memory: Memory) => void;
  getMemory: (token: string) => Memory | undefined;
  resetMemoryPin: (token: string, newPin: string) => void;
  deleteMemory: (token: string) => void;
  // Collections CRUD
  seedCollections: (initial: Collection[]) => void;
  addCollection: (c: Collection) => void;
  updateCollection: (id: string, patch: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  cascadeDeleteCollection: (id: string, productIds: string[]) => void;
  reorderCollections: (ids: string[]) => void;
  // Hidden products (used to mask static products that have been removed)
  hideProducts: (ids: string[]) => void;
  unhideProduct: (id: string) => void;
  // Product CRUD overlay (seed products are immutable; overrides + customs persist edits)
  upsertProduct: (p: Product, isSeed: boolean) => void;
  removeProduct: (id: string, isSeed: boolean) => void;
  toggleProductActive: (id: string, isSeed: boolean, current: boolean) => void;
};

/** Keep only the 30 most-recent orders to avoid unbounded localStorage growth. */
const MAX_ORDERS = 30;

/**
 * Quota-safe localStorage wrapper.
 * On quota errors we strip memory photos (the largest data) and retry once.
 */
const safeStorage: Storage = {
  length: 0,
  key: (i) => localStorage.key(i),
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Quota exceeded — evict photos and retry
      try {
        const parsed = JSON.parse(value);
        if (parsed?.state?.memories) {
          for (const token of Object.keys(parsed.state.memories)) {
            parsed.state.memories[token].photos = [];
          }
        }
        localStorage.setItem(name, JSON.stringify(parsed));
      } catch {
        /* silent — state works in memory, just won't persist this save */
      }
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
  clear: () => localStorage.clear(),
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      orders: [],
      memories: {},
      collections: [],
      hiddenProductIds: [],
      productOverrides: {},
      customProducts: [],
      addOrder: (order) =>
        set((s) => ({ orders: [order, ...s.orders].slice(0, MAX_ORDERS) })),
      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      upsertOrders: (incoming) =>
        set((s) => {
          const existing = new Set(s.orders.map((o) => o.id));
          const toAdd = incoming.filter((o) => !existing.has(o.id));
          if (toAdd.length === 0) return s;
          return { orders: [...s.orders, ...toAdd] };
        }),
      saveMemory: (memory) =>
        set((s) => ({ memories: { ...s.memories, [memory.token]: memory } })),
      getMemory: (token) => get().memories[token],
      resetMemoryPin: (token, newPin) =>
        set((s) => {
          const m = s.memories[token];
          if (!m) return s;
          return {
            memories: {
              ...s.memories,
              [token]: {
                ...m,
                pin: newPin,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      deleteMemory: (token) =>
        set((s) => {
          if (!s.memories[token]) return s;
          const next = { ...s.memories };
          delete next[token];
          return { memories: next };
        }),
      // ---- Collections ----
      seedCollections: (initial) =>
        set((s) => (s.collections.length === 0 ? { collections: initial } : s)),
      addCollection: (c) =>
        set((s) => ({ collections: [...s.collections, c] })),
      updateCollection: (id, patch) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),
      deleteCollection: (id) =>
        set((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),
      cascadeDeleteCollection: (id, productIds) =>
        set((s) => {
          const merged = Array.from(
            new Set([...s.hiddenProductIds, ...productIds]),
          );
          return {
            collections: s.collections.filter((c) => c.id !== id),
            hiddenProductIds: merged,
          };
        }),
      reorderCollections: (ids) =>
        set((s) => {
          const map = new Map(s.collections.map((c) => [c.id, c]));
          const next = ids
            .map((id, i) => {
              const c = map.get(id);
              return c ? { ...c, sortOrder: i } : null;
            })
            .filter((c): c is Collection => c !== null);
          return { collections: next };
        }),
      hideProducts: (ids) =>
        set((s) => ({
          hiddenProductIds: Array.from(
            new Set([...s.hiddenProductIds, ...ids]),
          ),
        })),
      unhideProduct: (id) =>
        set((s) => ({
          hiddenProductIds: s.hiddenProductIds.filter((x) => x !== id),
        })),
      // ---- Product overlay ----
      upsertProduct: (p, isSeed) =>
        set((s) => {
          if (isSeed) {
            return {
              productOverrides: { ...s.productOverrides, [p.id]: p },
              hiddenProductIds: s.hiddenProductIds.filter((x) => x !== p.id),
            };
          }
          const idx = s.customProducts.findIndex((x) => x.id === p.id);
          if (idx === -1) {
            return { customProducts: [p, ...s.customProducts] };
          }
          const next = [...s.customProducts];
          next[idx] = p;
          return { customProducts: next };
        }),
      removeProduct: (id, isSeed) =>
        set((s) => {
          if (isSeed) {
            return {
              hiddenProductIds: Array.from(
                new Set([...s.hiddenProductIds, id]),
              ),
            };
          }
          return {
            customProducts: s.customProducts.filter((p) => p.id !== id),
          };
        }),
      toggleProductActive: (id, isSeed, current) =>
        set((s) => {
          const nextActive = !current;
          if (isSeed) {
            const prev = s.productOverrides[id] ?? {};
            return {
              productOverrides: {
                ...s.productOverrides,
                [id]: { ...prev, isActive: nextActive },
              },
            };
          }
          return {
            customProducts: s.customProducts.map((p) =>
              p.id === id ? { ...p, isActive: nextActive } : p,
            ),
          };
        }),
    }),
    { name: "mashaer-data", storage: createJSONStorage(() => safeStorage) },
  ),
);
