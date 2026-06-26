import { addressExplorerUrl } from "@/lib/stellar/explorer";
import { formatDate, roleLabel, truncateAddress } from "@/lib/utils";
import { WalletProviderBadge } from "@/components/wallet-provider-badge";

interface TestWalletRow {
  balance?: string | null;
  createdAt: string;
  funded: boolean;
  id: string;
  label: string;
  lastInteraction?: string | null;
  lastTxHash?: string | null;
  publicKey: string;
  suggestedRole: string;
  usedInApp: boolean;
  walletProvider?: "FREIGHTER" | "RABET" | "CLI" | "MOCK" | null;
}

export function TestWalletTable({ wallets }: { wallets: TestWalletRow[] }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white">
      <div className="hidden grid-cols-[1.1fr_1.6fr_1fr_1fr_1fr_1fr] gap-4 border-b border-border px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted lg:grid">
        <span>Label</span>
        <span>Public key</span>
        <span>Role</span>
        <span>Balance</span>
        <span>Usage</span>
        <span>Provider</span>
      </div>

      <div className="divide-y divide-border">
        {wallets.map((wallet) => (
          <article key={wallet.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1.1fr_1.6fr_1fr_1fr_1fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold">{wallet.label}</p>
              <p className="mt-1 text-xs text-muted">{formatDate(wallet.createdAt)}</p>
            </div>
            <a
              className="text-sm font-medium text-brand"
              href={addressExplorerUrl(wallet.publicKey)}
              rel="noreferrer"
              target="_blank"
            >
              {truncateAddress(wallet.publicKey, 8)}
            </a>
            <span className="text-sm text-muted">{roleLabel(wallet.suggestedRole as never)}</span>
            <span className="text-sm font-medium">{wallet.balance ?? "Unavailable"} XLM</span>
            <div className="text-sm text-muted">
              {wallet.usedInApp ? "Used in app" : "Not yet used"}
              {wallet.lastInteraction ? (
                <p className="mt-1 text-xs text-muted">{wallet.lastInteraction}</p>
              ) : null}
            </div>
            {wallet.walletProvider ? (
              <WalletProviderBadge provider={wallet.walletProvider} />
            ) : (
              <span className="text-sm text-muted">Not assigned</span>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
