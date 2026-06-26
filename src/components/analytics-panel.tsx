import { eventLabel, formatDate, formatNumber, providerLabel } from "@/lib/utils";

export function AnalyticsPanel({
  conversionFunnel,
  eventCounts,
  providerSplit,
  recentEvents,
  summary,
}: {
  conversionFunnel: Array<{ label: string; value: number }>;
  eventCounts: Array<{ eventName: string; value: number }>;
  providerSplit: Record<string, number>;
  recentEvents: Array<{
    createdAt: Date;
    eventName: string;
    id: string;
    path?: string | null;
    walletAddress?: string | null;
  }>;
  summary: {
    bondFundedCount: number;
    caseCreatedCount: number;
    contractInteractions: number;
    feedbackSubmitted: number;
    pageViews: number;
    releaseRefundDisputeCount: number;
    walletConnects: number;
  };
}) {
  const topFunnel = Math.max(...conversionFunnel.map((item) => item.value), 1);
  const topEvent = Math.max(...eventCounts.map((item) => item.value), 1);
  const providerTotal = Math.max(
    Object.values(providerSplit).reduce((total, value) => total + value, 0),
    1,
  );

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MiniMetric label="Page views" value={summary.pageViews} />
        <MiniMetric label="Wallet connects" value={summary.walletConnects} />
        <MiniMetric label="Contract interactions" value={summary.contractInteractions} />
        <MiniMetric label="Cases created" value={summary.caseCreatedCount} />
        <MiniMetric label="Bonds funded" value={summary.bondFundedCount} />
        <MiniMetric label="Feedback submitted" value={summary.feedbackSubmitted} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel orb-ring rounded-[1.85rem] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="display-eyebrow text-[11px] text-muted">Conversion path</p>
              <h3 className="display-title mt-2 text-xl font-semibold">Conversion funnel</h3>
            </div>
            <span className="rounded-full border border-brand/12 bg-brand-soft/65 px-3 py-1 text-xs font-semibold text-brand-ink">
              {formatNumber(summary.walletConnects)} wallet connects
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {conversionFunnel.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-semibold">{formatNumber(item.value)}</span>
                </div>
                <div className="h-3 rounded-full bg-brand-soft">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${(item.value / topFunnel) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel rounded-[1.85rem] p-5">
          <p className="display-eyebrow text-[11px] text-muted">Wallet behavior</p>
          <h3 className="display-title mt-2 text-xl font-semibold">Wallet provider split</h3>
          <div className="mt-5 space-y-3">
            {Object.entries(providerSplit).length === 0 ? (
              <p className="text-sm text-muted">No provider interactions recorded yet.</p>
            ) : (
              Object.entries(providerSplit).map(([provider, count]) => (
                <div
                  key={provider}
                  className="rounded-[1.45rem] border border-border bg-white/76 px-4 py-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-foreground">{providerLabel(provider as never)}</span>
                    <span className="font-semibold text-brand-ink">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-brand-soft/70">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(135deg,var(--brand),var(--accent))]"
                      style={{ width: `${(count / providerTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="surface-panel rounded-[1.85rem] p-5">
          <p className="display-eyebrow text-[11px] text-muted">Event telemetry</p>
          <h3 className="display-title mt-2 text-xl font-semibold">Event volumes</h3>
          <div className="mt-5 space-y-4">
            {eventCounts.map((item) => (
              <div key={item.eventName}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{eventLabel(item.eventName as never)}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(135deg,#081427,#0059c7)]"
                    style={{ width: `${(item.value / topEvent) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel rounded-[1.85rem] p-5">
          <p className="display-eyebrow text-[11px] text-muted">Audit trail</p>
          <h3 className="display-title mt-2 text-xl font-semibold">Recent events</h3>
          <div className="mt-5 space-y-3">
            {recentEvents.map((item) => (
              <article key={item.id} className="rounded-[1.45rem] border border-border bg-white/78 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{eventLabel(item.eventName as never)}</p>
                  <p className="text-xs text-muted">{formatDate(item.createdAt)}</p>
                </div>
                <p className="mt-1 text-sm text-muted">{item.path || item.walletAddress || "No path"}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-panel rounded-[1.5rem] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="display-title mt-2 text-2xl font-semibold">{formatNumber(value)}</p>
    </div>
  );
}
