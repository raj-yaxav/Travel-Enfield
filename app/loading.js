export default function Loading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-brand-surface px-6 text-brand-ink" aria-live="polite">
      <div className="grid justify-items-center gap-4 text-center">
        <span className="size-12 animate-spin rounded-full border-4 border-brand-purple/15 border-t-brand-purple motion-reduce:animate-none" aria-hidden="true" />
        <p className="font-body text-sm font-semibold">Preparing your next adventure…</p>
      </div>
    </main>
  );
}
