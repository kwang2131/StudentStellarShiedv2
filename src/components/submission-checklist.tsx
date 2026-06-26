import { CheckCircle2, CircleDashed } from "lucide-react";

export function SubmissionChecklist({
  checklist,
}: {
  checklist: Array<{
    complete: boolean;
    detail: string;
    id: string;
    label: string;
  }>;
}) {
  return (
    <div className="space-y-4">
      {checklist.map((item) => (
        <article
          key={item.id}
          className={`rounded-[1.75rem] border p-5 ${
            item.complete
              ? "border-success/20 bg-success/5"
              : "border-border bg-white"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`rounded-full p-2 ${item.complete ? "bg-success/12 text-success" : "bg-surface text-muted"}`}>
              {item.complete ? <CheckCircle2 className="size-5" /> : <CircleDashed className="size-5" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{item.label}</h3>
              <p className="mt-2 text-sm text-muted">{item.detail}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
