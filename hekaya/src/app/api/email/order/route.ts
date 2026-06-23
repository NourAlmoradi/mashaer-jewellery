import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchOrderById } from "@/lib/supabase/orders";
import { resend, FROM, REPLY_TO, ADMIN_ALERT } from "@/lib/email/resend";
import {
  adminNewOrder,
  memoriesLinkAll,
  orderConfirmation,
} from "@/lib/email/templates";
import type { Locale } from "@/types";

export const runtime = "nodejs"; // resend SDK needs Node, not Edge

type Body = {
  orderId: string;
  locale?: Locale;
};

export async function POST(req: Request) {
  if (!resend) return NextResponse.json({ ok: false, reason: "no_key" });
  const mailer = resend; // narrowed non-null for closures below

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

  // Collect every send so one failure doesn't silently mask the rest.
  const failures: string[] = [];
  const send = async (
    kind: string,
    msg: { to: string; subject: string; html: string },
  ) => {
    const { error } = await mailer.emails.send({
      from: FROM,
      to: msg.to,
      replyTo: REPLY_TO,
      subject: msg.subject,
      html: msg.html,
    });
    if (error) {
      console.error(`[email/order] ${kind} failed:`, error.message);
      failures.push(kind);
    }
    // Resend free tier allows 2 req/sec — pace sequential sends.
    await new Promise((r) => setTimeout(r, 600));
  };

  // 1) Customer order confirmation
  const conf = orderConfirmation(order, locale);
  await send("confirmation", {
    to: order.email,
    subject: conf.subject,
    html: conf.html,
  });

  // 2) One email listing every memory card (link only — PIN is set on the page).
  if (order.qrTokens.length > 0) {
    const m = memoriesLinkAll(order, locale);
    await send("memories", {
      to: order.email,
      subject: m.subject,
      html: m.html,
    });
  }

  // 3) Admin alert
  if (ADMIN_ALERT) {
    const a = adminNewOrder(order);
    await send("admin_alert", {
      to: ADMIN_ALERT,
      subject: a.subject,
      html: a.html,
    });
  }

  return NextResponse.json({ ok: failures.length === 0, failures });
}
