import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";

import { stellarConfig } from "@/lib/stellar/config";
import { getNativeBalance } from "@/lib/stellar/horizon-client";
import { initializeWalletKit, selectWallet } from "@/lib/stellar/wallet-kit";
import type { WalletAdapter } from "@/lib/stellar/types";

const moduleInstance = new FreighterModule();

export const freighterAdapter: WalletAdapter = {
  provider: "FREIGHTER",
  async isAvailable() {
    return moduleInstance.isAvailable();
  },
  async connect() {
    initializeWalletKit();
    await selectWallet("FREIGHTER");
    const { address } = await StellarWalletsKit.fetchAddress();
    const network = await this.getNetwork();
    const balance = await this.getBalance(address);

    return {
      balance,
      network: network.network,
      networkPassphrase: network.networkPassphrase,
      provider: "FREIGHTER",
      publicKey: address,
    };
  },
  async disconnect() {
    await StellarWalletsKit.disconnect();
  },
  async getNetwork() {
    try {
      return await moduleInstance.getNetwork();
    } catch {
      return {
        network: stellarConfig.network,
        networkPassphrase: stellarConfig.networkPassphrase,
      };
    }
  },
  async signTransaction(xdr, address) {
    await selectWallet("FREIGHTER");
    return StellarWalletsKit.signTransaction(xdr, {
      address,
      networkPassphrase: stellarConfig.networkPassphrase,
    });
  },
  async getBalance(publicKey) {
    return getNativeBalance(publicKey);
  },
};
