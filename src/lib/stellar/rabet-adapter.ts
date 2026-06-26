import { stellarConfig } from "@/lib/stellar/config";
import { getNativeBalance } from "@/lib/stellar/horizon-client";
import type { WalletAdapter } from "@/lib/stellar/types";

function getRabet() {
  return typeof window === "undefined" ? undefined : window.rabet;
}

export const rabetAdapter: WalletAdapter = {
  provider: "RABET",
  async isAvailable() {
    return Boolean(getRabet());
  },
  async connect() {
    const rabet = getRabet();

    if (!rabet) {
      throw new Error("Rabet is not available in this browser. Install or unlock Rabet and switch to Stellar testnet.");
    }

    const response = await rabet.connect();
    const publicKey = response.publicKey?.trim();

    if (!publicKey) {
      throw new Error("Rabet did not return a wallet address.");
    }

    const balance = await this.getBalance(publicKey);

    return {
      balance,
      network: stellarConfig.network,
      networkPassphrase: stellarConfig.networkPassphrase,
      provider: "RABET",
      publicKey,
    };
  },
  async disconnect() {
    // Rabet manages connection state inside the extension. Clearing local session is enough here.
  },
  async getNetwork() {
    return {
      network: stellarConfig.network,
      networkPassphrase: stellarConfig.networkPassphrase,
    };
  },
  async signTransaction(xdr) {
    const rabet = getRabet();

    if (!rabet) {
      throw new Error("Rabet is not available in this browser.");
    }

    const response = await rabet.sign(xdr, "testnet");

    if (!response.xdr) {
      throw new Error("Rabet failed to sign the transaction.");
    }

    return {
      signedTxXdr: response.xdr,
    };
  },
  async getBalance(publicKey) {
    return getNativeBalance(publicKey);
  },
};
