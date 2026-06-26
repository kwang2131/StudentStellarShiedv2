import { createHash, randomUUID } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { captureError } from "@/lib/server/monitoring";
import type {
  AnalyticsPayloadInput,
  BondFiltersInput,
  CreateBondInput,
  EvidenceMetadataInput,
} from "@/lib/server/validators";
import { caseTypeSchema, createBondSchema, evidenceMetadataSchema } from "@/lib/server/validators";
import { trackEvent } from "@/lib/server/analytics";
import type { CaseStatus, UserRole, WalletProvider } from "@/types/study-bond";

export type BondActionName =
  | "INITIALIZE_CASE"
  | "FUND_BOND"
  | "SUBMIT_EVIDENCE"
  | "APPROVE_RELEASE"
  | "REQUEST_REFUND"
  | "APPROVE_REFUND"
  | "OPEN_DISPUTE"
  | "RESOLVE_DISPUTE"
  | "EXPIRE_CASE";

interface PersistActionOutcomeInput {
  action: BondActionName;
  caseId: string;
  contractAddress?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  role: UserRole;
  settledStudentAmount?: number;
  settledVerifierAmount?: number;
  success: boolean;
  txHash?: string;
  walletAddress: string;
  walletProvider: WalletProvider;
}

const actionEventMap: Record<BondActionName, AnalyticsPayloadInput["eventName"]> = {
  INITIALIZE_CASE: "BOND_INITIALIZED_ONCHAIN",
  FUND_BOND: "BOND_FUNDED",
  SUBMIT_EVIDENCE: "EVIDENCE_SUBMITTED",
  APPROVE_RELEASE: "RELEASE_APPROVED",
  REQUEST_REFUND: "REFUND_REQUESTED",
  APPROVE_REFUND: "REFUND_APPROVED",
  OPEN_DISPUTE: "DISPUTE_OPENED",
  RESOLVE_DISPUTE: "DISPUTE_RESOLVED",
  EXPIRE_CASE: "ERROR_CAPTURED",
};

const actionStatusMap: Partial<Record<BondActionName, CaseStatus>> = {
  FUND_BOND: "FUNDED",
  SUBMIT_EVIDENCE: "EVIDENCE_SUBMITTED",
  APPROVE_RELEASE: "RELEASED",
  REQUEST_REFUND: "REFUND_REQUESTED",
  APPROVE_REFUND: "REFUNDED",
  OPEN_DISPUTE: "DISPUTED",
  RESOLVE_DISPUTE: "CLOSED",
  EXPIRE_CASE: "EXPIRED",
};

function createOnchainCaseId(seed: string) {
  return createHash("sha256").update(`${seed}:${randomUUID()}`).digest("hex");
}

function parseAmount(value: number) {
  return new Prisma.Decimal(value.toFixed(7));
}

export async function createBondCase(input: CreateBondInput) {
  const payload = createBondSchema.parse(input);
  const onchainCaseId = createOnchainCaseId(
    `${payload.studentWalletAddress}:${payload.verifierWalletAddress}:${payload.targetCountry}`,
  );

  const created = await prisma.$transaction(async (transaction) => {
    const bondCase = await transaction.studyBondCase.create({
      data: {
        onchainCaseId,
        caseType: payload.caseType,
        studentName: payload.studentName,
        studentWalletAddress: payload.studentWalletAddress,
        payerWalletAddress: payload.payerWalletAddress,
        verifierName: payload.verifierName,
        verifierWalletAddress: payload.verifierWalletAddress,
        mediatorWalletAddress: payload.mediatorWalletAddress,
        targetCountry: payload.targetCountry,
        amount: parseAmount(payload.amount),
        assetCode: payload.assetCode.toUpperCase(),
        assetContractAddress: payload.assetContractAddress,
        expiryDate: new Date(payload.expiryDate),
        releaseCondition: payload.releaseCondition,
        refundCondition: payload.refundCondition,
        notes: payload.notes || null,
      },
    });

    await transaction.auditLog.create({
      data: {
        caseId: bondCase.id,
        actorRole: "STUDENT",
        actorWallet: payload.studentWalletAddress,
        action: "case_created",
        message: `Created ${payload.caseType} case for ${payload.targetCountry}.`,
        metadata: {
          verifier: payload.verifierName,
          assetCode: payload.assetCode.toUpperCase(),
        },
      },
    });

    return bondCase;
  });

  await trackEvent({
    eventName: "CASE_CREATED",
    path: `/bonds/${created.id}`,
    role: "STUDENT",
    walletAddress: created.studentWalletAddress,
  });

  return created;
}

