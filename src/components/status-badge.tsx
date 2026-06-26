import type { CaseStatus } from "@/types/study-bond";
import { cn, eventLabel, statusTone } from "@/lib/utils";

const toneClassMap = {
  danger: "bg-danger/12 text-danger border-danger/20",
  neutral: "bg-foreground/6 text-foreground border-border",
  success: "bg-success/12 text-success border-success/20",
  warning: "bg-warning/12 text-warning border-warning/20",
} as const;

export function StatusBadge({ status }: { status: CaseStatus }) {
  const tone = statusTone(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.18em]",
        toneClassMap[tone],
      )}
    >
      {eventLabel(status as never)}
    </span>
  );
}
