import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="surface-panel w-full max-w-2xl rounded-[32px] p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-warning">
          Route missing
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          This StudyBond page does not exist
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          The requested record or route could not be found in the current MVP.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong"
            href="/dashboard"
          >
            Open dashboard
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong px-5 text-sm font-semibold transition hover:bg-white/80"
            href="/"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
