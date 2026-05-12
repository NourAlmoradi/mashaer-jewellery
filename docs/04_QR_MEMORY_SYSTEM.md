# 🔲 QR Memory System

> The core differentiator — Dynamic QR codes that store children's memories

---

## 1. Concept

When a customer buys a kids' Jewellery piece, they can choose to add a **unique QR code** at checkout (per order or per piece). Scanning this QR leads to a **PIN-protected memory page** where parents can:

- Upload up to **3 photos**
- Write a **title and message**
- Update it **anytime** as the child grows

### Why It's Powerful

- **Emotional connection** — transforms Jewellery into a keepsake
- **Repeat engagement** — parents keep coming back
- **Gift-worthy** — grandparents scan QR and see grandchild's memories
- **Unique in market** — an innovative feature that sets Hekaya Jewellery apart

---

## 2. User Flow (current MVP)

```
① BROWSE  → Customer sees "🎁 QR ذكريات" badge on QR-eligible products
② BUY     → Customer purchases jewellery + chooses QR option in CartDrawer / checkout step 2
           (per_order = 1 token total, per_piece = 1 token per piece)
③ CONFIRM → Tokens are generated client-side at order placement; QR PNGs render
           on /order-confirmation/[id] (one card per token, gold colour)
④ SCAN    → Anyone scans → lands on /memory/[token]
⑤ SETUP   → First-time visit shows the editor: 4-digit PIN + title + message + up to 3 photos
⑥ PIN     → Subsequent visits show the PIN gate; correct PIN reveals the memory
⑦ EDIT    → After unlock, owner can re-enter the editor and update content / change PIN
```

> **Auth note:** the MVP does **not** enforce ownership — anyone with the token URL who knows the PIN can edit. Real ownership checks are a production-target item.

---

## 3. Technical Implementation (current MVP)

All QR / memory work happens **client-side in the browser**. No server, no Supabase, no email.

### Token generation — `lib/utils.ts`

```ts
import { customAlphabet } from "nanoid";
// 8-character lowercase + digits, ambiguous chars removed
const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
export const generateToken = customAlphabet(alphabet, 8);
// Produces: "abc3def7"
```

### QR PNG rendering — `lib/qr.ts`

```ts
import QRCode from "qrcode";

export function memoryUrlFor(token: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/memory/${token}`;
}

export async function generateQrDataUrl(
  url: string,
  opts?: { color?: string; bg?: string; width?: number },
) {
  return QRCode.toDataURL(url, {
    width: opts?.width ?? 320,
    color: { dark: opts?.color ?? "#c9a96e", light: opts?.bg ?? "#ffffff" },
    errorCorrectionLevel: "H",
  });
}
```

Defaults are read from `adminSettings.qr.defaultColor` / `bgColor` so the admin can tweak QR appearance without code changes.

### Persistence — `data.store.ts`

Memories live in **`useDataStore.memories`** keyed by token, persisted under `localStorage["hekaya-data"]`:

```ts
type Memory = {
  token: string;
  orderId?: string;
  productId?: string;
  pin: string; // plain 4-digit string in MVP (production: hashed)
  title: string;
  message: string;
  photos: string[]; // data-URL JPEGs (mock storage)
  createdAt: string;
  updatedAt: string;
};
```

### Photo handling — `app/memory/[token]/page.tsx`

Each uploaded image is read with `FileReader`, drawn onto a `<canvas>` scaled to **max 800 px** on its longest side, and re-encoded as **JPEG @ quality 0.7**. The resulting data URL is appended to `photos` (capped at 3). This compresses typical phone photos by ~10× before persistence.

### localStorage quota safety — `data.store.ts`

`safeStorage` wraps `setItem`. If the browser throws `QuotaExceededError` it strips `state.memories[*].photos` from the payload and retries once. This guarantees orders + metadata survive even if photo storage overflows.

### Flow at order placement — `checkout/CheckoutClient.tsx`

1. Customer chooses `qrChoice` (per_order / per_piece) in step 2.
2. On "Pay now", `placeOrder()` mints tokens via `generateToken()`:
   - `per_order` → 1 token labelled "All Items"
   - `per_piece` → one token per `qty` per cart line, labelled `<name> · <variation> #N`
3. Tokens, labels, and `productId`s are stored on the order (`qrTokens`, `qrTokenLabels`, `qrTokenProductIds`).
4. `/order-confirmation/[id]` renders one gold QR PNG card per token using `generateQrDataUrl(memoryUrlFor(token))`.

