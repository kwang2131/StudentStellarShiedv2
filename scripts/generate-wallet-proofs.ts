import { execFileSync } from "node:child_process";

import { Keypair, TransactionBuilder } from "@stellar/stellar-sdk";

import { prisma } from "../src/lib/prisma";
import {
  addEvidenceMetadata,
  createBondCase,
  persistActionOutcome,
  type BondActionName,
} from "../src/lib/server/bonds";
import { syncTestWalletsFromFile } from "../src/lib/server/test-wallets";
import { stellarConfig } from "../src/lib/stellar/config";
import {
  getCaseState,
  prepareApproveRefund,
  prepareApproveRelease,
  prepareFundBond,
  prepareInitializeStudyBondCase,
  prepareOpenDispute,
  prepareRequestRefund,
  prepareResolveDispute,
  prepareSubmitEvidence,
  submitSignedTransaction,
} from "../src/lib/stellar/contract-client";
import { hashFromText } from "../src/lib/stellar/tx-utils";

import {
  fetchWalletSnapshot,
  readWalletFixtures,
  writeWalletFixtures,
} from "./test-wallets.shared";

import type {
  CaseType,
  UserRole,
} from "../src/types/study-bond";

const WALLET_PROVIDER = "FREIGHTER" as const;

interface WalletActor {
  label: string;
  publicKey: string;
  secret: string;
}

interface CaseScenario {
  amount: number;
  caseType: CaseType;
  evidenceCategory?: "DORM_RESERVATION" | "ADMISSION_LETTER" | "RENTAL_OFFER";
  fundingRole: UserRole;
  label: string;
  mediator: WalletActor;
  notes: string;
  payer?: WalletActor;
  student: WalletActor;
  targetCountry: string;
  verifier: WalletActor;
  verifierName: string;
}

type ProofBondCase = Awaited<ReturnType<typeof createBondCase>>;

interface RunActionInput {
  action: BondActionName;
  amount?: number;
  bondCase: ProofBondCase;
  disputeHash?: string;
  evidenceHash?: string;
  releaseHash?: string;
  refundReasonHash?: string;
  resolutionHash?: string;
  role: UserRole;
  studentAmount?: number;
  verifierAmount?: number;
  wallet: WalletActor;
}

async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function withPrismaRetry<T>(label: string, run: () => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const isTransactionStartTimeout =
        message.includes("Unable to start a transaction in the given time") ||
        message.includes("P2028");

      if (!isTransactionStartTimeout || attempt === 4) {
        throw error;
      }

      console.warn(`${label} retry ${attempt}/4 after Prisma transaction timeout.`);
      await sleep(attempt * 1000);
    }
  }

  throw lastError;
}

