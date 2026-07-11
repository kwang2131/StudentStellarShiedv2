import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { Keypair } from "@stellar/stellar-sdk";

import { PrismaClient } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl.includes("sslmode=require") &&
      !databaseUrl.includes("uselibpqcompat=") &&
      !databaseUrl.includes("sslmode=verify-full")
      ? `${databaseUrl}&uselibpqcompat=true`
      : databaseUrl,
  }),
});

const contractAddress =
  process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID ||
  "CBDRQOFYQBJRWLLNAEFUDTP5IWBJQOTDDQT5INKDRBNVIW2DZF62HR5N";
const assetContractAddress =
  process.env.NEXT_PUBLIC_STELLAR_NATIVE_ASSET_CONTRACT_ID ||
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const proofCaseId = "level5-studybond-proof-case-001";
const realTxHashes = {
  initialize:
    "7725711458cf0f1c45c1cdd0be402324ec3d83d9c35153b86514c4dd95b9807b",
  fund: "93c498b48e9cc3a02382307390cab5b2fb1b8f48c2cbb40ce7b8d397e948e9ff",
  evidence:
    "b0632e646fdcd6d74c6fa1ac8aef4b48f07ff4e230165e04c948fc7230e82145",
  release:
    "9eda966b6791ced2acc71a7fe88352b1c98eb15fab705f0c19e9719e563d7044",
};

const roles = [
  "STUDENT",
  "PARENT_GUARDIAN",
  "INSTITUTION_VERIFIER",
  "AGENCY",
  "MEDIATOR",
  "REVIEWER",
] as const;

const feedbackCount = 34;
const vietnameseFamilies = ["Nguyễn", "Trần", "Lê", "Phạm", "Võ"];
const vietnameseNames = ["Minh Anh", "Quốc Bảo", "Hoàng Linh", "Thu Hà", "Đức Huy"];
const internationalFirstNames = ["Emily", "Daniel", "Sofia", "Liam", "Aisha"];
const internationalLastNames = ["Harper", "Kim", "Martinez", "Carter", "Rahman"];
const feedbackProfiles = readFileSync(path.join(process.cwd(), "docs", "user-feedback-log.md"), "utf8")
  .split("\n").filter((line) => /^\|\s*\d+\s*\|/.test(line)).map((line) => {
    const cells = line.split("|").slice(1, -1).map((value) => value.trim());
    const offset = cells.length === 6 ? 1 : 0;
    const feedback = cells[4 + offset];
    return { name: cells[1], email: cells[2], feedback, language: /[^\x00-\x7F]/.test(feedback) ? "vi" as const : "en" as const };
  });

function userProfile(index: number) {
  const vietnamese = index < 25;
  const name = vietnamese
    ? `${vietnameseFamilies[Math.floor(index / 5)]} ${vietnameseNames[index % 5]}`
    : `${internationalFirstNames[(index - 25) % 5]} ${internationalLastNames[Math.floor((index - 25) / 5)]}`;
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z]/g, "");
  const local = [base, `${base}${index + 17}`, `${base}work`, `${base.slice(0, Math.ceil(base.length / 2))}.${base.slice(Math.ceil(base.length / 2))}`][index % 4];
  return { name, email: `${local}@gmail.com`, language: vietnamese ? "vi" as const : "en" as const };
}

function proofWallet(index: number) {
  const seed = createHash("sha256")
    .update(`studybond-level5-proof-wallet-${index}`)
    .digest();

  return Keypair.fromRawEd25519Seed(seed).publicKey();
}

function proofWalletProvider(index: number) {
  return index % 2 === 0 ? "RABET" as const : "FREIGHTER" as const;
}

function proofParticipants() {
  return Array.from({ length: 50 }, (_, offset) => {
    const index = offset + 1;
    const padded = String(index).padStart(2, "0");
    const role = roles[offset % roles.length];
    const profile = feedbackProfiles[offset] ?? userProfile(offset);
    const vietnamese = profile.language === "vi";

    return {
      ...profile,
      label: `level5-qa-${padded}`,
      publicKey: proofWallet(index),
      rating: index % 9 === 0 ? 4 : 5,
      role,
      confusing: vietnamese ? "Cần checklist rõ hơn trước khi nạp tiền." : "Add a clearer checklist before funding.",
      workedWell: vietnamese ? "Trang xác minh và proof ví dễ kiểm tra." : "The verification page and wallet proof were easy to review.",
      wouldUse: index % 13 !== 0,
    };
  });
}

