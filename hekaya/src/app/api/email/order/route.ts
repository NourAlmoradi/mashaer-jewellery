import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fetchOrderById } from "@/lib/supabase/orders";
import { sendOrderEmails } from "@/lib/email/sendOrderEmails";
import { clientIp, rateLimited } from "@/lib/rateLimit";
import type { Locale } from "@/types";

export const runtime = "nodejs"; // resend SDK needs Node, not Edge

/**
 * Dispatch the order emails for an order the caller owns. Guarded twice against
 * a replay loop: a per-IP rate limit, and the `emails_sent_at` claim below.
 */

const RATE_RULE = { limit: 10, windowMs: 10 * 60 * 1000 };

type Body = {
  orderId: string;
  locale?: Locale;
};

export async function POST(req: Request) {
  if (rateLimited("order-email", clientIp(req), RATE_RULE)) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, reason: "bad_request" },
      { status: 400 },
    );
  }
  if (!body?.orderId) {
    return NextResponse.json(
      { ok: false, reason: "missing_order_id" },
      { status: 400 },
    );
  }

  const locale: Locale = body.locale === "en" ? "en" : "ar";

  // Re-fetch the order server-side (RLS scopes it to the signed-in owner) so
  // we never trust totals/emails sent from the browser. This is also the
  // authorization check: a caller who cannot read the order cannot mail it.
  const supabase = await createClient();
  const order = await fetchOrderById(supabase, body.orderId);
  if (!order) {
    return NextResponse.json(
      { ok: false, reason: "not_found" },
      { status: 404 },
    );
  }

  // Compare-and-set: only the first concurrent request gets rows back. Needs
  // the service role — customers have no UPDATE policy on orders.
  const claimedAt = new Date().toISOString();
  const { data: claimed, error: claimError } = await supabaseAdmin
    .from("orders")
    .update({ emails_sent_at: claimedAt })
    .eq("id", order.id)
    .is("emails_sent_at", null)
    .select("id");

  if (claimError) {
    console.error("[email/order] could not claim send:", claimError.message);
    return NextResponse.json(
      { ok: false, reason: "claim_failed" },
      { status: 500 },
    );
  }

  if (!claimed || claimed.length === 0) {
    // Already sent. Report success: the customer's confirmation exists, and
    // checkout fires this fire-and-forget, so a retry is not an error.
    return NextResponse.json({ ok: true, alreadySent: true });
  }

  const result = await sendOrderEmails(order, locale);

  // Release the claim only if nothing went out at all, so a retry can succeed.
  // A partial failure keeps it: re-sending everything is worse than one gap.
  if (result.failures.length === result.attempted) {
    await supabaseAdmin
      .from("orders")
      .update({ emails_sent_at: null })
      .eq("id", order.id)
      .eq("emails_sent_at", claimedAt);
  }

  return NextResponse.json(result);
}
