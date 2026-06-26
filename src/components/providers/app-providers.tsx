"use client";

import { Toaster } from "sonner";

import { PageViewTracker } from "@/components/page-view-tracker";
import { WalletProvider } from "@/components/providers/wallet-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <PageViewTracker />
      {children}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          className: "!border-border !bg-surface-strong !text-foreground",
        }}
      />
    </WalletProvider>
  );
}