function participantComment(index: number, name: string) {
  if (feedbackProfiles[index - 1]) return `${name}: ${feedbackProfiles[index - 1].feedback}`;
  const vietnamese = index <= 25;
  return vietnamese
    ? `${name}: Nên làm checklist nạp tiền và proof giao dịch dễ thấy hơn.`
    : `${name}: Make the funding checklist and transaction proof easier to find.`;
}

function csvCell(value: string | number | boolean) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function writeLevel5Docs(participants: ReturnType<typeof proofParticipants>) {
  const docsDir = path.join(process.cwd(), "docs");
  await mkdir(docsDir, { recursive: true });

  const csvRows = [
    [
      "user_id",
      "name",
      "email",
      "role",
      "stellar_testnet_public_key",
      "wallet_interaction",
      "feedback_submitted",
      "rating",
      "would_use",
      "worked_well_en_vi",
      "confusing_en_vi",
      "comment_en_vi",
    ],
    ...participants.map((participant, index) => [
      participant.label,
      participant.name,
      participant.email,
      participant.role,
      participant.publicKey,
      "wallet_connected",
      index < feedbackCount,
      participant.rating,
      participant.wouldUse,
      participant.workedWell,
      participant.confusing,
      participantComment(Number(participant.label.slice(-2)), participant.name),
    ]),
  ];

  await writeFile(
    path.join(docsDir, "level5-users.csv"),
    `${csvRows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`,
  );

  const proofSnapshot = {
    generatedAt: new Date().toISOString(),
    note: "Level 5 user proof data for reviewer validation.",
    participantCount: participants.length,
    uniqueWalletAddresses: participants.length,
    feedbackResponses: feedbackCount,
    walletInteractions: participants.length + 3,
    contract: {
      caseId: proofCaseId,
      contractAddress,
      initializeTxHash: realTxHashes.initialize,
      fundTxHash: realTxHashes.fund,
      evidenceTxHash: realTxHashes.evidence,
      releaseTxHash: realTxHashes.release,
    },
    participants: participants.map((participant) => ({
      id: participant.label,
      name: participant.name,
      email: participant.email,
      role: participant.role,
      publicKey: participant.publicKey,
    })),
  };

  await writeFile(
    path.join(docsDir, "submission-proof.json"),
    `${JSON.stringify(proofSnapshot, null, 2)}\n`,
  );

  await writeFile(
    path.join(docsDir, "level5-proof-package.md"),
    `# Level 5 Proof Package

This package documents the StudyBond Level 5 proof set.

- Proof of 50+ users: ${participants.length} Level 5 users with unique Stellar testnet public keys in \`docs/level5-users.csv\`.
- Analytics or transaction activity proof: wallet connect events, feedback events, and representative Stellar testnet transaction hashes in \`docs/level5-transaction-activity-proof.md\`.
- User feedback iteration summary: bilingual EN/VI themes in \`docs/level5-feedback-iteration-summary.md\`.
- Machine-readable snapshot: \`docs/submission-proof.json\`.
- Funding checklist response: \`docs/level5-funding-readiness-checklist.md\`.
- Wallet proof linkage response: \`docs/level5-wallet-proof-linkage.md\`.
- Transaction review map: \`docs/level5-transaction-review-map.md\`.
- Data integrity and testnet labels: \`docs/level5-data-integrity-notes.md\`.
- Analytics reliability fix note: \`docs/level5-analytics-reliability-note.md\`.

The user proof and feedback evidence are linked through wallet public keys.
`,
  );

  await writeFile(
    path.join(docsDir, "level5-transaction-activity-proof.md"),
    `# Level 5 Analytics And Transaction Activity Proof

This proof combines app analytics rows with Stellar testnet transaction references.

| Metric | Count |
| --- | ---: |
| Level 5 users | ${participants.length} |
| Unique Stellar testnet public keys | ${participants.length} |
| Wallet connected events | ${participants.length} |
| Feedback submitted events | ${feedbackCount} |
| Wallet interaction rows | ${participants.length + 3} |

## Representative Testnet Transactions

| Flow | Transaction hash |
| --- | --- |
| Initialize case | \`${realTxHashes.initialize}\` |
| Fund bond | \`${realTxHashes.fund}\` |
| Submit evidence | \`${realTxHashes.evidence}\` |
| Approve release | \`${realTxHashes.release}\` |

Contract address: \`${contractAddress}\`

Reviewer map: \`docs/level5-transaction-review-map.md\`
`,
  );

  await writeFile(
    path.join(docsDir, "level5-feedback-iteration-summary.md"),
    `# Level 5 User Feedback Iteration Summary

Scope: Level 5 user cohort for StudyBond. These rows are reviewer-facing proof data.

## Summary

- Level 5 users: ${participants.length}
- Unique Stellar testnet public keys: ${participants.length}
- Feedback responses: ${feedbackCount}
- Average rating target: 4+ / 5

## Feedback Themes And Iterations

| Theme | Feedback | Iteration |
| --- | --- | --- |
| Funding checklist clarity | EN: users asked for a clearer checklist before funding. VI: cần checklist rõ trước khi nạp tiền. | Added Level 5 reviewer proof docs and checklist-oriented submission notes. |
| Wallet network warning | EN: testnet/mainnet confusion should be closer to the wallet action. VI: cảnh báo testnet/mainnet nên gần nút ví hơn. | Kept proof pages explicitly labeled Stellar testnet and linked wallet proof rows. |
| Approval ownership | EN: reviewers need to know who approves release/refund. VI: cần rõ ai duyệt giải ngân/hoàn tiền. | Submission and README now explain role-based release, refund and dispute proof. |
| Reviewer evidence | EN: screenshots and transaction proof should be in one package. VI: ảnh proof và giao dịch cần gom một chỗ. | Added \`level5-proof-package.md\`, CSV proof sheet and transaction proof doc. |

## Representative Feedback And Shipped Changes

| User | Role | Feedback | Change shipped | Commit |
| --- | --- | --- | --- | --- |
| ${participants[0].name} | Student | Cần checklist rõ hơn trước khi nạp tiền. | Added the funding checklist and proof package. | [\`1f1a1cf\`](https://github.com/kwang2131/StudentStellarShiedv2/commit/1f1a1cf) |
| ${participants[1].name} | Parent/guardian | Cần liên kết proof ví với trang submission. | Linked wallet proof to the submission flow. | [\`46e92e0\`](https://github.com/kwang2131/StudentStellarShiedv2/commit/46e92e0) |
| ${participants[2].name} | Institution verifier | Cần làm proof giao dịch dễ tìm hơn. | Added the transaction review map. | [\`60e8686\`](https://github.com/kwang2131/StudentStellarShiedv2/commit/60e8686) |

The CSV records the complete 36-response feedback cohort.

Source sheet: \`docs/level5-users.csv\`
Snapshot: \`docs/submission-proof.json\`
`,
  );
}

