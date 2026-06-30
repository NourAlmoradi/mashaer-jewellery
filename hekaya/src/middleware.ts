import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase auth session on every request and writes the rotated
 * cookies back onto the response. @supabase/ssr needs this so server components
 * and route handlers always read a fresh, non-expired session.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touch the session so an expired access token gets refreshed here.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Run on everything except Next internals, static asset files, and the public
  // gift-recipient surfaces. `memory`, `qr` and `api/memory` are designed for
  // anonymous visitors and fetch their own data client-side — refreshing (and
  // rotating) the auth token on those requests is unnecessary and can race the
  // client's own refresh, wedging the shared Supabase auth lock so every later
  // query hangs (the "stuck on loading" memory + account pages).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|memory|qr|api/memory|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
