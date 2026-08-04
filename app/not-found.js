export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-brand-surface px-6 text-brand-ink">
      <section className="w-full max-w-xl rounded-3xl border border-brand-purple/10 bg-white p-8 text-center shadow-xl shadow-brand-purple/10 sm:p-12">
        <p className="font-body text-xs font-extrabold uppercase tracking-[.18em] text-brand-purple">404 · Route not found</p>
        <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-5xl">This road ends here.</h1>
        <p className="mx-auto mt-4 max-w-md font-body leading-7 text-slate-600">Return to the homepage and explore available group trips, destinations and custom journeys.</p>
        <a className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-yellow px-7 font-body font-extrabold text-brand-deep shadow-lg shadow-brand-yellow/25 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-purple motion-reduce:transform-none" href="/">Go to homepage</a>
      </section>
    </main>
  );
}
