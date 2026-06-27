import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchOrderById } from "@/lib/supabase/orders";
import { sendOrderEmails } from "@/lib/email/sendOrderEmails";
import type { Locale } from "@/types";

export const runtime = "nodejs"; // resend SDK needs Node, not Edge

type Body = {
  orderId: string;
  locale?: Locale;
};

export async function POST(req: Request) {
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
  // we never trust totals/emails sent from the browser.
  const supabase = await createClient();
  const order = await fetchOrderById(supabase, body.orderId);
  if (!order) {
    return NextResponse.json(
      { ok: false, reason: "not_found" },
      { status: 404 },
    );
  }

  const result = await sendOrderEmails(order, locale);
  return NextResponse.json(result);
}
