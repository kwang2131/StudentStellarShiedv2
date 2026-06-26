import { formatDate, roleLabel } from "@/lib/utils";

interface FeedbackSummaryProps {
  feedback: Array<{
    comment?: string | null;
    confusing: string;
    createdAt: string;
    id: string;
    rating: number;
    role: string;
    walletAddress?: string | null;
    workedWell: string;
    wouldUse: boolean;
  }>;
  summary: {
    averageRating: number;
    commonConfusionPoints: string[];
    commonPositives: string[];
    totalResponses: number;
    wouldUsePercentage: number;
  };
}

export function FeedbackSummary({ feedback, summary }: FeedbackSummaryProps) {
  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Responses" value={String(summary.totalResponses)} />
        <Metric label="Average rating" value={summary.averageRating.toFixed(1)} />
        <Metric label="Would use" value={`${summary.wouldUsePercentage}%`} />
        <Metric label="Top positive notes" value={String(summary.commonPositives.length)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ListPanel
          items={summary.commonPositives}
          title="Common positives"
        />
        <ListPanel
          items={summary.commonConfusionPoints}
          title="Common confusion points"
        />
      </div>

      <div className="space-y-4">
        {feedback.map((item) => (
          <article key={item.id} className="surface-panel rounded-[1.5rem] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{roleLabel(item.role as never)}</p>
                <p className="mt-1 text-xs text-muted">{formatDate(item.createdAt)}</p>
              </div>
              <div className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand">
                {item.rating}/5
              </div>
            </div>
            <p className="mt-4 text-sm text-foreground">
              <span className="font-semibold">Worked well:</span> {item.workedWell}
            </p>
            <p className="mt-2 text-sm text-foreground">
              <span className="font-semibold">Confusing:</span> {item.confusing}
            </p>
            {item.comment ? (
              <p className="mt-2 text-sm text-muted">{item.comment}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel rounded-[1.5rem] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ListPanel({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="surface-panel rounded-[1.75rem] p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted">No responses yet.</p>
        ) : (
          items.map((item) => (
            <p key={`${title}-${item}`} className="rounded-2xl bg-surface px-4 py-3 text-sm text-foreground">
              {item}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
