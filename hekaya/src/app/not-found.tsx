import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-h flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-dark)]">
        404
      </p>
      <h1 className="fs-display-md max-w-xl text-[var(--color-ink)]">
        This page couldn&apos;t be found
      </h1>
      <p className="max-w-md text-[var(--color-ink-muted)]">
        The page you&apos;re looking for may have moved or no longer exists.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-gold">
          Back to home
        </Link>
        <Link href="/products" className="btn-outline">
          Shop jewellery
        </Link>
      </div>
    </div>
  );
}
