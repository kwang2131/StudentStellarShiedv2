import type { UserRole, WalletProvider } from "@/types/study-bond";

export interface WalletConnectionResult {
  balance?: string | null;
  network: string;
  networkPassphrase: string;
  provider: WalletProvider;
  publicKey: string;
}

export interface WalletAdapter {
  connect(): Promise<WalletConnectionResult>;
  disconnect(): Promise<void>;
  getBalance(publicKey: string): Promise<string | null>;
  getNetwork(): Promise<{ network: string; networkPassphrase: string }>;
  isAvailable(): Promise<boolean>;
  provider: WalletProvider;
  signTransaction(
    xdr: string,
    address?: string,
  ): Promise<{ signedTxXdr: string; signerAddress?: string }>;
}

export interface PreparedWalletTransaction {
  action: string;
  contractAddress: string;
  sourceAddress: string;
  xdr: string;
}

export interface SubmittedTransactionResult {
  contractAddress?: string;
  errorMessage?: string;
  raw?: unknown;
  status?: string;
  success: boolean;
  txHash?: string;
}

export interface ContractInvocationContext {
  role: UserRole;
  sourceAddress: string;
  walletProvider: WalletProvider;
}
