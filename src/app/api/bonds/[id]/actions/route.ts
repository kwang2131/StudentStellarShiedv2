import { getBondCaseById, persistActionOutcome, type BondActionName } from "@/lib/server/bonds";
import { ensureCaseAllowsAction } from "@/lib/server/action-guards";
import { canRolePerformAction } from "@/lib/server/policies";
import {
  failedBondActionPayloadSchema,
  prepareBondActionPayloadSchema,
  submitBondActionPayloadSchema,
} from "@/lib/server/validators";
import {
  getCaseState,
  prepareApproveRefund,
  prepareApproveRelease,
  prepareExpireCase,
  prepareFundBond,
  prepareInitializeStudyBondCase,
  prepareOpenDispute,
  prepareRequestRefund,
  prepareResolveDispute,
  prepareSubmitEvidence,
  submitSignedTransaction,
} from "@/lib/stellar/contract-client";
import { stellarConfig } from "@/lib/stellar/config";
import { hashFromText } from "@/lib/stellar/tx-utils";
import { jsonError } from "@/lib/route-handler";

export const dynamic = "force-dynamic";

async function getLatestLedgerSequence() {
  const response = await fetch(`${stellarConfig.horizonUrl}/ledgers?order=desc&limit=1`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch the latest Stellar ledger sequence.");
  }

  const payload = (await response.json()) as {
    _embedded?: { records?: Array<{ sequence: string }> };
  };

  const sequence = Number(payload._embedded?.records?.[0]?.sequence ?? 0);
  if (!sequence) {
    throw new Error("Latest Stellar ledger sequence is unavailable.");
  }

  return sequence;
}

async function estimateExpiryLedger(expiryDate: Date) {
  const latestSequence = await getLatestLedgerSequence();
  const secondsUntilExpiry = Math.max(
    120,
    Math.ceil((expiryDate.getTime() - Date.now()) / 1000),
  );

  return latestSequence + Math.ceil(secondsUntilExpiry / 5);
}

function normalizeStateMetadata(state: unknown, action: BondActionName, onchainCaseId: string) {
  if (state && typeof state === "object" && !Array.isArray(state)) {
    return {
      action,
      onchainCaseId,
      ...(state as Record<string, unknown>),
    };
  }

  return {
    action,
    onchainCaseId,
    state,
  };
}

