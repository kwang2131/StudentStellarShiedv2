import { publicEnv } from "@/lib/public-env";

export const stellarConfig = {
  appUrl: publicEnv.NEXT_PUBLIC_APP_URL,
  contractId: publicEnv.NEXT_PUBLIC_STELLAR_CONTRACT_ID,
  horizonUrl: publicEnv.NEXT_PUBLIC_STELLAR_HORIZON_URL,
  nativeAssetContractId: publicEnv.NEXT_PUBLIC_STELLAR_NATIVE_ASSET_CONTRACT_ID,
  network: publicEnv.NEXT_PUBLIC_STELLAR_NETWORK,
  networkPassphrase: publicEnv.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
  rpcUrl: publicEnv.NEXT_PUBLIC_STELLAR_RPC_URL,
};
