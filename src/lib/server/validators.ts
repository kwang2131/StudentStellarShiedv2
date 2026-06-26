import { z } from "zod";

const userRoles = [
  "STUDENT",
  "PARENT_GUARDIAN",
  "INSTITUTION_VERIFIER",
  "AGENCY",
  "MEDIATOR",
  "ADMIN",
  "REVIEWER",
  "UNKNOWN",
] as const;

const walletProviders = ["FREIGHTER", "RABET", "MOCK", "CLI"] as const;
const caseTypes = [
  "TUITION_DEPOSIT",
  "DORM_DEPOSIT",
  "RENTAL_DEPOSIT",
  "VISA_PROOF_OF_FUNDS",
] as const;

const evidenceCategories = [
  "ADMISSION_LETTER",
  "DORM_RESERVATION",
  "RENTAL_OFFER",
  "VISA_APPOINTMENT",
  "PASSPORT_REFERENCE",
  "SUPPORTING_NOTE",
  "OTHER",
] as const;

const analyticsEvents = [
  "PAGE_VIEW",
  "ONBOARDING_STARTED",
  "WALLET_PROVIDER_SELECTED",
  "WALLET_CONNECT_CLICKED",
  "WALLET_CONNECTED",
  "WALLET_CONNECTION_FAILED",
  "CASE_CREATED",
  "BOND_INITIALIZED_ONCHAIN",
  "BOND_FUNDED",
  "EVIDENCE_SUBMITTED",
  "VERIFY_PAGE_VIEWED",
  "RELEASE_APPROVED",
  "REFUND_REQUESTED",
  "REFUND_APPROVED",
  "DISPUTE_OPENED",
  "DISPUTE_RESOLVED",
  "FEEDBACK_SUBMITTED",
  "TEST_WALLET_FUNDED",
  "SUBMISSION_PAGE_VIEWED",
  "WALLET_DISCONNECTED",
  "ERROR_CAPTURED",
] as const;

const caseStatuses = [
  "CREATED",
  "FUNDED",
  "VERIFICATION_PENDING",
  "EVIDENCE_SUBMITTED",
  "RELEASE_APPROVED",
  "REFUND_REQUESTED",
  "DISPUTED",
  "RELEASED",
  "REFUNDED",
  "EXPIRED",
  "CLOSED",
] as const;

const bondActions = [
  "INITIALIZE_CASE",
  "FUND_BOND",
  "SUBMIT_EVIDENCE",
  "APPROVE_RELEASE",
  "REQUEST_REFUND",
  "APPROVE_REFUND",
  "OPEN_DISPUTE",
  "RESOLVE_DISPUTE",
  "EXPIRE_CASE",
] as const;

export const roleSchema = z.enum(userRoles);
export const walletProviderSchema = z.enum(walletProviders);
export const caseTypeSchema = z.enum(caseTypes);
export const evidenceCategorySchema = z.enum(evidenceCategories);
export const analyticsEventSchema = z.enum(analyticsEvents);
export const caseStatusSchema = z.enum(caseStatuses);
export const bondActionSchema = z.enum(bondActions);

export const accountAddressSchema = z
  .string()
  .trim()
  .regex(/^G[A-Z2-7]{55}$/, "Expected a Stellar public key.");

export const contractAddressSchema = z
  .string()
  .trim()
  .regex(/^C[A-Z2-7]{55}$/, "Expected a Stellar contract address.");

export const optionalAccountAddressSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || /^G[A-Z2-7]{55}$/.test(value), {
    message: "Expected a Stellar public key.",
  });

export const onboardingSchema = z.object({
  role: roleSchema,
  walletProvider: walletProviderSchema,
  walletAddress: accountAddressSchema,
  name: z.string().trim().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  targetCountry: z.string().trim().min(2).max(64),
  useCase: z.string().trim().min(2).max(120),
});

export const createBondSchema = z.object({
  caseType: caseTypeSchema,
  studentName: z.string().trim().min(2).max(120),
  studentWalletAddress: accountAddressSchema,
  payerWalletAddress: optionalAccountAddressSchema,
  verifierName: z.string().trim().min(2).max(120),
  verifierWalletAddress: accountAddressSchema,
  mediatorWalletAddress: accountAddressSchema,
  targetCountry: z.string().trim().min(2).max(64),
  amount: z.coerce.number().positive(),
  assetCode: z.string().trim().min(2).max(12),
  assetContractAddress: contractAddressSchema,
  expiryDate: z.string().datetime(),
  releaseCondition: z.string().trim().min(8).max(600),
  refundCondition: z.string().trim().min(8).max(600),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const evidenceMetadataSchema = z.object({
  category: evidenceCategorySchema,
  fileName: z.string().trim().min(2).max(200),
  fileUrl: z.string().trim().url(),
  fileHash: z.string().trim().min(16).max(128),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  relatedCondition: z.string().trim().max(300).optional().or(z.literal("")),
  uploadedByRole: roleSchema,
  uploadedByWallet: accountAddressSchema,
});

export const prepareBondActionPayloadSchema = z.object({
  phase: z.literal("prepare"),
  action: bondActionSchema,
  role: roleSchema,
  walletProvider: walletProviderSchema,
  walletAddress: accountAddressSchema,
  amount: z.coerce.number().positive().optional(),
  evidenceHash: z.string().trim().min(16).max(128).optional(),
  refundReasonHash: z.string().trim().min(16).max(128).optional(),
  releaseHash: z.string().trim().min(16).max(128).optional(),
  disputeHash: z.string().trim().min(16).max(128).optional(),
  resolutionHash: z.string().trim().min(16).max(128).optional(),
  studentAmount: z.coerce.number().nonnegative().optional(),
  verifierAmount: z.coerce.number().nonnegative().optional(),
});

export const submitBondActionPayloadSchema = prepareBondActionPayloadSchema.extend({
  phase: z.literal("submit"),
  signedXdr: z.string().min(1),
});

export const failedBondActionPayloadSchema = z.object({
  phase: z.literal("failure"),
  action: bondActionSchema,
  role: roleSchema,
  walletProvider: walletProviderSchema,
  walletAddress: accountAddressSchema,
  errorMessage: z.string().trim().min(2).max(500),
});

export const feedbackSchema = z.object({
  role: roleSchema,
  walletAddress: z.string().trim().optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5),
  workedWell: z.string().trim().min(8).max(800),
  confusing: z.string().trim().min(8).max(800),
  wouldUse: z.coerce.boolean(),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
  contact: z.string().trim().max(200).optional().or(z.literal("")),
});

export const analyticsPayloadSchema = z.object({
  eventName: analyticsEventSchema,
  role: roleSchema.optional(),
  walletAddress: z.string().trim().optional(),
  walletProvider: walletProviderSchema.optional(),
  path: z.string().trim().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const bondFiltersSchema = z.object({
  search: z.string().trim().optional(),
  status: caseStatusSchema.optional(),
  caseType: caseTypeSchema.optional(),
});

export type CreateBondInput = z.infer<typeof createBondSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type EvidenceMetadataInput = z.infer<typeof evidenceMetadataSchema>;
export type PrepareBondActionInput = z.infer<typeof prepareBondActionPayloadSchema>;
export type SubmitBondActionInput = z.infer<typeof submitBondActionPayloadSchema>;
export type FailedBondActionInput = z.infer<typeof failedBondActionPayloadSchema>;
export type AnalyticsPayloadInput = z.infer<typeof analyticsPayloadSchema>;
export type BondFiltersInput = z.infer<typeof bondFiltersSchema>;
