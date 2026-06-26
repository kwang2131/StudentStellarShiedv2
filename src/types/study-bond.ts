export type UserRole =
  | "STUDENT"
  | "PARENT_GUARDIAN"
  | "INSTITUTION_VERIFIER"
  | "AGENCY"
  | "MEDIATOR"
  | "ADMIN"
  | "REVIEWER"
  | "UNKNOWN";

export type WalletProvider = "FREIGHTER" | "RABET" | "MOCK" | "CLI";

export type CaseType =
  | "TUITION_DEPOSIT"
  | "DORM_DEPOSIT"
  | "RENTAL_DEPOSIT"
  | "VISA_PROOF_OF_FUNDS";

export type CaseStatus =
  | "CREATED"
  | "FUNDED"
  | "VERIFICATION_PENDING"
  | "EVIDENCE_SUBMITTED"
  | "RELEASE_APPROVED"
  | "REFUND_REQUESTED"
  | "DISPUTED"
  | "RELEASED"
  | "REFUNDED"
  | "EXPIRED"
  | "CLOSED";

export type EvidenceCategory =
  | "ADMISSION_LETTER"
  | "DORM_RESERVATION"
  | "RENTAL_OFFER"
  | "VISA_APPOINTMENT"
  | "PASSPORT_REFERENCE"
  | "SUPPORTING_NOTE"
  | "OTHER";

export type AnalyticsEventName =
  | "PAGE_VIEW"
  | "ONBOARDING_STARTED"
  | "WALLET_PROVIDER_SELECTED"
  | "WALLET_CONNECT_CLICKED"
  | "WALLET_CONNECTED"
  | "WALLET_CONNECTION_FAILED"
  | "CASE_CREATED"
  | "BOND_INITIALIZED_ONCHAIN"
  | "BOND_FUNDED"
  | "EVIDENCE_SUBMITTED"
  | "VERIFY_PAGE_VIEWED"
  | "RELEASE_APPROVED"
  | "REFUND_REQUESTED"
  | "REFUND_APPROVED"
  | "DISPUTE_OPENED"
  | "DISPUTE_RESOLVED"
  | "FEEDBACK_SUBMITTED"
  | "TEST_WALLET_FUNDED"
  | "SUBMISSION_PAGE_VIEWED"
  | "WALLET_DISCONNECTED"
  | "ERROR_CAPTURED";

export interface ContractActionResult {
  success: boolean;
  txHash?: string;
  contractAddress?: string;
  errorMessage?: string;
  raw?: unknown;
}

export interface DashboardMetric {
  label: string;
  value: number | string;
  delta?: string;
  hint?: string;
}

export interface WalletSessionSnapshot {
  provider: WalletProvider;
  role: UserRole;
  publicKey: string;
  network: string;
  balance?: string;
  connectedAt: string;
}

export interface SubmissionChecklistItem {
  id: string;
  label: string;
  complete: boolean;
  detail: string;
}
