"use client";

import { RefreshCw, Unplug, Wallet2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/wallet-provider";

export function WalletConnectButton() {
  const { connect, connecting, disconnect, provider, refreshBalance, session } = useWallet();

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <Button
          className="rounded-full"
          onClick={() => void refreshBalance()}
          size="sm"
          variant="ghost"
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
        <Button
          className="rounded-full"
          onClick={() => void disconnect()}
          size="sm"
          variant="secondary"
        >
          <Unplug className="size-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => void connect(provider)} variant="primary">
      <Wallet2 className="size-4" />
      {connecting ? "Connecting..." : `Connect ${provider === "FREIGHTER" ? "Freighter" : "Rabet"}`}
    </Button>
  );
}
