import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { roleSchema, walletProviderSchema } from "@/lib/server/validators";

import { z } from "zod";

const testWalletFileSchema = z.array(
  z.object({
    label: z.string().min(1),
    publicKey: z.string().regex(/^G[A-Z2-7]{55}$/),
    suggestedRole: roleSchema,
    funded: z.boolean().optional().default(false),
    balance: z.string().optional(),
    lastInteraction: z.string().optional(),
    lastTxHash: z.string().optional(),
    walletProvider: walletProviderSchema.optional(),
    usedInApp: z.boolean().optional().default(false),
  }),
);

function getTestWalletFilePath() {
  return path.join(process.cwd(), "data", "test-wallets.json");
}

export async function readTestWalletsFromFile() {
  const filePath = getTestWalletFilePath();

  if (!existsSync(filePath)) {
    return [];
  }

  const raw = await readFile(filePath, "utf8");
  if (!raw.trim()) {
    return [];
  }

  return testWalletFileSchema.parse(JSON.parse(raw.replace(/^\uFEFF/, "")));
}

export async function syncTestWalletsFromFile() {
  const wallets = await readTestWalletsFromFile();

  await Promise.all(
    wallets.map((wallet) =>
      prisma.testWallet.upsert({
        where: {
          label: wallet.label,
        },
        update: {
          publicKey: wallet.publicKey,
          suggestedRole: wallet.suggestedRole,
          funded: wallet.funded,
          balance: wallet.balance ? wallet.balance : null,
          lastInteraction: wallet.lastInteraction ?? null,
          lastTxHash: wallet.lastTxHash ?? null,
          walletProvider: wallet.walletProvider ?? null,
          usedInApp: wallet.usedInApp,
        },
        create: {
          label: wallet.label,
          publicKey: wallet.publicKey,
          suggestedRole: wallet.suggestedRole,
          funded: wallet.funded,
          balance: wallet.balance ? wallet.balance : null,
          lastInteraction: wallet.lastInteraction ?? null,
          lastTxHash: wallet.lastTxHash ?? null,
          walletProvider: wallet.walletProvider ?? null,
          usedInApp: wallet.usedInApp,
        },
      }),
    ),
  );

  return wallets.length;
}

export async function getTestWalletPageData() {
  await syncTestWalletsFromFile();

  return prisma.testWallet.findMany({
    orderBy: {
      label: "asc",
    },
  });
}
