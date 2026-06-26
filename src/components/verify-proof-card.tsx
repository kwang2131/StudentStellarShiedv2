import { StatusBadge } from "@/components/status-badge";
import { TransactionHashLink } from "@/components/transaction-hash-link";
import { STELLAR_TESTNET_DISCLAIMER } from "@/lib/constants";
import { formatDate, formatMoney, truncateAddress } from "@/lib/utils";

export function VerifyProofCard({
  amount,
  assetCode,
  auditCount,
  contractAddress,
  expiryDate,
  fundTxHash,
  lastContractState,
  onchainCaseId,
  status,
  studentWalletAddress,
  verifierName,
}: {
  amount: string;
  assetCode: string;
  auditCount: number;
  contractAddress?: string | null;
  expiryDate: string;
  fundTxHash?: string | null;
  lastContractState?: Record<string, unknown> | null;
  onchainCaseId: string;
  status: Parameters<typeof StatusBadge>[0]["status"];
  studentWalletAddress: string;
  verifierName: string;
}) {
  return (
    <article className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-white p-6 shadow-[0_24px_70px_rgba(15,30,50,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">
            Public verification
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">StudyBond proof</h1>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Fact label="Amount locked" value={formatMoney(amount, assetCode, 2)} />
        <Fact label="Verifier" value={verifierName} />
        <Fact label="Student wallet" value={truncateAddress(studentWalletAddress, 6)} />
        <Fact label="Expiry" value={formatDate(expiryDate)} />
        <Fact label="Case hash" value={truncateAddress(onchainCaseId, 8)} />
        <Fact label="Contract id" value={truncateAddress(contractAddress, 8)} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <TransactionHashLink hash={fundTxHash} label="Funding transaction" />
        <span className="rounded-full bg-surface px-3 py-1 text-sm text-muted">
          Public-safe audit entries: {auditCount}
        </span>
      </div>

      {lastContractState ? (
        <pre className="mt-6 overflow-x-auto rounded-[1.5rem] bg-foreground p-4 text-xs text-white/82">
          {JSON.stringify(lastContractState, null, 2)}
        </pre>
      ) : null}

      <p className="mt-6 text-sm text-muted">{STELLAR_TESTNET_DISCLAIMER}</p>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold break-all">{value}</p>
    </div>
  );
}
