import {
  getAddress,
  getNetwork,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

import { stellarConfig } from "@/lib/stellar/config";
import { getNativeBalance } from "@/lib/stellar/horizon-client";
import type { WalletAdapter } from "@/lib/stellar/types";

function unavailableMessage() {
  return "Freighter is not available in this browser. Install or unlock Freighter and switch to Stellar testnet.";
}

export const freighterAdapter: WalletAdapter = {
  provider: "FREIGHTER",
  async isAvailable() {
    const result = await isConnected();
    return !result.error && Boolean(result.isConnected);
  },
  async connect() {
    const available = await this.isAvailable();

    if (!available) {
      throw new Error(unavailableMessage());
    }

    const access = await requestAccess();

    if (access.error || !access.address) {
      throw new Error(access.error?.message || "Freighter did not return a wallet address.");
    }

    const network = await this.getNetwork();
    const balance = await this.getBalance(access.address);

    return {
      balance,
      network: network.network,
      networkPassphrase: network.networkPassphrase,
      provider: "FREIGHTER",
      publicKey: access.address,
    };
  },
  async disconnect() {
    // Freighter manages connection state inside the extension. Clearing local session is enough here.
  },
  async getNetwork() {
    const response = await getNetwork();

    if (response.error) {
      return {
        network: stellarConfig.network,
        networkPassphrase: stellarConfig.networkPassphrase,
      };
    }

    return {
      network: response.network || stellarConfig.network,
      networkPassphrase: response.networkPassphrase || stellarConfig.networkPassphrase,
    };
  },
  async signTransaction(xdr, address) {
    const response = await signTransaction(xdr, {
      address,
      networkPassphrase: stellarConfig.networkPassphrase,
    });

    if (response.error || !response.signedTxXdr) {
      throw new Error(response.error?.message || "Freighter failed to sign the transaction.");
    }

    return {
      signedTxXdr: response.signedTxXdr,
      signerAddress: response.signerAddress,
    };
  },
  async getBalance(publicKey) {
    const response = await getAddress();
    const address = response.error ? publicKey : response.address || publicKey;
    return getNativeBalance(address);
  },
};
