"use client";

import { LoaderCircle, RefreshCw, Unplug, Wallet2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/wallet-provider";

export function WalletConnectButton() {
  const { connect, connecting, disconnect, provider, refreshBalance, session } = useWallet();

  if (session) {
    return (
      <div className="glass-panel flex items-center gap-2 rounded-full border border-white/80 p-1">
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
    <Button
      className="min-w-[208px]"
      disabled={connecting}
      onClick={() => void connect(provider)}
      variant="primary"
    >
      {connecting ? <LoaderCircle className="size-4 animate-spin" /> : <Wallet2 className="size-4" />}
      {connecting ? "Connecting wallet..." : `Connect ${provider === "FREIGHTER" ? "Freighter" : "Rabet"}`}
    </Button>
  );
}
