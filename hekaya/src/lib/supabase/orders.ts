import type { SupabaseClient } from "@supabase/supabase-js";
import type { Bilingual, Order, OrderItem, ShippingAddress } from "@/types";

/**
 * Raw database row shapes (snake_case) for the orders tables.
 * Mirrors the schema in SUPABASE_SETUP.md / seed.sql.
 */
type OrderItemRow = {
  product_id: string | null;
  name: Bilingual;
  qty: number;
  price: number | string;
  variation_label: Bilingual | null;
};

type OrderRow = {
  id: string;
  customer_name: string;
  email: string;
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  status: Order["status"];
  qr_choice: Order["qrChoice"];
  qr_tokens: string[] | null;
  qr_token_labels: string[] | null;
  qr_token_product_ids: string[] | null;
  shipping_address: ShippingAddress;
  payment_method: Order["paymentMethod"];
  created_at: string;
  order_items?: OrderItemRow[];
};

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    email: row.email,
    items: (row.order_items ?? []).map((it) => ({
      productId: it.product_id ?? "",
      name: it.name,
      qty: it.qty,
      price: Number(it.price),
      variationLabel: it.variation_label ?? undefined,
    })),
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    status: row.status,
    qrChoice: row.qr_choice,
    qrTokens: row.qr_tokens ?? [],
    qrTokenLabels: row.qr_token_labels ?? [],
    qrTokenProductIds: row.qr_token_product_ids ?? [],
    shippingAddress: row.shipping_address,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
  };
}

const ORDER_SELECT =
  "*, order_items ( product_id, name, qty, price, variation_label )";

/** All orders visible to the caller (RLS: own orders, or every order for admins). */
export async function fetchOrders(
  supabase: SupabaseClient,
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as OrderRow[]).map(mapOrder);
}

/** A single order by id (RLS still applies). */
export async function fetchOrderById(
  supabase: SupabaseClient,
  id: string,
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data as OrderRow) : null;
}

/**
 * Place an order through the atomic `place_order` RPC. The server validates
 * every item price against the live catalog, recomputes subtotal/shipping/
 * total, forces status to 'pending' and inserts order + items in one
 * transaction. Requires a signed-in user (the RPC reads auth.uid()).
 */
export async function createOrder(
  supabase: SupabaseClient,
  order: Order,
): Promise<void> {
  const { error } = await supabase.rpc("place_order", {
    p_id: order.id,
    p_customer_name: order.customerName,
    p_email: order.email,
    p_items: order.items.map((it: OrderItem) => ({
      product_id: it.productId,
      name: it.name,
      qty: it.qty,
      price: it.price,
      variation_label: it.variationLabel ?? null,
    })),
    p_qr_choice: order.qrChoice,
    p_qr_tokens: order.qrTokens,
    p_qr_token_labels: order.qrTokenLabels ?? [],
    p_qr_token_product_ids: order.qrTokenProductIds ?? [],
    p_shipping_address: order.shippingAddress,
    p_payment_method: order.paymentMethod,
  });
  if (error) throw error;
}

/** Admin: update an order's status. */
export async function updateOrderStatus(
  supabase: SupabaseClient,
  id: string,
  status: Order["status"],
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
