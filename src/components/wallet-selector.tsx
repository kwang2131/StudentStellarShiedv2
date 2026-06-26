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
              "surface-panel rounded-[1.5rem] p-5 text-left transition",
              isActive && "border-brand bg-brand-soft/50",
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
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  {item.shortLabel}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{item.label}</h3>
                <p className="mt-2 text-sm text-muted">
                  {installed
                    ? "Extension detected in this browser."
                    : "Extension not detected. Install before using live signing."}
                </p>
              </div>
              {installed ? (
                <CheckCircle2 className="size-5 text-success" />
              ) : (
                <AlertCircle className="size-5 text-warning" />
              )}
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
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