export async function listBondCases(filters: BondFiltersInput = {}) {
  const normalizedFilters = {
    search: filters.search?.trim(),
    status: filters.status,
    caseType: filters.caseType,
  };

  return prisma.studyBondCase.findMany({
    where: {
      caseType: normalizedFilters.caseType
        ? caseTypeSchema.parse(normalizedFilters.caseType)
        : undefined,
      status: normalizedFilters.status,
      OR: normalizedFilters.search
        ? [
            { studentName: { contains: normalizedFilters.search, mode: "insensitive" } },
            { verifierName: { contains: normalizedFilters.search, mode: "insensitive" } },
            { targetCountry: { contains: normalizedFilters.search, mode: "insensitive" } },
            { id: { contains: normalizedFilters.search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getBondCaseById(caseId: string) {
  return prisma.studyBondCase.findUnique({
    where: {
      id: caseId,
    },
    include: {
      auditLogs: {
        orderBy: {
          createdAt: "desc",
        },
      },
      evidenceFiles: {
        orderBy: {
          createdAt: "desc",
        },
      },
      walletInteractions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function getVerifyCaseById(caseId: string) {
  const bondCase = await prisma.studyBondCase.findUnique({
    where: {
      id: caseId,
    },
    include: {
      auditLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!bondCase) {
    return null;
  }

  return {
    id: bondCase.id,
    caseType: bondCase.caseType,
    amount: bondCase.amount.toString(),
    assetCode: bondCase.assetCode,
    contractAddress: bondCase.contractAddress,
    expiryDate: bondCase.expiryDate,
    fundTxHash: bondCase.fundTxHash,
    onchainCaseId: bondCase.onchainCaseId,
    status: bondCase.status,
    studentWalletAddress: bondCase.studentWalletAddress,
    verifierName: bondCase.verifierName,
    auditLogs: bondCase.auditLogs,
    lastContractState: bondCase.lastContractState,
  };
}

export async function addEvidenceMetadata(caseId: string, input: EvidenceMetadataInput) {
  const payload = evidenceMetadataSchema.parse(input);

  return prisma.$transaction(async (transaction) => {
    const evidence = await transaction.evidenceFile.create({
      data: {
        caseId,
        category: payload.category,
        fileName: payload.fileName,
        fileUrl: payload.fileUrl,
        fileHash: payload.fileHash,
        description: payload.description || null,
        relatedCondition: payload.relatedCondition || null,
        uploadedByRole: payload.uploadedByRole,
        uploadedByWallet: payload.uploadedByWallet,
      },
    });

    await transaction.auditLog.create({
      data: {
        caseId,
        actorRole: payload.uploadedByRole,
        actorWallet: payload.uploadedByWallet,
        action: "evidence_metadata_saved",
        message: `Added ${payload.category} evidence metadata.`,
        metadata: {
          fileName: payload.fileName,
          fileHash: payload.fileHash,
        },
      },
    });

    return evidence;
  });
}

export async function persistActionOutcome(input: PersistActionOutcomeInput) {
  const existingCase = await prisma.studyBondCase.findUnique({
    where: {
      id: input.caseId,
    },
  });

  if (!existingCase) {
    throw new Error(`Case ${input.caseId} not found`);
  }

  const auditMessage = input.success
    ? `${input.action.toLowerCase()} confirmed on Stellar testnet.`
    : `${input.action.toLowerCase()} failed before state transition.`;

  await prisma.$transaction(async (transaction) => {
    if (input.success) {
      await transaction.studyBondCase.update({
        where: {
          id: input.caseId,
        },
        data: {
          contractAddress:
            input.contractAddress ?? existingCase.contractAddress ?? undefined,
          initializeTxHash:
            input.action === "INITIALIZE_CASE"
              ? input.txHash
              : existingCase.initializeTxHash,
          fundTxHash:
            input.action === "FUND_BOND" ? input.txHash : existingCase.fundTxHash,
          releaseTxHash:
            input.action === "APPROVE_RELEASE"
              ? input.txHash
              : existingCase.releaseTxHash,
          refundTxHash:
            input.action === "APPROVE_REFUND"
              ? input.txHash
              : existingCase.refundTxHash,
          disputeTxHash:
            input.action === "OPEN_DISPUTE"
              ? input.txHash
              : existingCase.disputeTxHash,
          resolutionTxHash:
            input.action === "RESOLVE_DISPUTE"
              ? input.txHash
              : existingCase.resolutionTxHash,
          fundingWalletProvider:
            input.action === "FUND_BOND"
              ? input.walletProvider
              : existingCase.fundingWalletProvider,
          status: actionStatusMap[input.action] ?? existingCase.status,
          settledStudentAmount:
            typeof input.settledStudentAmount === "number"
              ? parseAmount(input.settledStudentAmount)
              : existingCase.settledStudentAmount,
          settledVerifierAmount:
            typeof input.settledVerifierAmount === "number"
              ? parseAmount(input.settledVerifierAmount)
              : existingCase.settledVerifierAmount,
          lastContractState: input.metadata as Prisma.InputJsonValue | undefined,
        },
      });
    }

    await transaction.walletInteraction.create({
      data: {
        caseId: input.caseId,
        walletAddress: input.walletAddress,
        walletProvider: input.walletProvider,
        role: input.role,
        action: input.action.toLowerCase(),
        txHash: input.txHash,
        contractAddress: input.contractAddress ?? existingCase.contractAddress,
        success: input.success,
        errorMessage: input.errorMessage,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    await transaction.auditLog.create({
      data: {
        caseId: input.caseId,
        actorRole: input.role,
        actorWallet: input.walletAddress,
        action: input.action.toLowerCase(),
        message: auditMessage,
        txHash: input.txHash,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  });

  if (!input.success && input.errorMessage) {
    await captureError({
      scope: "contract.action",
      message: input.errorMessage,
      walletAddress: input.walletAddress,
      caseId: input.caseId,
      metadata: {
        action: input.action,
        walletProvider: input.walletProvider,
      },
    });
  }

  if (input.success) {
    await trackEvent({
      eventName: actionEventMap[input.action],
      role: input.role,
      walletAddress: input.walletAddress,
      walletProvider: input.walletProvider,
      path: `/bonds/${input.caseId}`,
      metadata: input.metadata,
    });
  }
}
