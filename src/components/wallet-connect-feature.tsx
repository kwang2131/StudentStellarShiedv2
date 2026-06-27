"use client";

import { Network, ShieldCheck, Wallet2 } from "lucide-react";

import { NetworkBadge } from "@/components/network-badge";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { WalletSelector } from "@/components/wallet-selector";
import { useWallet } from "@/components/providers/wallet-provider";
import { truncateAddress } from "@/lib/utils";

export function WalletConnectFeature() {
  const { available, error, networkMismatch, session } = useWallet();
  const detectedWallets = Object.values(available).filter(Boolean).length;

  return (
    <section className="surface-panel rounded-[1.75rem] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Connect wallet feature</p>
          <h2 className="mt-2 text-2xl font-semibold">Real browser wallet connection</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
            Reviewers can connect Freighter or Rabet, switch networks, and sign prepared Soroban
            XDR transactions through the same frontend flow used by the case detail page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NetworkBadge mismatch={networkMismatch} network={session?.network} />
          <WalletConnectButton />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={Wallet2}
          label="Detected wallets"
          value={`${detectedWallets}/2`}
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Signing mode"
          value={session ? "Live XDR signing" : "Ready after connect"}
        />
        <SummaryCard
          icon={Network}
          label="Current address"
          value={session ? truncateAddress(session.publicKey, 6) : "Not connected"}
        />
      </div>

      {error ? (
        <div className="mt-5 rounded-[1.4rem] border border-danger/20 bg-danger/8 p-4 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="mt-5">
        <WalletSelector />
      </div>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-border bg-white/70 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
