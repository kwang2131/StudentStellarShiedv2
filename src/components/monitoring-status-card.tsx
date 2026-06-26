import { formatDate } from "@/lib/utils";

export function MonitoringStatusCard({
  overview,
}: {
  overview: {
    apiErrorCount: number;
    contractErrorCount: number;
    recentErrors: Array<{
      createdAt: Date;
      id: string;
      message: string;
      scope: string;
    }>;
    totalErrors: number;
    walletErrorCount: number;
  };
}) {
  return (
    <section className="surface-panel rounded-[1.85rem] p-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Total errors" value={String(overview.totalErrors)} />
        <Stat label="Wallet errors" value={String(overview.walletErrorCount)} />
        <Stat label="API errors" value={String(overview.apiErrorCount)} />
        <Stat label="Contract errors" value={String(overview.contractErrorCount)} />
      </div>

      <div className="mt-5 space-y-3">
        {overview.recentErrors.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.45rem] border border-danger/15 bg-[linear-gradient(135deg,rgba(201,60,60,0.04),rgba(255,255,255,0.92))] px-4 py-3"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-foreground">{item.scope}</p>
              <p className="text-xs text-muted">{formatDate(item.createdAt)}</p>
            </div>
            <p className="mt-1 text-sm text-muted">{item.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-white/78 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="display-title mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
