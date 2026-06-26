"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center px-6 py-16">
          <section className="surface-panel w-full max-w-2xl rounded-[32px] p-8">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-danger">
              Monitoring
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              An unexpected app error was captured
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted">
              The UI hit an unrecovered state. Retry the route, and if the issue
              persists check the monitoring section in the app.
            </p>
            <pre className="mt-6 overflow-x-auto rounded-2xl bg-[#0f1e32] p-4 font-mono text-xs text-[#f4f0e8]">
              {error.message}
            </pre>
            <button
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong"
              onClick={reset}
              type="button"
            >
              Retry route
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