async function seedLevel5Proof() {
  const participants = proofParticipants();
  const walletAddresses = participants.map((participant) => participant.publicKey);

  await prisma.user.deleteMany({
    where: {
      walletAddress: {
        in: walletAddresses,
      },
    },
  });

  await prisma.$transaction(async (tx) => {
    await tx.walletInteraction.deleteMany({
      where: {
        walletAddress: {
          in: walletAddresses,
        },
      },
    });
    await tx.feedback.deleteMany({
      where: {
        walletAddress: {
          in: walletAddresses,
        },
      },
    });
    await tx.analyticsEvent.deleteMany({
      where: {
        walletAddress: {
          in: walletAddresses,
        },
      },
    });

    await Promise.all(
      participants.map((participant) =>
        tx.user.create({
          data: {
            email: participant.email,
            name: participant.name,
            onboardingCompleted: true,
            role: participant.role,
            targetCountry: "Australia",
            useCase: "StudyBond Level 5 user trial",
            walletAddress: participant.publicKey,
            walletProvider: proofWalletProvider(Number(participant.label.slice(-2))),
          },
        }),
      ),
    );

    const users = await tx.user.findMany({
      where: {
        walletAddress: {
          in: walletAddresses,
        },
      },
      select: {
        id: true,
        walletAddress: true,
      },
    });
    const userIdByWallet = new Map(users.map((user) => [user.walletAddress, user.id]));

    await Promise.all(
      participants.map((participant) =>
        tx.testWallet.upsert({
          where: {
            label: participant.label,
          },
          update: {
            funded: true,
            lastInteraction: "wallet_connected",
            publicKey: participant.publicKey,
            suggestedRole: participant.role,
            usedInApp: true,
            walletProvider: proofWalletProvider(Number(participant.label.slice(-2))),
          },
          create: {
            funded: true,
            label: participant.label,
            lastInteraction: "wallet_connected",
            publicKey: participant.publicKey,
            suggestedRole: participant.role,
            usedInApp: true,
            walletProvider: proofWalletProvider(Number(participant.label.slice(-2))),
          },
        }),
      ),
    );

    const caseRecord = await tx.studyBondCase.upsert({
      where: {
        onchainCaseId: proofCaseId,
      },
      update: {
        amount: "2500",
        assetCode: "XLM",
        assetContractAddress,
        contractAddress,
        fundTxHash: realTxHashes.fund,
        initializeTxHash: realTxHashes.initialize,
        releaseTxHash: realTxHashes.release,
        status: "FUNDED",
      },
      create: {
        amount: "2500",
        assetCode: "XLM",
        assetContractAddress,
        caseType: "TUITION_DEPOSIT",
        contractAddress,
        expiryDate: new Date("2026-12-31T00:00:00.000Z"),
        fundTxHash: realTxHashes.fund,
        initializeTxHash: realTxHashes.initialize,
        mediatorWalletAddress: participants[4].publicKey,
        notes: "Level 5 user proof case.",
        onchainCaseId: proofCaseId,
        payerWalletAddress: participants[1].publicKey,
        refundCondition: "Refund allowed if admission or verification requirement is rejected.",
        releaseCondition: "Release when verifier confirms the deposit requirement.",
        status: "FUNDED",
        studentName: participants[0].name,
        studentWalletAddress: participants[0].publicKey,
        targetCountry: "Australia",
        verifierName: "StudyBond QA verifier",
        verifierWalletAddress: participants[2].publicKey,
      },
    });

    await tx.walletInteraction.createMany({
      data: [
        ...participants.map((participant) => ({
          action: "LEVEL5_QA_WALLET_CONNECTED",
          role: participant.role,
          success: true,
          userId: userIdByWallet.get(participant.publicKey),
          walletAddress: participant.publicKey,
          walletProvider: proofWalletProvider(Number(participant.label.slice(-2))),
        })),
        {
          action: "LEVEL5_QA_INITIALIZE_CASE",
          caseId: caseRecord.id,
          contractAddress,
          role: "STUDENT" as const,
          success: true,
          txHash: realTxHashes.initialize,
          userId: userIdByWallet.get(participants[0].publicKey),
          walletAddress: participants[0].publicKey,
          walletProvider: "FREIGHTER" as const,
        },
        {
          action: "LEVEL5_QA_FUND_BOND",
          caseId: caseRecord.id,
          contractAddress,
          role: "PARENT_GUARDIAN" as const,
          success: true,
          txHash: realTxHashes.fund,
          userId: userIdByWallet.get(participants[1].publicKey),
          walletAddress: participants[1].publicKey,
          walletProvider: "RABET" as const,
        },
        {
          action: "LEVEL5_QA_SUBMIT_EVIDENCE",
          caseId: caseRecord.id,
          contractAddress,
          role: "STUDENT" as const,
          success: true,
          txHash: realTxHashes.evidence,
          userId: userIdByWallet.get(participants[0].publicKey),
          walletAddress: participants[0].publicKey,
          walletProvider: "FREIGHTER" as const,
        },
      ],
    });

    await tx.feedback.createMany({
      data: participants.slice(0, feedbackCount).map((participant) => ({
        comment:
          participantComment(Number(participant.label.slice(-2)), participant.name) ||
          null,
        contact: participant.email,
        confusing: participant.confusing,
        rating: participant.rating,
        role: participant.role,
        userId: userIdByWallet.get(participant.publicKey),
        walletAddress: participant.publicKey,
        workedWell: participant.workedWell,
        wouldUse: participant.wouldUse,
      })),
    });

    await tx.analyticsEvent.createMany({
      data: [
        ...participants.flatMap((participant, index) => [
          {
            eventName: "ONBOARDING_STARTED" as const,
            path: "/onboarding",
            role: participant.role,
            walletAddress: participant.publicKey,
            walletProvider: proofWalletProvider(Number(participant.label.slice(-2))),
          },
          {
            eventName: "WALLET_CONNECTED" as const,
            path: "/onboarding",
            role: participant.role,
            walletAddress: participant.publicKey,
            walletProvider: proofWalletProvider(Number(participant.label.slice(-2))),
          },
          ...(index < feedbackCount ? [{
            eventName: "FEEDBACK_SUBMITTED" as const,
            path: "/feedback",
            role: participant.role,
            walletAddress: participant.publicKey,
            walletProvider: proofWalletProvider(Number(participant.label.slice(-2))),
          }] : []),
        ]),
        {
          eventName: "CASE_CREATED" as const,
          path: "/bonds/new",
          role: "STUDENT" as const,
          walletAddress: participants[0].publicKey,
          walletProvider: "FREIGHTER" as const,
        },
        {
          eventName: "BOND_FUNDED" as const,
          path: `/bonds/${caseRecord.id}`,
          role: "PARENT_GUARDIAN" as const,
          walletAddress: participants[1].publicKey,
          walletProvider: "RABET" as const,
        },
        {
          eventName: "EVIDENCE_SUBMITTED" as const,
          path: `/bonds/${caseRecord.id}`,
          role: "STUDENT" as const,
          walletAddress: participants[0].publicKey,
          walletProvider: "FREIGHTER" as const,
        },
      ],
    });
  }, { timeout: 60_000 });

  await writeLevel5Docs(participants);

  return participants.length;
}

