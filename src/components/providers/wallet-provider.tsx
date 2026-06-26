"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react";

import { fetchJson } from "@/lib/client/fetch-json";
import { stellarConfig } from "@/lib/stellar/config";
import { freighterAdapter } from "@/lib/stellar/freighter-adapter";
import { rabetAdapter } from "@/lib/stellar/rabet-adapter";
import type { WalletConnectionResult } from "@/lib/stellar/types";
import type { UserRole, WalletProvider } from "@/types/study-bond";

const STORAGE_KEY = "studybond.wallet.preferences";

const adapters = {
  FREIGHTER: freighterAdapter,
  RABET: rabetAdapter,
} as const;

type SupportedWalletProvider = keyof typeof adapters;

function isSupportedWalletProvider(value: WalletProvider): value is SupportedWalletProvider {
  return value === "FREIGHTER" || value === "RABET";
}

function readStoredPreferences() {
  if (typeof window === "undefined") {
    return {
      provider: "FREIGHTER" as SupportedWalletProvider,
      role: "STUDENT" as UserRole,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        provider: "FREIGHTER" as SupportedWalletProvider,
        role: "STUDENT" as UserRole,
      };
    }

    const parsed = JSON.parse(raw) as { provider?: WalletProvider; role?: UserRole };

    return {
      provider:
        parsed.provider === "FREIGHTER" || parsed.provider === "RABET"
          ? parsed.provider
          : ("FREIGHTER" as SupportedWalletProvider),
      role: parsed.role ?? ("STUDENT" as UserRole),
    };
  } catch {
    return {
      provider: "FREIGHTER" as SupportedWalletProvider,
      role: "STUDENT" as UserRole,
    };
  }
}

interface WalletContextValue {
  available: Partial<Record<SupportedWalletProvider, boolean>>;
  connecting: boolean;
  error: string | null;
  networkMismatch: boolean;
  provider: SupportedWalletProvider;
  role: UserRole;
  session: WalletConnectionResult | null;
  connect: (provider?: SupportedWalletProvider) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  setProvider: (provider: SupportedWalletProvider) => void;
  setRole: (role: UserRole) => void;
  signTransaction: (
    xdr: string,
    address?: string,
  ) => Promise<{ signedTxXdr: string; signerAddress?: string }>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

async function trackClientEvent(body: Record<string, unknown>) {
  try {
    await fetchJson("/api/analytics", {
      body: JSON.stringify(body),
      method: "POST",
    });
  } catch {
    // Analytics should not block the product workflow.
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [preferences] = useState(readStoredPreferences);
  const [role, setRole] = useState<UserRole>(preferences.role);
  const [provider, setProvider] = useState<SupportedWalletProvider>(preferences.provider);
  const [session, setSession] = useState<WalletConnectionResult | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState<Partial<Record<SupportedWalletProvider, boolean>>>({
    FREIGHTER: false,
    RABET: false,
  });

  const persistPreferences = useEffectEvent((nextRole: UserRole, nextProvider: SupportedWalletProvider) => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        provider: nextProvider,
        role: nextRole,
      }),
    );
  });

  useEffect(() => {
    persistPreferences(role, provider);
  }, [provider, role]);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      const results = await Promise.all([
        freighterAdapter.isAvailable().catch(() => false),
        rabetAdapter.isAvailable().catch(() => false),
      ]);

      if (cancelled) {
        return;
      }

      startTransition(() => {
        setAvailable({
          FREIGHTER: results[0],
          RABET: results[1],
        });
      });
    }

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, []);

  const connect = async (nextProvider = provider) => {
    const adapter = adapters[nextProvider];
    setConnecting(true);
    setError(null);

    await trackClientEvent({
      eventName: "WALLET_CONNECT_CLICKED",
      role,
      walletProvider: nextProvider,
      path: "/onboarding",
    });

    try {
      const installed = await adapter.isAvailable();
      if (!installed) {
        throw new Error(`${nextProvider} is not installed in this browser.`);
      }

      const result = await adapter.connect();
      startTransition(() => {
        setProvider(nextProvider);
        setSession(result);
      });

      await trackClientEvent({
        eventName: "WALLET_CONNECTED",
        path: "/onboarding",
        role,
        walletAddress: result.publicKey,
        walletProvider: nextProvider,
      });
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Wallet connection failed.";

      setError(message);
      setSession(null);

      await trackClientEvent({
        eventName: "WALLET_CONNECTION_FAILED",
        path: "/onboarding",
        role,
        walletProvider: nextProvider,
        metadata: {
          error: message,
        },
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!session || !isSupportedWalletProvider(session.provider)) {
      return;
    }

    await adapters[session.provider].disconnect().catch(() => undefined);
    const walletAddress = session.publicKey;
    setSession(null);
    setError(null);

    await trackClientEvent({
      eventName: "WALLET_DISCONNECTED",
      path: "/onboarding",
      role,
      walletAddress,
      walletProvider: provider,
    });
  };

  const signTransaction = async (xdr: string, address?: string) => {
    const activeProvider = session?.provider === "FREIGHTER" || session?.provider === "RABET"
      ? session.provider
      : provider;
    return adapters[activeProvider].signTransaction(xdr, address);
  };

  const refreshBalance = async () => {
    if (!session || !isSupportedWalletProvider(session.provider)) {
      return;
    }

    try {
      const balance = await adapters[session.provider].getBalance(session.publicKey);
      startTransition(() => {
        setSession({
          ...session,
          balance: balance ?? undefined,
        });
      });
    } catch {
      // Ignore transient balance refresh failures.
    }
  };

  const networkMismatch =
    !!session && session.networkPassphrase !== stellarConfig.networkPassphrase;

  const value: WalletContextValue = {
    available,
    connect,
    connecting,
    disconnect,
    error,
    networkMismatch,
    provider,
    refreshBalance,
    role,
    session,
    setProvider,
    setRole,
    signTransaction,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider.");
  }

  return context;
}
