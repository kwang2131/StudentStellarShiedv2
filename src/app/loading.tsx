export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="surface-panel w-full max-w-xl rounded-[28px] p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          StudyBond
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Loading testnet workspace
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Syncing wallet state, dashboard metrics, and on-chain proof context.
        </p>
      </div>
    </main>
  );
}