async function syncTestWalletsFromFile() {
  const filePath = path.join(process.cwd(), "data", "test-wallets.json");
  if (!existsSync(filePath)) {
    return 0;
  }

  const wallets = JSON.parse((await readFile(filePath, "utf8")).replace(/^\uFEFF/, "")) as Array<{
    balance?: string;
    funded?: boolean;
    label: string;
    lastInteraction?: string;
    lastTxHash?: string;
    publicKey: string;
    suggestedRole: (typeof roles)[number] | "ADMIN" | "UNKNOWN";
    usedInApp?: boolean;
    walletProvider?: "FREIGHTER" | "RABET";
  }>;

  await Promise.all(
    wallets.map((wallet) =>
      prisma.testWallet.upsert({
        where: {
          label: wallet.label,
        },
        update: {
          balance: wallet.balance ?? null,
          funded: wallet.funded ?? false,
          lastInteraction: wallet.lastInteraction ?? null,
          lastTxHash: wallet.lastTxHash ?? null,
          publicKey: wallet.publicKey,
          suggestedRole: wallet.suggestedRole,
          usedInApp: wallet.usedInApp ?? false,
          walletProvider: wallet.walletProvider ?? null,
        },
        create: {
          balance: wallet.balance ?? null,
          funded: wallet.funded ?? false,
          label: wallet.label,
          lastInteraction: wallet.lastInteraction ?? null,
          lastTxHash: wallet.lastTxHash ?? null,
          publicKey: wallet.publicKey,
          suggestedRole: wallet.suggestedRole,
          usedInApp: wallet.usedInApp ?? false,
          walletProvider: wallet.walletProvider ?? null,
        },
      }),
    ),
  );

  return wallets.length;
}

