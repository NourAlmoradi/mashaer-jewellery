import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * May the caller write this token's row or storage folder? Buyer or admin —
 * the same rule `save_memory` enforces, so storage can't end up looser.
 * Identity comes from the session, never from the request body.
 */
export async function canWriteMemoryToken(token: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.is_admin) return true;

  // An unknown token matches no order, so a non-admin gets false here.
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("user_id")
    .contains("qr_tokens", [token])
    .limit(1)
    .maybeSingle();
  return !!order && order.user_id === user.id;
}
