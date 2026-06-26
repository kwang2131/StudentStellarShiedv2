const TESTNET_EXPLORER_BASE_URL = "https://stellar.expert/explorer/testnet";

export function transactionExplorerUrl(txHash?: string | null) {
  return txHash ? `${TESTNET_EXPLORER_BASE_URL}/tx/${txHash}` : undefined;
}

export function addressExplorerUrl(address?: string | null) {
  return address ? `${TESTNET_EXPLORER_BASE_URL}/account/${address}` : undefined;
}

export function contractExplorerUrl(contractId?: string | null) {
  return contractId ? `${TESTNET_EXPLORER_BASE_URL}/contract/${contractId}` : undefined;
}
