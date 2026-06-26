import { ArrowUpRight } from "lucide-react";

import { formatNumber } from "@/lib/utils";

export function MetricCard({
  accent,
  hint,
  label,
  value,
}: {
  accent?: string;
  hint?: string;
  label: string;
  value: number | string;
}) {
  return (
    <article className="surface-panel rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
        </div>
        <div className="rounded-full bg-brand-soft p-2 text-brand">
          <ArrowUpRight className="size-4" />
        </div>
      </div>
      {(hint || accent) && (
        <p className="mt-4 text-sm text-muted">
          {accent ? <span className="font-semibold text-brand">{accent} </span> : null}
          {hint}
        </p>
      )}
    </article>
  );
}