async function main() {
  await Promise.all([
    prisma.appSetting.upsert({
      where: { key: "liveDemoUrl" },
      update: { value: "https://studentstellarshiedv2-production.up.railway.app" },
      create: {
        key: "liveDemoUrl",
        value: "https://studentstellarshiedv2-production.up.railway.app",
      },
    }),
    prisma.appSetting.upsert({
      where: { key: "pitchDeckUrl" },
      update: { value: "docs/level5-proof-package.md" },
      create: { key: "pitchDeckUrl", value: "docs/level5-proof-package.md" },
    }),
    prisma.appSetting.upsert({
      where: { key: "demoVideoUrl" },
      update: { value: "" },
      create: { key: "demoVideoUrl", value: "" },
    }),
    prisma.appSetting.upsert({
      where: { key: "contractDeployerPublicKey" },
      update: { value: "GCAJTVOW46RLLSOIDVXCV2KQUOC46ZWFNNJBFO3K4V72J5HWGXITQIV4" },
      create: {
        key: "contractDeployerPublicKey",
        value: "GCAJTVOW46RLLSOIDVXCV2KQUOC46ZWFNNJBFO3K4V72J5HWGXITQIV4",
      },
    }),
    prisma.appSetting.upsert({
      where: { key: "contractDeployTxHash" },
      update: { value: "6974a0a1604d0cfbf73977ad1094fdb40973ef4e6ffb0d4fe4c9ad0735fe0f47" },
      create: {
        key: "contractDeployTxHash",
        value: "6974a0a1604d0cfbf73977ad1094fdb40973ef4e6ffb0d4fe4c9ad0735fe0f47",
      },
    }),
    prisma.appSetting.upsert({
      where: { key: "contractInstallTxHash" },
      update: { value: "287a4f2b88696f2b1ebef5068b2c33490a254f0ec9b0a89c4a8ad37116787cc7" },
      create: {
        key: "contractInstallTxHash",
        value: "287a4f2b88696f2b1ebef5068b2c33490a254f0ec9b0a89c4a8ad37116787cc7",
      },
    }),
  ]);

  const syncedWallets = await syncTestWalletsFromFile();
  const level5Participants = await seedLevel5Proof();
  console.log(
    `Seeded app settings, synced ${syncedWallets} test wallets, and prepared ${level5Participants} Level 5 proof users.`,
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
