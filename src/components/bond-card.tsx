import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { TransactionHashLink } from "@/components/transaction-hash-link";
import { formatMoney, formatRelativeDate, truncateAddress } from "@/lib/utils";

interface BondCardProps {
  amount: string;
  assetCode: string;
  caseType: string;
  createdAt: string;
  fundTxHash?: string | null;
  id: string;
  status: Parameters<typeof StatusBadge>[0]["status"];
  studentName: string;
  studentWalletAddress: string;
  targetCountry: string;
  verifierName: string;
}

export function BondCard({
  amount,
  assetCode,
  caseType,
  createdAt,
  fundTxHash,
  id,
  status,
  studentName,
  studentWalletAddress,
  targetCountry,
  verifierName,
}: BondCardProps) {
  return (
    <article className="surface-panel rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            {caseType.replaceAll("_", " ")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{studentName}</h2>
          <p className="mt-2 text-sm text-muted">
            {truncateAddress(studentWalletAddress, 6)} · verified by {verifierName}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.25rem] bg-brand-soft/55 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Locked amount</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatMoney(amount, assetCode, 2)}
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-border bg-white/75 p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
            <MapPinned className="size-4" />
            Destination
          </p>
          <p className="mt-2 text-lg font-semibold">{targetCountry}</p>
          <p className="mt-1 text-sm text-muted">Created {formatRelativeDate(createdAt)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <TransactionHashLink hash={fundTxHash} label="Funding tx" />
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand"
          href={`/bonds/${id}`}
        >
          Open case
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
