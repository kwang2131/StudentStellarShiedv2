import { LoaderCircle } from "lucide-react";

export function LoadingState({
  title = "Loading StudyBond data",
  description = "Pulling the latest case, analytics, and testnet context.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="surface-panel flex min-h-64 flex-col items-center justify-center rounded-[1.85rem] border border-dashed px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
        <LoaderCircle className="size-7 animate-spin text-brand" />
      </div>
      <h2 className="display-title mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted">{description}</p>
      <div className="mt-6 w-full max-w-sm space-y-3">
        <div className="h-3 animate-pulse rounded-full bg-brand-soft/70" />
        <div className="h-3 animate-pulse rounded-full bg-brand-soft/50" />
        <div className="mx-auto h-3 w-2/3 animate-pulse rounded-full bg-brand-soft/45" />
      </div>
    </div>
  );
}