---

## 4. Public Memory Page Design

**URL:** `hekaya-Jewellery.com/memory/abc3def7`

```
┌──────────────────────────────────────┐
│        Hekaya Jewellery                │
│                                      │
│     🔑 Enter 4-digit PIN            │
│     [____]  [View Memory →]         │
│                                      │
│  ─ ─ ─ After PIN entered ─ ─ ─ ─   │
│                                      │
│         ✨ Memory Title ✨           │
│   "حبيبة ماما وبابا الغالية"        │
│                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ photo  │ │ photo  │ │ photo  │  │
│  │   1    │ │   2    │ │   3    │  │
│  └────────┘ └────────┘ └────────┘  │
│                                      │
│      Hekaya Jewellery                 │
└──────────────────────────────────────┘
```

**Key:** This page MUST be mobile-perfect (scanned by phone)

---

## 5. Privacy & Access (MVP behaviour)

Memory pages are **PIN-gated**, not auth-gated:

| Who                                   | Access                                                              |
| ------------------------------------- | ------------------------------------------------------------------- |
| Anyone with the URL **before setup**  | Sees the editor and can claim the memory by setting a PIN + content |
| Anyone with the URL **+ correct PIN** | Can view **and edit** (no separate "viewer" vs "owner" role in MVP) |
| Anyone with the URL **but no PIN**    | Sees the PIN entry screen — cannot view or edit                     |

> **Production hardening planned:** server-side ownership check tied to the buying account, hashed PINs, rate-limiting on the unlock endpoint, and a separate read-only viewer mode.

---

## 6. Media Upload Rules

| Type   | Max Size (production) | Formats        | Max Per Memory                       |
| ------ | --------------------- | -------------- | ------------------------------------ |
| Photos | 5 MB each (planned)   | JPG, PNG, WebP | **3** (`adminSettings.qr.maxPhotos`) |

### Current MVP pipeline (client-only)

```
Upload → FileReader.readAsDataURL → canvas downscale (max 800 px, JPEG q=0.7)
→ push to memory.photos (cap 3) → saveMemory() → zustand persist → localStorage
   (safeStorage drops photos on QuotaExceededError and retries)
```

### Production target pipeline

```
Upload → POST /api/upload (server validates type + size + count)
→ sharp resize/optimize → Supabase Storage `memory-photos` bucket
→ INSERT memory_photos row → return public URL
```

---

## 7. QR Delivery Methods

| Method            | Status (MVP)                                      |
| ----------------- | ------------------------------------------------- |
| **On-screen**     | ✅ `/order-confirmation/[id]` shows gold QR cards |
| **My Memories**   | ✅ `/my-memories` lists every owned token         |
| **Email**         | 🔜 Production target                              |
| **Physical card** | 🔜 Production target (printed in packaging)       |

---

## 8. Edge Cases

| Scenario                          | MVP behaviour                                                             |
| --------------------------------- | ------------------------------------------------------------------------- |
| Memory not set up yet             | Editor shown immediately so the visitor can claim with a new PIN          |
| Owner deleted account             | N/A (no auth) — token survives until localStorage is cleared              |
| Product returned                  | Token & memory remain                                                     |
| Upload fails / quota exceeded     | `safeStorage` drops photos & retries once; metadata still persists        |
| Invalid file                      | Files larger than the canvas can handle still resize (no hard MIME check) |
| `localStorage` cleared by browser | Memory is lost (mock storage) — production will use Supabase              |

---

## 9. Future Enhancements (Phase 2+)

- Transfer ownership to another user
- Collaborative editing (multiple family members)
- Memory page themes (heritage, simple, elegant)
- PDF photo book export
- Anniversary reminders
- Audio messages
- NFC chip integration

---

## 10. Customer Keepsakes Page (`/my-memories`) — implemented

A dedicated route lists every memory the signed-in (mock) user has set up:

- Reads directly from `data.store.memories` (no demo seeds).
- Each card renders the **real gold QR PNG** for `memoryUrlFor(token)` via `generateQrDataUrl` in a client effect (so SSR cost is zero).
- Shows status pill (Active), title, linked product name (resolved via `findProduct(productId)`), creation date, masked PIN (`●●●●`) and the token.
- Two actions per card: **View** → `/memory/[token]`, **Edit** → `/memory/[token]?edit=1`.
- Empty state with a CTA back to `/products` when no memories exist.
- Reachable from the Account page (`Overview` quick-action button + `My Memories` tab "View all" link).
