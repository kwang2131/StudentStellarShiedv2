"use client";

import { BellDot } from "lucide-react";

import { NetworkBadge } from "@/components/network-badge";
import { RoleSwitcher } from "@/components/role-switcher";
import { useWallet } from "@/components/providers/wallet-provider";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { WalletProviderBadge } from "@/components/wallet-provider-badge";
import { truncateAddress } from "@/lib/utils";

export function Topbar() {
  const { error, networkMismatch, provider, session } = useWallet();

  return (
    <header className="sticky top-0 z-30 rounded-t-[2rem] border-b border-white/80 bg-white/75 px-4 py-4 backdrop-blur-xl md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
            Stellar testnet operations
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Operating surface for StudyBond reviewers and users
          </h2>
          {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <RoleSwitcher />
            <NetworkBadge mismatch={networkMismatch} network={session?.network} />
            <WalletConnectButton />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {session ? (
              <>
                <WalletProviderBadge provider={provider} />
                <span className="rounded-full border border-border bg-white px-3 py-1">
                  {truncateAddress(session.publicKey, 6)}
                </span>
                <span className="rounded-full border border-border bg-white px-3 py-1">
                  {session.balance ? `${session.balance} XLM` : "Balance unavailable"}
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1">
                <BellDot className="size-4 text-brand" />
                No wallet connected
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
