import { StatusBadge } from "@/components/status-badge";
import { TransactionHashLink } from "@/components/transaction-hash-link";
import { WalletProviderBadge } from "@/components/wallet-provider-badge";
import { formatDate, roleLabel, truncateAddress } from "@/lib/utils";

interface ProofRow {
  action: string;
  contractAddress?: string | null;
  createdAt: string;
  errorMessage?: string | null;
  id: string;
  role: string;
  success: boolean;
  txHash?: string | null;
  walletAddress: string;
  walletProvider: "FREIGHTER" | "RABET" | "CLI" | "MOCK";
}

export function WalletProofTable({
  interactions,
  summary,
}: {
  interactions: ProofRow[];
  summary: {
    failed: number;
    successful: number;
    total: number;
    uniqueWallets: number;
  };
}) {
  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <MiniStat label="Total proofs" value={String(summary.total)} />
        <MiniStat label="Successful" value={String(summary.successful)} />
        <MiniStat label="Failed" value={String(summary.failed)} />
        <MiniStat label="Unique wallets" value={String(summary.uniqueWallets)} />
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white">
        <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-border px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted lg:grid">
          <span>Wallet</span>
          <span>Provider</span>
          <span>Role</span>
          <span>Action</span>
          <span>Transaction</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-border">
          {interactions.map((item) => (
            <article key={item.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold">{truncateAddress(item.walletAddress, 6)}</p>
                <p className="mt-1 text-xs text-muted">{formatDate(item.createdAt)}</p>
              </div>
              <WalletProviderBadge provider={item.walletProvider} />
              <span className="text-sm text-muted">{roleLabel(item.role as never)}</span>
              <span className="text-sm font-medium text-foreground">{item.action.replaceAll("_", " ")}</span>
              <TransactionHashLink hash={item.txHash} />
              <div className="space-y-2">
                <StatusBadge status={item.success ? "RELEASED" : "DISPUTED"} />
                {item.errorMessage ? (
                  <p className="text-xs text-danger">{item.errorMessage}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel rounded-[1.5rem] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
