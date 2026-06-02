export default function Loading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <span
          aria-hidden
          className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"
        />
        <span className="text-sm tracking-wide text-[var(--color-ink-soft)]">
          Loading…
        </span>
      </div>
    </div>
  );
}
