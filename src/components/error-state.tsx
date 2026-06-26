import { AlertTriangle } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  description,
}: {
  title?: string;
  description: string;
}) {
  return (
    <div className="surface-panel rounded-[1.75rem] border border-danger/20 bg-danger/5 px-6 py-8">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-danger/12 p-3 text-danger">
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-2 text-sm text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
}
