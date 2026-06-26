import { formatDate, roleLabel } from "@/lib/utils";

interface EvidenceItem {
  category: string;
  createdAt: string;
  description?: string | null;
  fileHash: string;
  fileName: string;
  fileUrl: string;
  id: string;
  relatedCondition?: string | null;
  uploadedByRole: string;
  uploadedByWallet: string;
}

export function EvidenceList({ evidence }: { evidence: EvidenceItem[] }) {
  return (
    <div className="space-y-4">
      {evidence.map((item) => (
        <article key={item.id} className="surface-panel rounded-[1.5rem] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                {item.category.replaceAll("_", " ")}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{item.fileName}</h3>
              <p className="mt-1 text-sm text-muted">
                {roleLabel(item.uploadedByRole as never)} · {item.uploadedByWallet}
              </p>
            </div>
            <p className="text-sm text-muted">{formatDate(item.createdAt)}</p>
          </div>
          {item.description ? <p className="mt-3 text-sm text-foreground">{item.description}</p> : null}
          <p className="mt-3 break-all rounded-2xl bg-surface px-3 py-2 font-mono text-xs text-muted">
            {item.fileHash}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <a
              className="text-sm font-semibold text-brand"
              href={item.fileUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open metadata source
            </a>
            {item.relatedCondition ? (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                {item.relatedCondition}
              </span>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
