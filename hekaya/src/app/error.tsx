"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for monitoring (replace with Sentry/log drain in Phase 2).
    console.error(error);
  }, [error]);

  return (
    <div className="container-h flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-dark)]">
        Something went wrong
      </p>
      <h1 className="fs-display-md max-w-xl text-[var(--color-ink)]">
        We hit an unexpected error
      </h1>
      <p className="max-w-md text-[var(--color-ink-muted)]">
        Sorry for the interruption. You can try again, or head back to the
        homepage.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="btn-gold">
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
