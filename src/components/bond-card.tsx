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
    <article className="surface-panel orb-ring rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="display-eyebrow text-xs text-muted">
            {caseType.replaceAll("_", " ")}
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">{studentName}</h2>
          <p className="mt-2 text-sm text-muted">
            {truncateAddress(studentWalletAddress, 6)} · verified by {verifierName}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.35rem] bg-[linear-gradient(135deg,rgba(217,235,255,0.82),rgba(255,255,255,0.78))] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Locked amount</p>
          <p className="display-title mt-2 text-2xl font-semibold text-foreground">
            {formatMoney(amount, assetCode, 2)}
          </p>
        </div>
        <div className="rounded-[1.35rem] border border-border bg-white/80 p-4">
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
          className="inline-flex items-center gap-2 rounded-full border border-brand/14 bg-brand-soft/65 px-4 py-2 text-sm font-semibold text-brand-ink transition hover:border-brand/22 hover:bg-brand-soft"
          href={`/bonds/${id}`}
        >
          Open case
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
