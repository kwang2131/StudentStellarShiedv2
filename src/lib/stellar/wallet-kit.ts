import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { RABET_ID } from "@creit.tech/stellar-wallets-kit/modules/rabet";
import { Networks } from "@creit.tech/stellar-wallets-kit/types";

import type { WalletProvider } from "@/types/study-bond";

let initialized = false;

const supportedIds = new Set([FREIGHTER_ID, RABET_ID]);

export function walletModuleId(provider: WalletProvider) {
  switch (provider) {
    case "FREIGHTER":
      return FREIGHTER_ID;
    case "RABET":
      return RABET_ID;
    default:
      throw new Error(`Unsupported wallet provider ${provider}`);
  }
}

export function initializeWalletKit() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  StellarWalletsKit.init({
    modules: defaultModules({
      filterBy: (module) => supportedIds.has(module.productId),
    }),
  });

  StellarWalletsKit.setNetwork(Networks.TESTNET);
  initialized = true;
}

export async function selectWallet(provider: WalletProvider) {
  initializeWalletKit();
  StellarWalletsKit.setWallet(walletModuleId(provider));
}

export async function disconnectWallet() {
  initializeWalletKit();
  await StellarWalletsKit.disconnect();
}
