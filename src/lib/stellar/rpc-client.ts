import { rpc } from "@stellar/stellar-sdk";

import { stellarConfig } from "@/lib/stellar/config";

let rpcServer: rpc.Server | undefined;

export function getRpcServer() {
  if (!rpcServer) {
    rpcServer = new rpc.Server(stellarConfig.rpcUrl);
  }

  return rpcServer;
}