function runStellarCommand(args: string[]) {
  return execFileSync("stellar", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function loadWallet(label: string): WalletActor {
  return {
    label,
    publicKey: runStellarCommand(["keys", "public-key", "--quiet", label]),
    secret: runStellarCommand(["keys", "secret", "--quiet", label]),
  };
}

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

function signPreparedXdr(preparedXdr: string, secret: string) {
  const transaction = TransactionBuilder.fromXDR(
    preparedXdr,
    stellarConfig.networkPassphrase,
  );
  transaction.sign(Keypair.fromSecret(secret));
  return transaction.toXDR();
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

async function prepareForAction(input: RunActionInput) {
  switch (input.action) {
    case "INITIALIZE_CASE":
      return prepareInitializeStudyBondCase({
        amount: Number(input.bondCase.amount),
        assetContractAddress: input.bondCase.assetContractAddress,
        caseId: input.bondCase.onchainCaseId,
        expiryLedger: await estimateExpiryLedger(input.bondCase.expiryDate),
        mediatorAddress: input.bondCase.mediatorWalletAddress,
        payerAddress: input.bondCase.payerWalletAddress ?? undefined,
        sourceAddress: input.wallet.publicKey,
        studentAddress: input.bondCase.studentWalletAddress,
        verifierAddress: input.bondCase.verifierWalletAddress,
      });
    case "FUND_BOND":
      return prepareFundBond({
        amount: input.amount ?? Number(input.bondCase.amount),
        caseId: input.bondCase.onchainCaseId,
        sourceAddress: input.wallet.publicKey,
      });
    case "SUBMIT_EVIDENCE":
      return prepareSubmitEvidence({
        caseId: input.bondCase.onchainCaseId,
        evidenceHash:
          input.evidenceHash ?? hashFromText(`proof-evidence:${input.bondCase.id}`),
        sourceAddress: input.wallet.publicKey,
      });
    case "APPROVE_RELEASE":
      return prepareApproveRelease({
        caseId: input.bondCase.onchainCaseId,
        releaseHash:
          input.releaseHash ?? hashFromText(`proof-release:${input.bondCase.id}`),
        sourceAddress: input.wallet.publicKey,
      });
    case "REQUEST_REFUND":
      return prepareRequestRefund({
        caseId: input.bondCase.onchainCaseId,
        refundReasonHash:
          input.refundReasonHash ?? hashFromText(`proof-refund:${input.bondCase.id}`),
        sourceAddress: input.wallet.publicKey,
      });
    case "APPROVE_REFUND":
      return prepareApproveRefund({
        caseId: input.bondCase.onchainCaseId,
        refundReasonHash:
          input.refundReasonHash ?? hashFromText(`proof-refund-approve:${input.bondCase.id}`),
        sourceAddress: input.wallet.publicKey,
      });
    case "OPEN_DISPUTE":
      return prepareOpenDispute({
        caseId: input.bondCase.onchainCaseId,
        disputeHash:
          input.disputeHash ?? hashFromText(`proof-dispute:${input.bondCase.id}`),
        sourceAddress: input.wallet.publicKey,
      });
    case "RESOLVE_DISPUTE":
      return prepareResolveDispute({
        caseId: input.bondCase.onchainCaseId,
        resolutionHash:
          input.resolutionHash ?? hashFromText(`proof-resolution:${input.bondCase.id}`),
        sourceAddress: input.wallet.publicKey,
        studentAmount: input.studentAmount ?? 0,
        verifierAmount: input.verifierAmount ?? 0,
      });
    default:
      throw new Error(`Unsupported action ${input.action}`);
  }
}

async function runAction(input: RunActionInput) {
  const prepared = await prepareForAction(input);
  const signedXdr = signPreparedXdr(prepared.xdr, input.wallet.secret);
  const result = await submitSignedTransaction(signedXdr);

  if (!result.success || !result.txHash) {
    throw new Error(
      `${input.action} failed for ${input.wallet.label}: ${result.errorMessage ?? "unknown error"}`,
    );
  }

  const contractState = await getCaseState(input.bondCase.onchainCaseId);

  await withPrismaRetry(`persistActionOutcome:${input.action}`, () =>
    persistActionOutcome({
      action: input.action,
      caseId: input.bondCase.id,
      contractAddress: result.contractAddress ?? stellarConfig.contractId,
      metadata: normalizeStateMetadata(
        contractState,
        input.action,
        input.bondCase.onchainCaseId,
      ),
      role: input.role,
      settledStudentAmount: input.studentAmount,
      settledVerifierAmount: input.verifierAmount,
      success: true,
      txHash: result.txHash,
      walletAddress: input.wallet.publicKey,
      walletProvider: WALLET_PROVIDER,
    }),
  );

  return result.txHash;
}

async function createProofCase(scenario: CaseScenario) {
  const expiryDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

  return withPrismaRetry(`createProofCase:${scenario.label}`, () =>
    createBondCase({
      amount: scenario.amount,
      assetCode: "XLM",
      assetContractAddress: stellarConfig.nativeAssetContractId,
      caseType: scenario.caseType,
      expiryDate,
      mediatorWalletAddress: scenario.mediator.publicKey,
      notes: scenario.notes,
      payerWalletAddress: scenario.payer?.publicKey ?? "",
      refundCondition:
        "Refund is allowed if the admission, housing, or visa condition fails before the expiry date.",
      releaseCondition:
        "Release is allowed after the verifier confirms the agreed student deposit condition has been met.",
      studentName: `Proof Flow ${scenario.student.label}`,
      studentWalletAddress: scenario.student.publicKey,
      targetCountry: scenario.targetCountry,
      verifierName: scenario.verifierName,
      verifierWalletAddress: scenario.verifier.publicKey,
    }),
  );
}

async function markUsedWallets(labels: string[]) {
  const fixtures = await readWalletFixtures();
  const used = new Set(labels);
  const next = [];

  for (const wallet of fixtures) {
    const snapshot = await fetchWalletSnapshot(wallet.publicKey);

    next.push({
      ...wallet,
      funded: snapshot.funded,
      balance: snapshot.balance,
      lastInteraction: snapshot.lastInteraction ?? wallet.lastInteraction,
      lastTxHash: snapshot.lastTxHash ?? wallet.lastTxHash,
      usedInApp: wallet.usedInApp || used.has(wallet.label),
      walletProvider: wallet.walletProvider ?? WALLET_PROVIDER,
    });
  }

  await writeWalletFixtures(next);
  await syncTestWalletsFromFile();

  await Promise.all(
    next
      .filter((wallet) => used.has(wallet.label))
      .map((wallet) =>
        prisma.testWallet.update({
          where: { label: wallet.label },
          data: {
            usedInApp: true,
            lastInteraction: wallet.lastInteraction ?? null,
            lastTxHash: wallet.lastTxHash ?? null,
            walletProvider: WALLET_PROVIDER,
          },
        }),
      ),
  );
}

async function main() {
  if (!stellarConfig.contractId) {
    throw new Error("NEXT_PUBLIC_STELLAR_CONTRACT_ID is required before generating wallet proofs.");
  }

  const scenarios: CaseScenario[] = [
    {
      amount: 1,
      caseType: "DORM_DEPOSIT",
      evidenceCategory: "DORM_RESERVATION",
      fundingRole: "PARENT_GUARDIAN",
      label: "release-proof",
      mediator: loadWallet("mediator-01"),
      notes: "Generated proof flow: release path.",
      payer: loadWallet("parent-01"),
      student: loadWallet("student-01"),
      targetCountry: "Canada",
      verifier: loadWallet("school-01"),
      verifierName: "Maple Residence Office",
    },
    {
      amount: 1,
      caseType: "TUITION_DEPOSIT",
      fundingRole: "PARENT_GUARDIAN",
      label: "dispute-proof",
      mediator: loadWallet("landlord-01"),
      notes: "Generated proof flow: dispute resolution path.",
      payer: loadWallet("agency-01"),
      student: loadWallet("student-02"),
      targetCountry: "Australia",
      verifier: loadWallet("dorm-01"),
      verifierName: "Sydney Pathway College",
    },
    {
      amount: 1,
      caseType: "RENTAL_DEPOSIT",
      fundingRole: "PARENT_GUARDIAN",
      label: "refund-proof",
      mediator: loadWallet("reviewer-02"),
      notes: "Generated proof flow: refund approval path.",
      payer: loadWallet("reviewer-01"),
      student: loadWallet("admin-01"),
      targetCountry: "United Kingdom",
      verifier: loadWallet("verifier-01"),
      verifierName: "London Housing Desk",
    },
  ];

  const usedLabels = new Set<string>();
  const summary: Array<{ caseId: string; label: string; txHashes: string[] }> = [];

  for (const scenario of scenarios) {
    const bondCase = await createProofCase(scenario);
    const txHashes: string[] = [];

    usedLabels.add(scenario.student.label);
    usedLabels.add(scenario.verifier.label);
    usedLabels.add(scenario.mediator.label);
    if (scenario.payer) {
      usedLabels.add(scenario.payer.label);
    }

    txHashes.push(
      await runAction({
        action: "INITIALIZE_CASE",
        bondCase,
        role: "STUDENT",
        wallet: scenario.student,
      }),
    );

    txHashes.push(
      await runAction({
        action: "FUND_BOND",
        amount: scenario.amount,
        bondCase,
        role: scenario.fundingRole,
        wallet: scenario.payer ?? scenario.student,
      }),
    );

    const evidenceCategory = scenario.evidenceCategory;

    if (evidenceCategory) {
      await withPrismaRetry(`addEvidenceMetadata:${scenario.label}`, () =>
        addEvidenceMetadata(bondCase.id, {
          category: evidenceCategory,
          description: `Generated evidence metadata for ${scenario.label}.`,
          fileHash: hashFromText(`evidence-metadata:${bondCase.id}`),
          fileName: `${scenario.label}.json`,
          fileUrl: `${stellarConfig.appUrl}/verify/${bondCase.id}`,
          relatedCondition: "Generated for technical validation on Stellar testnet.",
          uploadedByRole: "STUDENT",
          uploadedByWallet: scenario.student.publicKey,
        }),
      );

      txHashes.push(
        await runAction({
          action: "SUBMIT_EVIDENCE",
          bondCase,
          evidenceHash: hashFromText(`evidence-submit:${bondCase.id}`),
          role: "STUDENT",
          wallet: scenario.student,
        }),
      );

      txHashes.push(
        await runAction({
          action: "APPROVE_RELEASE",
          bondCase,
          releaseHash: hashFromText(`release:${bondCase.id}`),
          role: "INSTITUTION_VERIFIER",
          wallet: scenario.verifier,
        }),
      );
    } else if (scenario.label === "dispute-proof") {
      txHashes.push(
        await runAction({
          action: "OPEN_DISPUTE",
          bondCase,
          disputeHash: hashFromText(`dispute:${bondCase.id}`),
          role: "INSTITUTION_VERIFIER",
          wallet: scenario.verifier,
        }),
      );

      txHashes.push(
        await runAction({
          action: "RESOLVE_DISPUTE",
          bondCase,
          resolutionHash: hashFromText(`resolution:${bondCase.id}`),
          role: "MEDIATOR",
          studentAmount: 0.4,
          verifierAmount: 0.6,
          wallet: scenario.mediator,
        }),
      );
    } else {
      txHashes.push(
        await runAction({
          action: "REQUEST_REFUND",
          bondCase,
          refundReasonHash: hashFromText(`refund-request:${bondCase.id}`),
          role: "STUDENT",
          wallet: scenario.student,
        }),
      );

      txHashes.push(
        await runAction({
          action: "APPROVE_REFUND",
          bondCase,
          refundReasonHash: hashFromText(`refund-approve:${bondCase.id}`),
          role: "INSTITUTION_VERIFIER",
          wallet: scenario.verifier,
        }),
      );
    }

    summary.push({
      caseId: bondCase.id,
      label: scenario.label,
      txHashes,
    });
  }

  await markUsedWallets(Array.from(usedLabels));

  const successfulInteractions = await prisma.walletInteraction.count({
    where: {
      success: true,
    },
  });

  const uniqueWallets = await prisma.walletInteraction.findMany({
    distinct: ["walletAddress"],
    select: {
      walletAddress: true,
    },
    where: {
      success: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        generatedCases: summary,
        successfulInteractions,
        uniqueWallets: uniqueWallets.length,
      },
      null,
      2,
    ),
  );
}

void main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
