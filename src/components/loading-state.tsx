import { LoaderCircle } from "lucide-react";

export function LoadingState({
  title = "Loading StudyBond data",
  description = "Pulling the latest case, analytics, and testnet context.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="surface-panel flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-dashed px-6 text-center">
      <LoaderCircle className="size-8 animate-spin text-brand" />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
    </div>
  );
}
