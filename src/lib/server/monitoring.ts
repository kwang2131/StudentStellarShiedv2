import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

interface CaptureErrorInput {
  scope: string;
  message: string;
  detail?: string;
  path?: string;
  walletAddress?: string;
  caseId?: string;
  metadata?: Record<string, unknown>;
}

export async function captureError(input: CaptureErrorInput) {
  return prisma.errorLog.create({
    data: {
      scope: input.scope,
      message: input.message,
      detail: input.detail,
      path: input.path,
      walletAddress: input.walletAddress,
      caseId: input.caseId,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function getMonitoringOverview() {
  const [errors, totalErrors] = await Promise.all([
    prisma.errorLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    }),
    prisma.errorLog.count(),
  ]);

  return {
    totalErrors,
    recentErrors: errors,
    walletErrorCount: errors.filter((item) => item.scope.includes("wallet")).length,
    apiErrorCount: errors.filter((item) => item.scope.includes("api")).length,
    contractErrorCount: errors.filter((item) => item.scope.includes("contract")).length,
  };
}
