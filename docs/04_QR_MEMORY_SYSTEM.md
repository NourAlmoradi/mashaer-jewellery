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

## 2. User Flow

```
① BROWSE  → Customer sees "🎁 QR ذكريات" badge on eligible products
② BUY     → Customer purchases Jewellery + chooses QR option at checkout
           (per order = 1 QR, or per piece = 1 QR per item)
③ CONFIRM → System auto-generates unique QR code (shown on confirmation page)
④ SCAN    → Parent scans QR → lands on hekaya-Jewellery.com/memory/abc123
⑤ SETUP   → First time: login required, then upload 3 photos + title + message
⑥ PIN     → Parent sets a 4-digit PIN for viewers
⑦ SHARE   → Anyone who scans QR + enters PIN sees the memory page
```

---

## 3. Technical Implementation

### QR Code Generation (after payment confirmed)

```typescript
import QRCode from "qrcode";

async function generateQRCode(slug) {
  const url = `https://hekaya-Jewellery.com/memory/${slug}`;
  const buffer = await QRCode.toBuffer(url, {
    width: 1000,
    color: { dark: "#C9A96E", light: "#FAFAF8" }, // Warm Gold on Warm White
    errorCorrectionLevel: "H",
  });
  return buffer;
}
```

### Slug Generation

```typescript
import { customAlphabet } from "nanoid";
const generateSlug = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 8);
// Produces: "abc3def7" → hekaya-Jewellery.com/memory/abc3def7
```

### Flow After Payment

1. Check if customer selected QR memory option at checkout
2. Generate unique 8-char slug
3. Generate QR code image (warm gold colored)
4. Upload QR image to Supabase Storage (`qr-codes` bucket)
5. Create record in `qr_memories` table
6. Show QR on order confirmation page
7. Send QR via email to customer

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

## 5. Privacy

All memory pages are **PIN-protected** by default:

| Who                   | Access                                 |
| --------------------- | -------------------------------------- |
| **Owner (logged in)** | Full access — view + edit + change PIN |
| **Anyone with PIN**   | View only (read-only)                  |
| **No PIN**            | Cannot view — sees "Enter PIN" prompt  |

---

## 6. Media Upload Rules

| Type   | Max Size | Formats        | Max Per Memory |
| ------ | -------- | -------------- | -------------- |
| Photos | 5MB each | JPG, PNG, WebP | 3              |

### Processing Pipeline

```
Upload → Validate (type + size + count ≤ 3) → Compress (sharp) →
Upload to Supabase Storage → Save URL to memory_photos table
```

---

## 7. QR Delivery Methods

| Method            | When                                |
| ----------------- | ----------------------------------- |
| **On-screen**     | Order confirmation page (immediate) |
| **Email**         | Automated within 1 minute           |
| **My Memories**   | Always available in user account    |
| **Physical card** | Printed card in Jewellery packaging |

---

## 8. Edge Cases

| Scenario              | Solution                         |
| --------------------- | -------------------------------- |
| Memory not set up yet | Show "not set up" + prompt owner |
| Owner deleted account | Memory stays visible (orphaned)  |
| Product returned      | QR memory stays active           |
| Upload fails          | Show retry button                |
| Invalid file          | Client + server validation       |

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
