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

function hasGithubRemote() {
  try {
    const output = execSync("git remote get-url origin", {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();

    return output.includes("github.com") || output.includes("git@github-");
  } catch {
    return false;
  }
}

function hasCiWorkflow() {
  return existsSync(path.join(process.cwd(), ".github", "workflows", "ci.yml"));
}

function hasLevel5ProofDocs() {
  return [
    "level5-transaction-activity-proof.md",
    "level5-feedback-iteration-summary.md",
    "submission-proof.json",
  ].every((file) => existsSync(path.join(process.cwd(), "docs", file)));
}

export async function getSubmissionPageData() {
  const [walletProofs, feedbackCount, userCount, settings] = await Promise.all([
    prisma.walletInteraction.findMany({
      where: {
        success: true,
      },
    }),
    prisma.feedback.count(),
    prisma.user.count(),
    prisma.appSetting.findMany(),
  ]);

  const settingMap = new Map(settings.map((item) => [item.key, item.value ?? ""]));
  const uniqueWallets = new Set(walletProofs.map((item) => item.walletAddress)).size;
  const commitCount = readGitCommitCount();
  const hasReadme = hasMeaningfulReadme();
  const hasRemote = hasGithubRemote();
  const hasCi = hasCiWorkflow();
  const hasProofDocs = hasLevel5ProofDocs();

  const checklist: SubmissionChecklistItem[] = [
    {
      id: "repo",
      label: "Public GitHub repository",
      complete: hasRemote,
      detail: hasRemote
        ? "GitHub remote is configured. Ensure the repository visibility is Public before submission."
        : "GitHub remote is not configured yet.",
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
      label: "20+ meaningful commits",
      complete: commitCount >= 20,
      detail: `Current local commit count: ${commitCount}.`,
    },
    {
      id: "live-demo",
      label: "Live deployed application",
      complete: Boolean(settingMap.get("liveDemoUrl")),
      detail: settingMap.get("liveDemoUrl") || "Temporarily blank as requested.",
    },
    {
      id: "pitch-deck",
      label: "PPT / pitch deck link",
      complete: Boolean(settingMap.get("pitchDeckUrl")),
      detail: settingMap.get("pitchDeckUrl") || "Pitch deck link is not configured yet.",
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
      label: "Proof of 50+ users",
      complete: userCount >= 50 && uniqueWallets >= 50,
      detail: `${userCount} users and ${uniqueWallets} unique wallet addresses recorded.`,
    },
    {
      id: "analytics-proof",
      label: "Analytics / transaction activity proof",
      complete: hasProofDocs && walletProofs.length >= 50,
      detail: hasProofDocs
        ? `Proof docs exist with ${walletProofs.length} successful wallet interaction rows.`
        : "Level 5 proof docs are missing.",
    },
    {
      id: "feedback",
      label: "User feedback iteration summary",
      complete: feedbackCount >= 50 && hasProofDocs,
      detail: `${feedbackCount} feedback submissions recorded.`,
    },
    {
      id: "ci",
      label: "CI workflow",
      complete: hasCi,
      detail: hasCi
        ? "GitHub Actions workflow exists at .github/workflows/ci.yml."
        : "CI workflow is missing.",
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
    userCount,
    liveDemoUrl: settingMap.get("liveDemoUrl") || "",
    demoVideoUrl: settingMap.get("demoVideoUrl") || "",
  };
}
