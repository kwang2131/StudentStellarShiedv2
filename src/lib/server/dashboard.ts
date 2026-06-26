import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = [
  "FUNDED",
  "VERIFICATION_PENDING",
  "EVIDENCE_SUBMITTED",
  "RELEASE_APPROVED",
  "REFUND_REQUESTED",
  "DISPUTED",
] as const;

export async function getDashboardData() {
  const [cases, walletInteractions, feedback, auditLogs] = await prisma.$transaction([
    prisma.studyBondCase.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.walletInteraction.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    }),
    prisma.feedback.findMany(),
    prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
    }),
  ]);

  const totals = {
    totalCases: cases.length,
    fundedCases: cases.filter((item) => item.status === "FUNDED").length,
    releasedCases: cases.filter((item) => item.status === "RELEASED").length,
    refundedCases: cases.filter((item) => item.status === "REFUNDED").length,
    disputedCases: cases.filter((item) => item.status === "DISPUTED").length,
    totalLockedValue: cases
      .filter((item) => ACTIVE_STATUSES.includes(item.status as (typeof ACTIVE_STATUSES)[number]))
      .reduce((accumulator, item) => accumulator + Number(item.amount), 0),
    walletInteractionsCount: walletInteractions.length,
    uniqueWalletsCount: new Set(walletInteractions.map((item) => item.walletAddress)).size,
    feedbackCount: feedback.length,
  };

  return {
    totals,
    recentActivity: auditLogs,
    latestCases: cases.slice(0, 6),
    latestWalletInteractions: walletInteractions.slice(0, 10),
  };
}
