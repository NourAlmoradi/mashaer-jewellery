"use client";

import { Toaster } from "sonner";
import { LocaleProvider } from "@/components/LocaleProvider";
import { AuthProvider } from "@/lib/supabase/AuthProvider";
import type { Locale } from "@/types";

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid #c9a96e",
              borderRadius: "4px",
              padding: "12px 16px",
            },
          }}
        />
      </AuthProvider>
    </LocaleProvider>
  );
}
