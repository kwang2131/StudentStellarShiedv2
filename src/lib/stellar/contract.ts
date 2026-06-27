import { Contract } from "@stellar/stellar-sdk";

import type { BondActionName } from "@/lib/server/bonds";

export const studyBondContractMethods = [
  "initialize_case",
  "fund_bond",
  "submit_evidence",
  "approve_release",
  "request_refund",
  "approve_refund",
  "open_dispute",
  "resolve_dispute",
  "expire_case",
  "get_case",
  "get_status",
] as const;

export type StudyBondContractMethod = (typeof studyBondContractMethods)[number];

export interface StudyBondFrontendContractIntegration {
  action: BondActionName;
  apiRoute: "/api/bonds/[id]/actions";
  contractMethod: StudyBondContractMethod;
  frontendRoute: string;
  requestFields: readonly string[];
  sourceFile: string;
}

export const studyBondFrontendContractIntegrations: readonly StudyBondFrontendContractIntegration[] =
  [
    {
      action: "INITIALIZE_CASE",
      apiRoute: "/api/bonds/[id]/actions",
      contractMethod: "initialize_case",
      frontendRoute: "/bonds/[id]",
      requestFields: ["action", "phase", "role", "walletAddress", "walletProvider"],
      sourceFile: "src/components/funding-action-panel.tsx",
    },
    {
      action: "FUND_BOND",
      apiRoute: "/api/bonds/[id]/actions",
      contractMethod: "fund_bond",
      frontendRoute: "/bonds/[id]",
      requestFields: ["action", "amount", "phase", "role", "walletAddress", "walletProvider"],
      sourceFile: "src/components/funding-action-panel.tsx",
    },
    {
      action: "SUBMIT_EVIDENCE",
      apiRoute: "/api/bonds/[id]/actions",
      contractMethod: "submit_evidence",
      frontendRoute: "/bonds/[id]",
      requestFields: ["action", "evidenceHash", "phase", "role", "walletAddress", "walletProvider"],
      sourceFile: "src/components/funding-action-panel.tsx",
    },
    {
      action: "APPROVE_RELEASE",
      apiRoute: "/api/bonds/[id]/actions",
      contractMethod: "approve_release",
      frontendRoute: "/bonds/[id]",
      requestFields: ["action", "phase", "releaseHash", "role", "walletAddress", "walletProvider"],
      sourceFile: "src/components/funding-action-panel.tsx",
    },
    {
      action: "REQUEST_REFUND",
      apiRoute: "/api/bonds/[id]/actions",
      contractMethod: "request_refund",
      frontendRoute: "/bonds/[id]",
      requestFields: [
        "action",
        "phase",
        "refundReasonHash",
        "role",
        "walletAddress",
        "walletProvider",
      ],
      sourceFile: "src/components/funding-action-panel.tsx",
    },
    {
      action: "APPROVE_REFUND",
      apiRoute: "/api/bonds/[id]/actions",
      contractMethod: "approve_refund",
      frontendRoute: "/bonds/[id]",
      requestFields: ["action", "phase", "role", "walletAddress", "walletProvider"],
      sourceFile: "src/components/funding-action-panel.tsx",
    },
    {
      action: "OPEN_DISPUTE",
      apiRoute: "/api/bonds/[id]/actions",
      contractMethod: "open_dispute",
      frontendRoute: "/bonds/[id]",
      requestFields: ["action", "disputeHash", "phase", "role", "walletAddress", "walletProvider"],
      sourceFile: "src/components/funding-action-panel.tsx",
    },
    {
      action: "RESOLVE_DISPUTE",
      apiRoute: "/api/bonds/[id]/actions",
      contractMethod: "resolve_dispute",
      frontendRoute: "/bonds/[id]",
      requestFields: [
        "action",
        "phase",
        "resolutionHash",
        "role",
        "signedXdr",
        "studentAmount",
        "verifierAmount",
        "walletAddress",
        "walletProvider",
      ],
      sourceFile: "src/components/dispute-resolution-panel.tsx",
    },
    {
      action: "EXPIRE_CASE",
      apiRoute: "/api/bonds/[id]/actions",
      contractMethod: "expire_case",
      frontendRoute: "/bonds/[id]",
      requestFields: ["action", "phase", "role", "walletAddress", "walletProvider"],
      sourceFile: "src/components/funding-action-panel.tsx",
    },
  ] as const;

const frontendIntegrationMap = Object.fromEntries(
  studyBondFrontendContractIntegrations.map((integration) => [integration.action, integration]),
) as Record<BondActionName, StudyBondFrontendContractIntegration>;

export function getStudyBondFrontendContractIntegration(action: BondActionName) {
  return frontendIntegrationMap[action];
}

export function getStudyBondSorobanContract(contractId?: string | null) {
  return contractId ? new Contract(contractId) : null;
}
