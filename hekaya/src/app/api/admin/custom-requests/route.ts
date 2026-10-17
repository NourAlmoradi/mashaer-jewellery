import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BESPOKE_STATUSES, isBespokeId, parseBespokeBrief, requestReference } from "@/lib/bespoke";
import { isBespokeAdmin } from "@/lib/bespokeAdmin";
import { sendBespokeAlert } from "@/lib/email/sendBespokeAlert";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(req: Request) {
  if (!(await isBespokeAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403, headers });
  const params = new URL(req.url).searchParams;
  const requestedPage = Number(params.get("page") || 0);
  const page = Number.isSafeInteger(requestedPage) && requestedPage >= 0 ? Math.min(requestedPage, 1000) : 0;
  const requestId = params.get("request");
  if (requestId && !isBespokeId(requestId)) return NextResponse.json({ error: "invalid" }, { status: 400, headers });
  const query = supabaseAdmin.from("contact_messages").select("id,message,created_at").eq("topic", "custom").like("message", '%"source":"mashaer-bespoke-v1"%');
  const { data, error } = requestId ? await query.eq("id", requestId) : await query.order("created_at", { ascending: false }).range(page * 50, page * 50 + 49);
  if (error) return NextResponse.json({ error: "load_failed" }, { status: 502, headers });
  const requests = (data ?? []).map((row) => {
    const brief = parseBespokeBrief(row.message);
    if (!brief) return null;
    return { ...brief, id: row.id, reference: requestReference(row.id), createdAt: row.created_at,
      references: brief.references.map((_, index) => `/api/admin/custom-requests/reference?request=${encodeURIComponent(row.id)}&index=${index}`),
    };
  });
  return NextResponse.json({ requests: requests.filter(Boolean), hasMore: !requestId && data?.length === 50 }, { headers });
}

export async function PATCH(req: Request) {
  const origin = req.headers.get("origin");
  if ((origin && origin !== new URL(req.url).origin) || !(await isBespokeAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403, headers });
  let body: { id?: string; status?: string; action?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid" }, { status: 400, headers }); }
  if (!body || typeof body.id !== "string" || !isBespokeId(body.id) || (body.action !== "notify" && !BESPOKE_STATUSES.some((s) => s.id === body.status))) return NextResponse.json({ error: "invalid" }, { status: 400, headers });
  const { data: row } = await supabaseAdmin.from("contact_messages").select("message").eq("id", body.id).eq("topic", "custom").maybeSingle();
  const brief = row ? parseBespokeBrief(row.message) : null;
  if (!brief || !row) return NextResponse.json({ error: "not_found" }, { status: 404, headers });
  const notified = body.action === "notify" ? await sendBespokeAlert(body.id, brief, new URL(req.url).origin) : null;
  if (notified === false) return NextResponse.json({ error: "notification_failed" }, { status: 502, headers });
  const { data, error } = await supabaseAdmin.from("contact_messages").update({
    message: JSON.stringify(body.action === "notify" ? { ...brief, notificationStatus: "sent" } : { ...brief, status: body.status }),
    handled: body.action === "notify" ? brief.status === "completed" || brief.status === "closed" : body.status === "completed" || body.status === "closed",
  }).eq("id", body.id).eq("message", row.message).select("id");
  if (error) return NextResponse.json({ error: "save_failed" }, { status: 502, headers });
  if (!data?.length) return NextResponse.json({ error: "conflict" }, { status: 409, headers });
  return NextResponse.json({ ok: true }, { headers });
}
