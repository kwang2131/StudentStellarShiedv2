import { Horizon } from "@stellar/stellar-sdk";

import { stellarConfig } from "@/lib/stellar/config";

let horizonServer: Horizon.Server | undefined;

export function getHorizonServer() {
  if (!horizonServer) {
    horizonServer = new Horizon.Server(stellarConfig.horizonUrl);
  }

  return horizonServer;
}

export async function getNativeBalance(publicKey: string) {
  const response = await fetch(`${stellarConfig.horizonUrl}/accounts/${publicKey}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    balances?: Array<{ asset_type: string; balance: string }>;
  };

  return data.balances?.find((item) => item.asset_type === "native")?.balance ?? null;
}
