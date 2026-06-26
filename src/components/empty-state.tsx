import Link from "next/link";
import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  actionHref,
  actionLabel,
  description,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
}) {
  return (
    <div className="surface-panel rounded-[1.75rem] border border-dashed px-6 py-10 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Inbox className="size-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Link href={actionHref}>
            <Button>{actionLabel}</Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
