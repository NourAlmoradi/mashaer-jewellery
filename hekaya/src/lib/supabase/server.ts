import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const createClient = async () => {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) =>
          list.forEach(({ name, value, options }) => {
            try {
              store.set(name, value, options);
            } catch {
              // `set` throws when called from a Server Component render.
              // Safe to ignore — middleware/route handlers refresh the session.
            }
          }),
      },
    },
  );
};
