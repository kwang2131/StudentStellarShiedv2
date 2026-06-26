import { ExternalLink } from "lucide-react";

import { transactionExplorerUrl } from "@/lib/stellar/explorer";
import { truncateAddress } from "@/lib/utils";

export function TransactionHashLink({
  hash,
  label,
}: {
  hash?: string | null;
  label?: string;
}) {
  if (!hash) {
    return <span className="text-sm text-muted">Pending</span>;
  }

  const href = transactionExplorerUrl(hash);

  return (
    <a
      className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-strong"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label || truncateAddress(hash, 6)}
      <ExternalLink className="size-4" />
    </a>
  );
}
