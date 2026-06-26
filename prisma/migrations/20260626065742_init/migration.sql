-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'PARENT_GUARDIAN', 'INSTITUTION_VERIFIER', 'AGENCY', 'MEDIATOR', 'ADMIN', 'REVIEWER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "WalletProvider" AS ENUM ('FREIGHTER', 'RABET', 'MOCK', 'CLI');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('TUITION_DEPOSIT', 'DORM_DEPOSIT', 'RENTAL_DEPOSIT', 'VISA_PROOF_OF_FUNDS');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('CREATED', 'FUNDED', 'VERIFICATION_PENDING', 'EVIDENCE_SUBMITTED', 'RELEASE_APPROVED', 'REFUND_REQUESTED', 'DISPUTED', 'RELEASED', 'REFUNDED', 'EXPIRED', 'CLOSED');

-- CreateEnum
CREATE TYPE "EvidenceCategory" AS ENUM ('ADMISSION_LETTER', 'DORM_RESERVATION', 'RENTAL_OFFER', 'VISA_APPOINTMENT', 'PASSPORT_REFERENCE', 'SUPPORTING_NOTE', 'OTHER');

-- CreateEnum
CREATE TYPE "AnalyticsEventName" AS ENUM ('PAGE_VIEW', 'ONBOARDING_STARTED', 'WALLET_PROVIDER_SELECTED', 'WALLET_CONNECT_CLICKED', 'WALLET_CONNECTED', 'WALLET_CONNECTION_FAILED', 'CASE_CREATED', 'BOND_INITIALIZED_ONCHAIN', 'BOND_FUNDED', 'EVIDENCE_SUBMITTED', 'VERIFY_PAGE_VIEWED', 'RELEASE_APPROVED', 'REFUND_REQUESTED', 'REFUND_APPROVED', 'DISPUTE_OPENED', 'DISPUTE_RESOLVED', 'FEEDBACK_SUBMITTED', 'TEST_WALLET_FUNDED', 'SUBMISSION_PAGE_VIEWED', 'WALLET_DISCONNECTED', 'ERROR_CAPTURED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "walletAddress" TEXT NOT NULL,
    "walletProvider" "WalletProvider" NOT NULL,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "targetCountry" TEXT,
    "useCase" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyBondCase" (
    "id" TEXT NOT NULL,
    "onchainCaseId" TEXT NOT NULL,
    "caseType" "CaseType" NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentWalletAddress" TEXT NOT NULL,
    "payerWalletAddress" TEXT,
    "verifierName" TEXT NOT NULL,
    "verifierWalletAddress" TEXT NOT NULL,
    "mediatorWalletAddress" TEXT NOT NULL,
    "targetCountry" TEXT NOT NULL,
    "amount" DECIMAL(20,7) NOT NULL,
    "assetCode" TEXT NOT NULL,
    "assetContractAddress" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'CREATED',
    "contractAddress" TEXT,
    "initializeTxHash" TEXT,
    "fundTxHash" TEXT,
    "releaseTxHash" TEXT,
    "refundTxHash" TEXT,
    "disputeTxHash" TEXT,
    "resolutionTxHash" TEXT,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "releaseCondition" TEXT NOT NULL,
    "refundCondition" TEXT NOT NULL,
    "notes" TEXT,
    "fundingWalletProvider" "WalletProvider",
    "settledStudentAmount" DECIMAL(20,7),
    "settledVerifierAmount" DECIMAL(20,7),
    "lastContractState" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyBondCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceFile" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "category" "EvidenceCategory" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "description" TEXT,
    "relatedCondition" TEXT,
    "uploadedByRole" "UserRole" NOT NULL,
    "uploadedByWallet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "caseId" TEXT,
    "walletAddress" TEXT NOT NULL,
    "walletProvider" "WalletProvider" NOT NULL,
    "role" "UserRole" NOT NULL,
    "action" TEXT NOT NULL,
    "txHash" TEXT,
    "contractAddress" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "actorRole" "UserRole" NOT NULL,
    "actorWallet" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "txHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "userId" TEXT,
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "walletAddress" TEXT,
    "rating" INTEGER NOT NULL,
    "workedWell" TEXT NOT NULL,
    "confusing" TEXT NOT NULL,
    "wouldUse" BOOLEAN NOT NULL,
    "comment" TEXT,
    "contact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventName" "AnalyticsEventName" NOT NULL,
    "role" "UserRole",
    "walletAddress" TEXT,
    "walletProvider" "WalletProvider",
    "path" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestWallet" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "suggestedRole" "UserRole" NOT NULL,
    "funded" BOOLEAN NOT NULL DEFAULT false,
    "balance" DECIMAL(20,7),
    "lastInteraction" TEXT,
    "lastTxHash" TEXT,
    "walletProvider" "WalletProvider",
    "usedInApp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "detail" TEXT,
    "path" TEXT,
    "walletAddress" TEXT,
    "caseId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "jsonValue" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "StudyBondCase_onchainCaseId_key" ON "StudyBondCase"("onchainCaseId");

-- CreateIndex
CREATE INDEX "StudyBondCase_status_idx" ON "StudyBondCase"("status");

-- CreateIndex
CREATE INDEX "StudyBondCase_caseType_idx" ON "StudyBondCase"("caseType");

-- CreateIndex
CREATE INDEX "StudyBondCase_studentWalletAddress_idx" ON "StudyBondCase"("studentWalletAddress");

-- CreateIndex
CREATE INDEX "StudyBondCase_verifierWalletAddress_idx" ON "StudyBondCase"("verifierWalletAddress");

-- CreateIndex
CREATE INDEX "EvidenceFile_caseId_createdAt_idx" ON "EvidenceFile"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletInteraction_walletAddress_createdAt_idx" ON "WalletInteraction"("walletAddress", "createdAt");

-- CreateIndex
CREATE INDEX "WalletInteraction_caseId_createdAt_idx" ON "WalletInteraction"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletInteraction_success_createdAt_idx" ON "WalletInteraction"("success", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_caseId_createdAt_idx" ON "AuditLog"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventName_createdAt_idx" ON "AnalyticsEvent"("eventName", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_path_createdAt_idx" ON "AnalyticsEvent"("path", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TestWallet_label_key" ON "TestWallet"("label");

-- CreateIndex
CREATE UNIQUE INDEX "TestWallet_publicKey_key" ON "TestWallet"("publicKey");

-- CreateIndex
CREATE INDEX "TestWallet_suggestedRole_idx" ON "TestWallet"("suggestedRole");

-- CreateIndex
CREATE INDEX "ErrorLog_scope_createdAt_idx" ON "ErrorLog"("scope", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");

-- AddForeignKey
ALTER TABLE "EvidenceFile" ADD CONSTRAINT "EvidenceFile_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "StudyBondCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletInteraction" ADD CONSTRAINT "WalletInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletInteraction" ADD CONSTRAINT "WalletInteraction_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "StudyBondCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "StudyBondCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
