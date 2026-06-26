import { AlertTriangle } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  description,
}: {
  title?: string;
  description: string;
}) {
  return (
    <div className="surface-panel rounded-[1.85rem] border border-danger/20 bg-[linear-gradient(135deg,rgba(201,60,60,0.06),rgba(255,255,255,0.92))] px-6 py-8">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-danger/12 p-3 text-danger">
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <h2 className="display-title text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
}
