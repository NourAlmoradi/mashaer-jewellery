import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { canWriteMemoryToken } from "@/lib/memoryAuth";
import { clientIp, rateLimited } from "@/lib/rateLimit";

export const runtime = "nodejs"; // needs the service role

const BUCKET = "memory-photos";
// Grace window: a photo reaches storage before the row that references it, so a
// recent file may be unreferenced simply because its owner is still composing.
const MIN_AGE_MS = 15 * 60 * 1000;

const RATE_RULE = { limit: 30, windowMs: 10 * 60 * 1000 };

type Body = { token?: string };

/**
 * Delete the files in `<token>/` the memory row no longer references. Takes
 * only a token: the keep-list comes from the database, never from the caller.
 * Best-effort — the rest is left to `/api/admin/memory/orphans`.
 */
export async function POST(req: Request) {
  if (rateLimited("memory-prune", clientIp(req), RATE_RULE)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const token = (body.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!(await canWriteMemoryToken(token))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: mem, error: memErr } = await supabaseAdmin
    .from("memories")
    .select("photos")
    .eq("token", token)
    .maybeSingle();
  // Bail out rather than treating a failed read as "nothing is referenced",
  // which would delete the memory's live photos.
  if (memErr) {
    return NextResponse.json({ error: memErr.message }, { status: 500 });
  }

  const marker = `/${BUCKET}/`;
  const keep = new Set<string>();
  for (const url of (mem?.photos ?? []) as string[]) {
    const i = url.indexOf(marker);
    if (i !== -1) keep.add(url.slice(i + marker.length).split("?")[0]);
  }

  const { data: files, error: listErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .list(token, { limit: 1000 });
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }

  const cutoff = Date.now() - MIN_AGE_MS;
  const doomed = (files ?? [])
    .filter((f) => {
      if (!f.id) return false; // folder placeholder, not a file
      if (keep.has(`${token}/${f.name}`)) return false;
      const created = f.created_at ? new Date(f.created_at).getTime() : 0;
      return created <= cutoff;
    })
    .map((f) => `${token}/${f.name}`);

  if (doomed.length > 0) {
    const { error: rmErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove(doomed);
    if (rmErr) {
      return NextResponse.json({ error: rmErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, removed: doomed.length });
}
