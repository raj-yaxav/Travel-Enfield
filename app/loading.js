export default function Loading() {
  return (
    <main className="page-loader min-h-dvh w-full" aria-live="polite">
      <div className="grid justify-items-center gap-4 text-center">
        <span aria-hidden="true" />
        <p>Preparing your next adventure…</p>
      </div>
    </main>
  );
}
