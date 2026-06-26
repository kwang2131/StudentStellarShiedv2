import type {
  AnalyticsEventName,
  CaseStatus,
  CaseType,
  EvidenceCategory,
  UserRole,
  WalletProvider,
} from "@/types/study-bond";

type SupportedWalletProvider = Extract<WalletProvider, "FREIGHTER" | "RABET">;

export const APP_NAME = "StudyBond";
export const APP_TAGLINE =
  "Purpose-bound proof-of-funds and conditional deposit rail for international students.";

export const STELLAR_TESTNET_DISCLAIMER =
  "Testnet demo only. No real money, no licensed escrow claim, and no legal proof-of-funds representation.";

export const ROLE_OPTIONS: Array<{ label: string; value: UserRole; description: string }> = [
  {
    label: "Student",
    value: "STUDENT",
    description: "Create a bond, fund it, upload evidence, and request refunds.",
  },
  {
    label: "Parent / Guardian",
    value: "PARENT_GUARDIAN",
    description: "Fund on behalf of a student and monitor release conditions.",
  },
  {
    label: "Institution / Verifier",
    value: "INSTITUTION_VERIFIER",
    description: "Verify funding proof and approve release or refund decisions.",
  },
  {
    label: "Agency",
    value: "AGENCY",
    description: "Track multiple international student cases across regions.",
  },
  {
    label: "Mediator",
    value: "MEDIATOR",
    description: "Resolve disputes and handle exceptional settlement outcomes.",
  },
];

export const WALLET_OPTIONS: Array<{
  label: string;
  value: SupportedWalletProvider;
  installUrl: string;
  shortLabel: string;
}> = [
  {
    label: "Freighter",
    value: "FREIGHTER",
    installUrl: "https://www.freighter.app/",
    shortLabel: "FR",
  },
  {
    label: "Rabet",
    value: "RABET",
    installUrl: "https://rabet.io/",
    shortLabel: "RB",
  },
];

export const CASE_TYPE_OPTIONS: Array<{ label: string; value: CaseType }> = [
  { label: "Tuition deposit", value: "TUITION_DEPOSIT" },
  { label: "Dorm deposit", value: "DORM_DEPOSIT" },
  { label: "Rental deposit", value: "RENTAL_DEPOSIT" },
  { label: "Visa proof of funds", value: "VISA_PROOF_OF_FUNDS" },
];

export const EVIDENCE_CATEGORY_OPTIONS: Array<{
  label: string;
  value: EvidenceCategory;
}> = [
  { label: "Admission letter", value: "ADMISSION_LETTER" },
  { label: "Dorm reservation", value: "DORM_RESERVATION" },
  { label: "Rental offer", value: "RENTAL_OFFER" },
  { label: "Visa appointment proof", value: "VISA_APPOINTMENT" },
  { label: "Passport reference", value: "PASSPORT_REFERENCE" },
  { label: "Supporting note", value: "SUPPORTING_NOTE" },
  { label: "Other", value: "OTHER" },
];

export const STATUS_ORDER: CaseStatus[] = [
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
];

export const TRACKED_EVENTS: AnalyticsEventName[] = [
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
];

export const TEST_WALLET_LABELS = [
  "student-01",
  "student-02",
  "parent-01",
  "school-01",
  "dorm-01",
  "landlord-01",
  "agency-01",
  "verifier-01",
  "admin-01",
  "mediator-01",
  "reviewer-01",
  "reviewer-02",
] as const;
