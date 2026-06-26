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
    <article className="surface-panel orb-ring rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            {label}
          </p>
          <p className="display-title mt-3 text-3xl font-semibold text-foreground">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
        </div>
        <div className="rounded-full bg-[linear-gradient(135deg,var(--brand-soft),rgba(0,194,168,0.18))] p-2 text-brand">
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
