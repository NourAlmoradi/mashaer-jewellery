import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Deletes the currently signed-in user's account.
// Removing the auth.users row cascades to profiles, addresses, wishlist,
// orders → order_items, and orders → memories (see seed.sql §1b).
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Clear the session cookies so the browser is signed out.
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
