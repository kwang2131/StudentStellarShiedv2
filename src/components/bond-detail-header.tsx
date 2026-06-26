import { Wallet } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { TransactionHashLink } from "@/components/transaction-hash-link";
import { formatDate, formatMoney, truncateAddress } from "@/lib/utils";

interface BondDetailHeaderProps {
  amount: string;
  assetCode: string;
  caseType: string;
  contractAddress?: string | null;
  expiryDate: string;
  fundTxHash?: string | null;
  initializeTxHash?: string | null;
  payerWalletAddress?: string | null;
  status: Parameters<typeof StatusBadge>[0]["status"];
  studentName: string;
  studentWalletAddress: string;
  verifierName: string;
  verifierWalletAddress: string;
}

export function BondDetailHeader(props: BondDetailHeaderProps) {
  return (
    <section className="grid gap-5 rounded-[2rem] bg-white px-6 py-6 shadow-[0_20px_60px_rgba(15,30,50,0.08)] lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            {props.caseType.replaceAll("_", " ")}
          </p>
          <StatusBadge status={props.status} />
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{props.studentName}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Funding proof is tied to {truncateAddress(props.studentWalletAddress, 6)} and reviewed by{" "}
          {props.verifierName} ({truncateAddress(props.verifierWalletAddress, 6)}).
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-brand-soft/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Bond amount</p>
            <p className="mt-2 text-3xl font-semibold">
              {formatMoney(props.amount, props.assetCode, 2)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Expiry</p>
            <p className="mt-2 text-lg font-semibold">{formatDate(props.expiryDate)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-foreground p-3 text-white">
            <Wallet className="size-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Counterparties</p>
            <p className="text-sm font-semibold text-foreground">
              Student · Verifier · Mediator
            </p>
          </div>
        </div>

        <dl className="mt-5 space-y-4 text-sm">
          <SummaryRow label="Student wallet" value={truncateAddress(props.studentWalletAddress, 6)} />
          <SummaryRow label="Payer wallet" value={truncateAddress(props.payerWalletAddress, 6)} />
          <SummaryRow label="Verifier" value={props.verifierName} />
          <SummaryRow label="Contract address" value={truncateAddress(props.contractAddress, 6)} />
        </dl>

        <div className="mt-6 space-y-3">
          <TransactionHashLink hash={props.initializeTxHash} label="Initialize transaction" />
          <TransactionHashLink hash={props.fundTxHash} label="Funding transaction" />
        </div>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
