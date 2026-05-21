# 💳 Payment & Checkout

> How to accept payments securely for MASHAER JEWELLERY

---

## 1. Payment Gateways: Stripe + PayPal

As requested, checkout strictly supports **Apple Pay, Mastercard, and PayPal**. We handle this seamlessly via two robust integrations:

| Feature               | Stripe (Apple Pay & Mastercard) | PayPal (PayPal Checkout)         |
| --------------------- | ------------------------------- | -------------------------------- |
| **Supported Methods** | Apple Pay, Mastercard           | PayPal Balance & Linked Accounts |
| **Pricing**           | 2.9% + 1 AED per transaction    | ~3.9% + fixed AED per tx         |
| **Settlement**        | 2-7 business days               | Immediate to PayPal balance      |
| **Test Mode**         | Full test environment via keys  | Sandbox mode                     |

> **💡 Note:** Visa and other card types can technically be processed by Stripe, but the primary user-facing options will emphasize Apple Pay, Mastercard, and PayPal to match the business requirement.

### Stripe Test Cards (Mastercard)

| Card Number           | Type | Result  |
| --------------------- | ---- | ------- |
| `5555 5555 5555 4444` | MC   | Success |

### PayPal Sandbox

You will create a Sandbox Personal account in your PayPal Developer dashboard to test PayPal purchases without using real money.

---

## 2. Checkout Flow (current MVP — `app/checkout/CheckoutClient.tsx`)

The checkout is a single client component with a **3-step stepper** + sticky **Order Summary** aside.

```
CART  →  /checkout (stepper)  →  /order-confirmation/[id]
              │
              ├─ Step 1 — Shipping
              │     full name · email · phone · city · address line
              │     emirate (7-option <select>) · postal code · notes
              │     → "Continue to Review" validates required fields
              │
              ├─ Step 2 — Review
              │     line items with thumbnails (PlaceholderJewel fallback)
              │     shipping summary card
              │     QR Memory option radio: per_order vs per_piece
              │     → "Continue to Payment"
              │
              └─ Step 3 — Payment
                    radio of three PayOption cards:
                      · card       (Mastercard via Stripe — visual)
                      · apple_pay  (via Stripe — visual)
                      · paypal     (via PayPal — visual)
                    → "Pay now — {total}"  → setTimeout(1100ms) → placeOrder()
```

### What `placeOrder()` actually does (MVP)

1. Builds `OrderItem[]` from cart.
2. Mints QR tokens via `generateToken()` according to `qrChoice`:
   - `per_order` → 1 token labelled "All Items"
   - `per_piece` → one token per `qty` per cart line
3. `useDataStore.addOrder()` (status: `"paid"`) — capped at 30 most recent orders.
4. `useCartStore.clear()`.
5. `router.push('/order-confirmation/' + id)`.

No server, no real payment call, no webhook. The chosen `paymentMethod` is stored on the order verbatim (`"card" | "apple_pay" | "paypal"`).

### Saved-address autofill

Step 1 reads `localStorage["mashaer-mock-addresses"]` (written by `account/page.tsx`). When at least one saved address exists, a small picker is shown above the form letting the customer prefill the fields with one click.

---

## 3. Server-Side Payment Flow 🔜 (production target)

> **MVP today:** there is no server-side payment flow — see Section 2. The block below describes the production target.

```typescript
// 1. Customer clicks "Pay"
// 2. Server creates order in DB
// 3. Server calculates total (NEVER trust client price!)
// 4. Server sends payment request to Stripe API or PayPal API
// 5. Customer completes payment on Stripe Elements or PayPal Popup
// 6. Stripe sends webhook to /api/payment/webhook (PayPal handles approval directly)
// 7. Server verifies payment → updates order status
// 8. Server generates QR codes (if customer selected QR option)
// 9. Server sends confirmation email
```

### Critical: Always Calculate Server-Side

```typescript
// ❌ WRONG: Trust client total
const total = req.body.total;

// ✅ RIGHT: Calculate from database
const items = await getOrderItems(orderId);
const total = items.reduce(
  (sum, item) => sum + item.product.price * item.quantity,
  0,
);
```

---

## 4. Shipping Costs (current MVP)

Shipping is computed in `CheckoutClient.tsx` via `rateForEmirate()` and the **admin-configurable rates** in `useAdminSettings().shipping`. The defaults are:

| Emirate                             | Default rate (AED) | Source                                     |
| ----------------------------------- | ------------------ | ------------------------------------------ |
| Dubai                               | 0                  | `adminSettings.shipping.dubai`             |
| Abu Dhabi                           | 15                 | `adminSettings.shipping.abuDhabi`          |
| Sharjah                             | 10                 | `adminSettings.shipping.sharjah`           |
| Other emirates (UAQ, RAK, FUJ, AJM) | 25                 | `adminSettings.shipping.otherEmirates`     |
| GCC export                          | 50                 | `adminSettings.shipping.gcc` (planned use) |

**Free-shipping rule:** subtotal **> 500 AED** → `ship = 0` regardless of emirate.

Admins can change all of these from `/admin/settings → Shipping` and the change is immediately reflected at checkout (Zustand `persist`, key `mashaer-admin-settings`).

```ts
// Effective rate (CheckoutClient.tsx)
const sub = subtotal();
const ship = sub > 500 ? 0 : rateForEmirate(shipping.emirate);
const total = sub + ship;
```

---

## 5. Order Numbers

Format in MVP: `HK-XXXXXX` where `XXXXXX` is `nanoid(6)` over uppercase + digits, generated by `generateOrderId()` in `lib/utils.ts`.
Production may switch to a sequential `HK-YYYYNNNNN` (e.g., `HK-202600042`).

---

## 6. Payment Security Checklist 🔜 (production)

- [ ] Use test keys (Stripe) and sandbox client IDs (PayPal) during development
- [ ] Live keys only in Production environment
- [ ] Webhook validates Stripe signature with `whsec_` secret
- [ ] Prices always calculated server-side
- [ ] Order totals verified before payment
- [ ] No inventory tracking needed (confirmed)

> Until any of the above ships, the MVP checkout is a **visual mock** — do **not** point real customers at it.
