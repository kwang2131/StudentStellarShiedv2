import {
  Address,
  BASE_FEE,
  Contract,
  Transaction,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";

import { serverEnv } from "@/lib/server-env";
import { stellarConfig } from "@/lib/stellar/config";
import { getRpcServer } from "@/lib/stellar/rpc-client";
import type { PreparedWalletTransaction, SubmittedTransactionResult } from "@/lib/stellar/types";
import {
  addressToScVal,
  bytes32HexToScVal,
  i128ToScVal,
  optionalAddressToScVal,
  toBaseUnits,
  u32ToScVal,
} from "@/lib/stellar/tx-utils";

interface InitializeCaseArgs {
  amount: number | string;
  assetContractAddress: string;
  caseId: string;
  expiryLedger: number;
  mediatorAddress: string;
  payerAddress?: string;
  sourceAddress: string;
  studentAddress: string;
  verifierAddress: string;
}

interface SimpleCaseActionArgs {
  caseId: string;
  sourceAddress: string;
}

interface FundBondArgs extends SimpleCaseActionArgs {
  amount: number | string;
}

interface EvidenceActionArgs extends SimpleCaseActionArgs {
  evidenceHash: string;
}

interface RefundActionArgs extends SimpleCaseActionArgs {
  refundReasonHash: string;
}

interface ReleaseActionArgs extends SimpleCaseActionArgs {
  releaseHash: string;
}

interface DisputeActionArgs extends SimpleCaseActionArgs {
  disputeHash: string;
}

interface ResolveDisputeArgs extends SimpleCaseActionArgs {
  resolutionHash: string;
  studentAmount: number;
  verifierAmount: number;
}

function requireContractId() {
  if (!stellarConfig.contractId) {
    throw new Error("NEXT_PUBLIC_STELLAR_CONTRACT_ID is not configured.");
  }

  return stellarConfig.contractId;
}

async function buildPreparedContractTransaction(
  sourceAddress: string,
  method: string,
  args: xdr.ScVal[],
): Promise<PreparedWalletTransaction> {
  const contractId = requireContractId();
  const server = getRpcServer();
  const contract = new Contract(contractId);
  const sourceAccount = await server.getAccount(sourceAddress);
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: stellarConfig.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(300)
    .build();

  const prepared = await server.prepareTransaction(transaction);

  return {
    action: method,
    contractAddress: contractId,
    sourceAddress,
    xdr: prepared.toXDR(),
  };
}

export async function prepareInitializeStudyBondCase(
  input: InitializeCaseArgs,
) {
  return buildPreparedContractTransaction(input.sourceAddress, "initialize_case", [
    bytes32HexToScVal(input.caseId),
    addressToScVal(input.studentAddress),
    optionalAddressToScVal(input.payerAddress),
    addressToScVal(input.verifierAddress),
    addressToScVal(input.mediatorAddress),
    addressToScVal(input.assetContractAddress),
    i128ToScVal(toBaseUnits(input.amount)),
    u32ToScVal(input.expiryLedger),
  ]);
}

export async function prepareFundBond(input: FundBondArgs) {
  return buildPreparedContractTransaction(input.sourceAddress, "fund_bond", [
    bytes32HexToScVal(input.caseId),
    addressToScVal(input.sourceAddress),
    i128ToScVal(toBaseUnits(input.amount)),
  ]);
}

export async function prepareSubmitEvidence(input: EvidenceActionArgs) {
  return buildPreparedContractTransaction(input.sourceAddress, "submit_evidence", [
    bytes32HexToScVal(input.caseId),
    addressToScVal(input.sourceAddress),
    bytes32HexToScVal(input.evidenceHash),
  ]);
}

export async function prepareApproveRelease(input: ReleaseActionArgs) {
  return buildPreparedContractTransaction(input.sourceAddress, "approve_release", [
    bytes32HexToScVal(input.caseId),
    addressToScVal(input.sourceAddress),
    bytes32HexToScVal(input.releaseHash),
  ]);
}

export async function prepareRequestRefund(input: RefundActionArgs) {
  return buildPreparedContractTransaction(input.sourceAddress, "request_refund", [
    bytes32HexToScVal(input.caseId),
    addressToScVal(input.sourceAddress),
    bytes32HexToScVal(input.refundReasonHash),
  ]);
}

export async function prepareApproveRefund(input: RefundActionArgs) {
  return buildPreparedContractTransaction(input.sourceAddress, "approve_refund", [
    bytes32HexToScVal(input.caseId),
    addressToScVal(input.sourceAddress),
    bytes32HexToScVal(input.refundReasonHash),
  ]);
}

export async function prepareOpenDispute(input: DisputeActionArgs) {
  return buildPreparedContractTransaction(input.sourceAddress, "open_dispute", [
    bytes32HexToScVal(input.caseId),
    addressToScVal(input.sourceAddress),
    bytes32HexToScVal(input.disputeHash),
  ]);
}

export async function prepareResolveDispute(input: ResolveDisputeArgs) {
  return buildPreparedContractTransaction(input.sourceAddress, "resolve_dispute", [
    bytes32HexToScVal(input.caseId),
    addressToScVal(input.sourceAddress),
    i128ToScVal(toBaseUnits(input.studentAmount)),
    i128ToScVal(toBaseUnits(input.verifierAmount)),
    bytes32HexToScVal(input.resolutionHash),
  ]);
}

export async function prepareExpireCase(input: SimpleCaseActionArgs) {
  return buildPreparedContractTransaction(input.sourceAddress, "expire_case", [
    bytes32HexToScVal(input.caseId),
  ]);
}

export async function submitSignedTransaction(
  signedXdr: string,
): Promise<SubmittedTransactionResult> {
  const server = getRpcServer();
  const transaction = new Transaction(signedXdr, stellarConfig.networkPassphrase);
  const sent = await server.sendTransaction(transaction);

  if (!sent.hash) {
    return {
      errorMessage: "Soroban RPC did not return a transaction hash.",
      raw: sent,
      success: false,
    };
  }

  const polled = await server.pollTransaction(sent.hash, {
    attempts: 8,
    sleepStrategy: rpc.LinearSleepStrategy,
  });

  const success = polled.status === "SUCCESS";

  return {
    contractAddress: stellarConfig.contractId,
    errorMessage: success ? undefined : polled.status,
    raw: {
      polled,
      sent,
    },
    status: polled.status,
    success,
    txHash: sent.hash,
  };
}

async function simulateRead(method: string, args: xdr.ScVal[]) {
  if (!stellarConfig.contractId || !serverEnv.STELLAR_SIMULATION_ACCOUNT) {
    return null;
  }

  const server = getRpcServer();
  const contract = new Contract(stellarConfig.contractId);
  const account = await server.getAccount(serverEnv.STELLAR_SIMULATION_ACCOUNT);
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: stellarConfig.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();

  const simulation = await server.simulateTransaction(transaction);
  if ("error" in simulation || !("result" in simulation) || !simulation.result) {
    return null;
  }

  return scValToNative(simulation.result.retval);
}

export async function getCaseState(caseId: string) {
  return simulateRead("get_case", [bytes32HexToScVal(caseId)]);
}

export async function getCaseStatus(caseId: string) {
  return simulateRead("get_status", [bytes32HexToScVal(caseId)]);
}

export function isTestnetAddress(address: string) {
  return new Address(address).toString().startsWith("G");
}

export function contractParamFromText(text: string) {
  return nativeToScVal(text);
}