async function prepareAction(
  action: BondActionName,
  payload: Awaited<ReturnType<typeof prepareBondActionPayloadSchema.parse>>,
  bondCase: NonNullable<Awaited<ReturnType<typeof getBondCaseById>>>,
) {
  switch (action) {
    case "INITIALIZE_CASE":
      return prepareInitializeStudyBondCase({
        amount: Number(bondCase.amount),
        assetContractAddress: bondCase.assetContractAddress,
        caseId: bondCase.onchainCaseId,
        expiryLedger: await estimateExpiryLedger(bondCase.expiryDate),
        mediatorAddress: bondCase.mediatorWalletAddress,
        payerAddress: bondCase.payerWalletAddress ?? undefined,
        sourceAddress: payload.walletAddress,
        studentAddress: bondCase.studentWalletAddress,
        verifierAddress: bondCase.verifierWalletAddress,
      });
    case "FUND_BOND":
      return prepareFundBond({
        amount: payload.amount ?? Number(bondCase.amount),
        caseId: bondCase.onchainCaseId,
        sourceAddress: payload.walletAddress,
      });
    case "SUBMIT_EVIDENCE":
      return prepareSubmitEvidence({
        caseId: bondCase.onchainCaseId,
        evidenceHash: payload.evidenceHash ?? hashFromText(`evidence:${bondCase.id}`),
        sourceAddress: payload.walletAddress,
      });
    case "APPROVE_RELEASE":
      return prepareApproveRelease({
        caseId: bondCase.onchainCaseId,
        releaseHash: payload.releaseHash ?? hashFromText(`release:${bondCase.id}`),
        sourceAddress: payload.walletAddress,
      });
    case "REQUEST_REFUND":
      return prepareRequestRefund({
        caseId: bondCase.onchainCaseId,
        refundReasonHash:
          payload.refundReasonHash ?? hashFromText(`refund-request:${bondCase.id}`),
        sourceAddress: payload.walletAddress,
      });
    case "APPROVE_REFUND":
      return prepareApproveRefund({
        caseId: bondCase.onchainCaseId,
        refundReasonHash:
          payload.refundReasonHash ?? hashFromText(`refund-approve:${bondCase.id}`),
        sourceAddress: payload.walletAddress,
      });
    case "OPEN_DISPUTE":
      return prepareOpenDispute({
        caseId: bondCase.onchainCaseId,
        disputeHash: payload.disputeHash ?? hashFromText(`dispute:${bondCase.id}`),
        sourceAddress: payload.walletAddress,
      });
    case "RESOLVE_DISPUTE":
      return prepareResolveDispute({
        caseId: bondCase.onchainCaseId,
        resolutionHash:
          payload.resolutionHash ?? hashFromText(`resolution:${bondCase.id}`),
        sourceAddress: payload.walletAddress,
        studentAmount: payload.studentAmount ?? 0,
        verifierAmount: payload.verifierAmount ?? 0,
      });
    case "EXPIRE_CASE":
      return prepareExpireCase({
        caseId: bondCase.onchainCaseId,
        sourceAddress: payload.walletAddress,
      });
    default:
      throw new Error("Unsupported contract action.");
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const rawBody = await request.json();

    if (rawBody.phase === "failure") {
      const payload = failedBondActionPayloadSchema.parse(rawBody);
      await persistActionOutcome({
        action: payload.action,
        caseId: id,
        contractAddress: stellarConfig.contractId || undefined,
        errorMessage: payload.errorMessage,
        metadata: {
          source: "wallet-signature",
        },
        role: payload.role,
        success: false,
        walletAddress: payload.walletAddress,
        walletProvider: payload.walletProvider,
      });

      return Response.json({ logged: true });
    }

    const bondCase = await getBondCaseById(id);
    if (!bondCase) {
      return Response.json({ error: "StudyBond case not found." }, { status: 404 });
    }

    if (rawBody.phase === "prepare") {
      const payload = prepareBondActionPayloadSchema.parse(rawBody);

      if (!canRolePerformAction(payload.action, payload.role)) {
        return Response.json(
          { error: "Current role cannot perform this contract action." },
          { status: 403 },
        );
      }

      ensureCaseAllowsAction(
        payload.action,
        bondCase.status,
        {
          bondAmount: Number(bondCase.amount),
          studentAmount: payload.studentAmount,
          verifierAmount: payload.verifierAmount,
        },
      );

      const prepared = await prepareAction(payload.action, payload, bondCase);
      return Response.json({ prepared });
    }

    const payload = submitBondActionPayloadSchema.parse(rawBody);

    if (!canRolePerformAction(payload.action, payload.role)) {
      return Response.json(
        { error: "Current role cannot perform this contract action." },
        { status: 403 },
      );
    }

    ensureCaseAllowsAction(
      payload.action,
      bondCase.status,
      {
        bondAmount: Number(bondCase.amount),
        studentAmount: payload.studentAmount,
        verifierAmount: payload.verifierAmount,
      },
    );

    const result = await submitSignedTransaction(payload.signedXdr);
    const contractState = result.success ? await getCaseState(bondCase.onchainCaseId) : null;

    await persistActionOutcome({
      action: payload.action,
      caseId: id,
      contractAddress: result.contractAddress ?? stellarConfig.contractId ?? undefined,
      errorMessage: result.errorMessage,
      metadata: normalizeStateMetadata(
        contractState,
        payload.action,
        bondCase.onchainCaseId,
      ),
      role: payload.role,
      settledStudentAmount: payload.studentAmount,
      settledVerifierAmount: payload.verifierAmount,
      success: result.success,
      txHash: result.txHash,
      walletAddress: payload.walletAddress,
      walletProvider: payload.walletProvider,
    });

    return Response.json({ result });
  } catch (error) {
    return jsonError(error);
  }
}
