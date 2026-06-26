import { beforeEach, describe, expect, it, vi } from "vitest";

const transaction = {
  auditLog: {
    create: vi.fn(),
  },
  studyBondCase: {
    update: vi.fn(),
  },
  walletInteraction: {
    create: vi.fn(),
  },
};

const prismaMock = {
  $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
    callback(transaction),
  ),
  studyBondCase: {
    findUnique: vi.fn(),
  },
};

const trackEvent = vi.fn();
const captureError = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/server/analytics", () => ({
  trackEvent,
}));

vi.mock("@/lib/server/monitoring", () => ({
  captureError,
}));

describe("persistActionOutcome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.studyBondCase.findUnique.mockResolvedValue({
      contractAddress: "CDUMMYCONTRACT",
      disputeTxHash: null,
      fundTxHash: null,
      fundingWalletProvider: null,
      id: "case-1",
      initializeTxHash: null,
      refundTxHash: null,
      releaseTxHash: null,
      resolutionTxHash: null,
      settledStudentAmount: null,
      settledVerifierAmount: null,
      status: "CREATED",
    });
  });

  it("creates audit logs, wallet proofs, and analytics events after a successful action", async () => {
    const { persistActionOutcome } = await import("./bonds");

    await persistActionOutcome({
      action: "FUND_BOND",
      caseId: "case-1",
      contractAddress: "CDUMMYCONTRACT",
      metadata: { test: true },
      role: "STUDENT",
      success: true,
      txHash: "abc123",
      walletAddress: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      walletProvider: "FREIGHTER",
    });

    expect(transaction.studyBondCase.update).toHaveBeenCalled();
    expect(transaction.walletInteraction.create).toHaveBeenCalled();
    expect(transaction.auditLog.create).toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "BOND_FUNDED",
      }),
    );
  });

  it("captures failures while still writing audit and wallet proof rows", async () => {
    const { persistActionOutcome } = await import("./bonds");

    await persistActionOutcome({
      action: "APPROVE_RELEASE",
      caseId: "case-1",
      errorMessage: "User rejected signature",
      role: "INSTITUTION_VERIFIER",
      success: false,
      walletAddress: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      walletProvider: "RABET",
    });

    expect(transaction.walletInteraction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          success: false,
        }),
      }),
    );
    expect(transaction.auditLog.create).toHaveBeenCalled();
    expect(captureError).toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });
});
