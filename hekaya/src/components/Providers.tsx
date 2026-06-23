"use client";

import { useRef } from "react";
import { Toaster } from "sonner";
import { useLocaleStore } from "@/stores/locale.store";
import { AuthProvider } from "@/lib/supabase/AuthProvider";
import type { Locale } from "@/types";

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  // Seed the store synchronously on first render so children render
  // with the correct locale on both server and client (no FOWL flash).
  const seeded = useRef(false);
  if (!seeded.current) {
    useLocaleStore.getState().init(initialLocale);
    seeded.current = true;
  }

  return (
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
  );
}
