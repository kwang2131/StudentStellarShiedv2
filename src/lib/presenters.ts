import type {
  AuditLog,
  EvidenceFile,
  Feedback,
  StudyBondCase,
  TestWallet,
  WalletInteraction,
} from "@/generated/prisma/client";

function maybeJsonRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function serializeBondCase(caseItem: StudyBondCase) {
  return {
    id: caseItem.id,
    onchainCaseId: caseItem.onchainCaseId,
    caseType: caseItem.caseType,
    studentName: caseItem.studentName,
    studentWalletAddress: caseItem.studentWalletAddress,
    payerWalletAddress: caseItem.payerWalletAddress,
    verifierName: caseItem.verifierName,
    verifierWalletAddress: caseItem.verifierWalletAddress,
    mediatorWalletAddress: caseItem.mediatorWalletAddress,
    targetCountry: caseItem.targetCountry,
    amount: caseItem.amount.toString(),
    assetCode: caseItem.assetCode,
    assetContractAddress: caseItem.assetContractAddress,
    status: caseItem.status,
    contractAddress: caseItem.contractAddress,
    initializeTxHash: caseItem.initializeTxHash,
    fundTxHash: caseItem.fundTxHash,
    releaseTxHash: caseItem.releaseTxHash,
    refundTxHash: caseItem.refundTxHash,
    disputeTxHash: caseItem.disputeTxHash,
    resolutionTxHash: caseItem.resolutionTxHash,
    expiryDate: caseItem.expiryDate.toISOString(),
    releaseCondition: caseItem.releaseCondition,
    refundCondition: caseItem.refundCondition,
    notes: caseItem.notes,
    fundingWalletProvider: caseItem.fundingWalletProvider,
    settledStudentAmount: caseItem.settledStudentAmount?.toString() ?? null,
    settledVerifierAmount: caseItem.settledVerifierAmount?.toString() ?? null,
    lastContractState: maybeJsonRecord(caseItem.lastContractState),
    createdAt: caseItem.createdAt.toISOString(),
    updatedAt: caseItem.updatedAt.toISOString(),
  };
}

export function serializeAuditLog(log: AuditLog) {
  return {
    id: log.id,
    caseId: log.caseId,
    actorRole: log.actorRole,
    actorWallet: log.actorWallet,
    action: log.action,
    message: log.message,
    txHash: log.txHash,
    metadata: maybeJsonRecord(log.metadata),
    createdAt: log.createdAt.toISOString(),
  };
}

export function serializeEvidenceFile(file: EvidenceFile) {
  return {
    id: file.id,
    caseId: file.caseId,
    category: file.category,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    fileHash: file.fileHash,
    description: file.description,
    relatedCondition: file.relatedCondition,
    uploadedByRole: file.uploadedByRole,
    uploadedByWallet: file.uploadedByWallet,
    createdAt: file.createdAt.toISOString(),
  };
}

export function serializeWalletInteraction(interaction: WalletInteraction) {
  return {
    id: interaction.id,
    userId: interaction.userId,
    caseId: interaction.caseId,
    walletAddress: interaction.walletAddress,
    walletProvider: interaction.walletProvider,
    role: interaction.role,
    action: interaction.action,
    txHash: interaction.txHash,
    contractAddress: interaction.contractAddress,
    success: interaction.success,
    errorMessage: interaction.errorMessage,
    metadata: maybeJsonRecord(interaction.metadata),
    createdAt: interaction.createdAt.toISOString(),
  };
}

export function serializeFeedback(feedback: Feedback) {
  return {
    id: feedback.id,
    userId: feedback.userId,
    role: feedback.role,
    walletAddress: feedback.walletAddress,
    rating: feedback.rating,
    workedWell: feedback.workedWell,
    confusing: feedback.confusing,
    wouldUse: feedback.wouldUse,
    comment: feedback.comment,
    contact: feedback.contact,
    createdAt: feedback.createdAt.toISOString(),
  };
}

export function serializeTestWallet(wallet: TestWallet) {
  return {
    id: wallet.id,
    label: wallet.label,
    publicKey: wallet.publicKey,
    suggestedRole: wallet.suggestedRole,
    funded: wallet.funded,
    balance: wallet.balance?.toString() ?? null,
    lastInteraction: wallet.lastInteraction,
    lastTxHash: wallet.lastTxHash,
    walletProvider: wallet.walletProvider,
    usedInApp: wallet.usedInApp,
    createdAt: wallet.createdAt.toISOString(),
    updatedAt: wallet.updatedAt.toISOString(),
  };
}
