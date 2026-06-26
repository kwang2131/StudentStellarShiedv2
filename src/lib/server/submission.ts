import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { publicEnv } from "@/lib/public-env";
import type { SubmissionChecklistItem } from "@/types/study-bond";

function readGitCommitCount() {
  try {
    return Number(
      execSync("git rev-list --count HEAD", {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "ignore"],
      })
        .toString()
        .trim(),
    );
  } catch {
    return 0;
  }
}

function hasMeaningfulReadme() {
  if (!existsSync(path.join(process.cwd(), "README.md"))) {
    return false;
  }

  try {
    const readme = readFileSync(path.join(process.cwd(), "README.md"), "utf8");

    return !readme.includes("This is a [Next.js](https://nextjs.org) project bootstrapped");
  } catch {
    return false;
  }
}

export async function getSubmissionPageData() {
  const [walletProofs, feedbackCount, settings] = await prisma.$transaction([
    prisma.walletInteraction.findMany({
      where: {
        success: true,
      },
    }),
    prisma.feedback.count(),
    prisma.appSetting.findMany(),
  ]);

  const settingMap = new Map(settings.map((item) => [item.key, item.value ?? ""]));
  const uniqueWallets = new Set(walletProofs.map((item) => item.walletAddress)).size;
  const commitCount = readGitCommitCount();
  const hasReadme = hasMeaningfulReadme();

  const checklist: SubmissionChecklistItem[] = [
    {
      id: "repo",
      label: "Public GitHub repository",
      complete: false,
      detail: "Local repo is prepared, but remote GitHub publish still needs to be configured.",
    },
    {
      id: "readme",
      label: "README status",
      complete: hasReadme,
      detail: hasReadme
        ? "README has been replaced with project documentation."
        : "README is missing or still using the default Next.js boilerplate.",
    },
    {
      id: "commits",
      label: "15+ meaningful commits",
      complete: commitCount >= 15,
      detail: `Current local commit count: ${commitCount}.`,
    },
    {
      id: "live-demo",
      label: "Live demo link",
      complete: Boolean(settingMap.get("liveDemoUrl")),
      detail: settingMap.get("liveDemoUrl") || "Temporarily blank as requested.",
    },
    {
      id: "contract",
      label: "Contract deployment address",
      complete: Boolean(publicEnv.NEXT_PUBLIC_STELLAR_CONTRACT_ID),
      detail:
        publicEnv.NEXT_PUBLIC_STELLAR_CONTRACT_ID ||
        "Contract not deployed yet in current workspace state.",
    },
    {
      id: "wallet-proofs",
      label: "Proof of 10+ wallet interactions",
      complete: walletProofs.length >= 10 && uniqueWallets >= 10,
      detail: `${walletProofs.length} successful interactions across ${uniqueWallets} unique wallets.`,
    },
    {
      id: "feedback",
      label: "Feedback summary",
      complete: feedbackCount > 0,
      detail: `${feedbackCount} feedback submissions recorded.`,
    },
    {
      id: "video",
      label: "Demo video link",
      complete: Boolean(settingMap.get("demoVideoUrl")),
      detail: settingMap.get("demoVideoUrl") || "Temporarily blank as requested.",
    },
  ];

  return {
    checklist,
    commitCount,
    contract: {
      contractId: publicEnv.NEXT_PUBLIC_STELLAR_CONTRACT_ID || "",
      deployCommand: "npm run contract:deploy:testnet",
      deployTxHash: settingMap.get("contractDeployTxHash") || "",
      deployerPublicKey: settingMap.get("contractDeployerPublicKey") || "",
      installTxHash: settingMap.get("contractInstallTxHash") || "",
      network: publicEnv.NEXT_PUBLIC_STELLAR_NETWORK,
      testCommand: "npm run test",
    },
    feedbackCount,
    walletProofCount: walletProofs.length,
    uniqueWallets,
    liveDemoUrl: settingMap.get("liveDemoUrl") || "",
    demoVideoUrl: settingMap.get("demoVideoUrl") || "",
  };
}
