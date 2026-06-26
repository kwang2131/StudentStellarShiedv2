import "server-only";

import { prisma } from "@/lib/prisma";

export async function getWalletProofPageData() {
  const interactions = await prisma.walletInteraction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      case: {
        select: {
          id: true,
          caseType: true,
          status: true,
        },
      },
    },
  });

  const successful = interactions.filter((item) => item.success);
  const uniqueWallets = new Set(successful.map((item) => item.walletAddress)).size;

  return {
    interactions,
    summary: {
      total: interactions.length,
      successful: successful.length,
      failed: interactions.length - successful.length,
      uniqueWallets,
    },
  };
}
