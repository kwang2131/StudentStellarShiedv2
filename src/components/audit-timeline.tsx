import { TransactionHashLink } from "@/components/transaction-hash-link";
import { formatDate, roleLabel } from "@/lib/utils";

interface AuditItem {
  action: string;
  actorRole: string;
  actorWallet: string;
  createdAt: string;
  id: string;
  message: string;
  txHash?: string | null;
}

export function AuditTimeline({ logs }: { logs: AuditItem[] }) {
  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <article
          key={log.id}
          className="surface-panel relative rounded-[1.5rem] p-4 pl-6 before:absolute before:bottom-0 before:left-4 before:top-0 before:w-px before:bg-border"
        >
          <div className="absolute left-[11px] top-5 size-2.5 rounded-full bg-brand" />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{log.message}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                {roleLabel(log.actorRole as never)} · {log.action.replaceAll("_", " ")}
              </p>
            </div>
            <p className="text-sm text-muted">{formatDate(log.createdAt)}</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-surface px-3 py-1 text-muted">
              {log.actorWallet}
            </span>
            <TransactionHashLink hash={log.txHash} />
          </div>
        </article>
      ))}
    </div>
  );
}
