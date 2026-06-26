"use client";

import { BellDot } from "lucide-react";

import { getRoleExperience } from "@/components/navigation";
import { NetworkBadge } from "@/components/network-badge";
import { RoleSwitcher } from "@/components/role-switcher";
import { useWallet } from "@/components/providers/wallet-provider";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { WalletProviderBadge } from "@/components/wallet-provider-badge";
import { truncateAddress } from "@/lib/utils";

export function Topbar() {
  const { error, networkMismatch, provider, role, session } = useWallet();
  const experience = getRoleExperience(role);
  const RoleIcon = experience.icon;

  return (
    <header className="sticky top-0 z-30 rounded-t-[2.25rem] border-b border-white/80 bg-white/75 px-4 py-4 backdrop-blur-xl md:px-7 xl:px-9">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="display-eyebrow text-xs text-muted">
            Role-aware Stellar workspace
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
              <RoleIcon className="size-5" />
            </span>
            <h2 className="display-title text-2xl font-semibold text-foreground">
              {experience.label} command deck
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted">{experience.menuHint}</p>
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
                <span className="rounded-full border border-border bg-white px-3 py-1 shadow-[0_8px_20px_rgba(8,20,42,0.06)]">
                  {truncateAddress(session.publicKey, 6)}
                </span>
                <span className="rounded-full border border-border bg-white px-3 py-1 shadow-[0_8px_20px_rgba(8,20,42,0.06)]">
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
