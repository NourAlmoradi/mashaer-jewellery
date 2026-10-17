import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isBespokeAdmin } from "@/lib/bespokeAdmin";
import { BESPOKE_BUCKET, isBespokeId, parseBespokeBrief } from "@/lib/bespoke";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
export async function GET(req: Request) {
  if (!(await isBespokeAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403, headers });
  const params = new URL(req.url).searchParams;
  const id = params.get("request") || "";
  const index = Number(params.get("index"));
  if (!isBespokeId(id) || !Number.isSafeInteger(index) || index < 0 || index > 2) return NextResponse.json({ error: "invalid" }, { status: 400, headers });
  const { data } = await supabaseAdmin.from("contact_messages").select("message").eq("id", id).eq("topic", "custom").maybeSingle();
  const path = data ? parseBespokeBrief(data.message)?.references[index] : null;
  if (!path || !path.startsWith(`${id}/`) || path.includes("..")) return NextResponse.json({ error: "not_found" }, { status: 404, headers });
  const { data: image, error } = await supabaseAdmin.storage.from(BESPOKE_BUCKET).download(path);
  if (error || !image) return NextResponse.json({ error: "unavailable" }, { status: 404, headers });
  if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) return NextResponse.json({ error: "invalid" }, { status: 415, headers });
  return new Response(await image.arrayBuffer(), { headers: { ...headers, "Content-Type": image.type, "Content-Disposition": `inline; filename="reference-${index + 1}"` } });
}
