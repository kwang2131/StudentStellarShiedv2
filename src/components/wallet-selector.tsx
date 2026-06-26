"use client";

import { AlertCircle, CheckCircle2, Download } from "lucide-react";

import { useWallet } from "@/components/providers/wallet-provider";
import { fetchJson } from "@/lib/client/fetch-json";
import { WALLET_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function WalletSelector() {
  const { available, provider, role, setProvider } = useWallet();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {WALLET_OPTIONS.map((item) => {
        const isActive = provider === item.value;
        const installed = available[item.value] ?? false;

        return (
          <button
            key={item.value}
            className={cn(
              "surface-panel orb-ring rounded-[1.6rem] p-5 text-left transition duration-200 hover:-translate-y-0.5",
              isActive && "border-brand bg-brand-soft/40 shadow-[0_18px_44px_rgba(0,89,199,0.16)]",
            )}
            onClick={() => {
              setProvider(item.value);
              void fetchJson("/api/analytics", {
                body: JSON.stringify({
                  eventName: "WALLET_PROVIDER_SELECTED",
                  path: "/onboarding",
                  role,
                  walletProvider: item.value,
                }),
                method: "POST",
              }).catch(() => undefined);
            }}
            type="button"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="display-eyebrow text-xs text-muted">
                  {item.shortLabel}
                </p>
                <h3 className="display-title mt-2 text-xl font-semibold">{item.label}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {installed
                    ? "Extension detected in this browser."
                    : "Extension not detected. Install before using live signing."}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                  installed
                    ? "bg-success/12 text-success"
                    : "bg-warning/12 text-warning",
                )}
              >
                {installed ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <AlertCircle className="size-4" />
                )}
                {installed ? "Installed" : "Install required"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-white/75 px-3 py-1 text-xs font-semibold text-muted">
                Browser extension
              </span>
              <span className="rounded-full border border-border bg-white/75 px-3 py-1 text-xs font-semibold text-muted">
                Live Stellar signing
              </span>
              <span className="rounded-full border border-border bg-white/75 px-3 py-1 text-xs font-semibold text-muted">
                Testnet compatible
              </span>
            </div>

            {!installed ? (
              <a
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand"
                href={item.installUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Download className="size-4" />
                Install {item.label}
              </a>
            ) : (
              <p className="mt-4 text-sm font-semibold text-brand-ink">
                Ready for wallet connection and contract signing.
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
