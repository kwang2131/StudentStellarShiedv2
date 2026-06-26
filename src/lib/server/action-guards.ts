import type { BondActionName } from "@/lib/server/bonds";

const fundedStatuses = new Set([
  "FUNDED",
  "VERIFICATION_PENDING",
  "EVIDENCE_SUBMITTED",
  "REFUND_REQUESTED",
  "DISPUTED",
  "EXPIRED",
]);

interface GuardOptions {
  bondAmount?: number;
  studentAmount?: number;
  verifierAmount?: number;
}

export function ensureCaseAllowsAction(
  action: BondActionName,
  status: string,
  options: GuardOptions = {},
) {
  switch (action) {
    case "INITIALIZE_CASE":
      return;
    case "FUND_BOND":
      if (status !== "CREATED") {
        throw new Error("Only newly created cases can be funded.");
      }
      return;
    case "SUBMIT_EVIDENCE":
      if (!fundedStatuses.has(status)) {
        throw new Error("Evidence can only be added after the bond is funded.");
      }
      return;
    case "APPROVE_RELEASE":
      if (!fundedStatuses.has(status) || status === "REFUND_REQUESTED" || status === "DISPUTED") {
        throw new Error("Release is only available on funded, undisputed cases.");
      }
      return;
    case "REQUEST_REFUND":
      if (!fundedStatuses.has(status)) {
        throw new Error("Refund cannot be requested before the bond is funded.");
      }
      return;
    case "APPROVE_REFUND":
      if (status !== "REFUND_REQUESTED" && status !== "EXPIRED") {
        throw new Error("Refund approval requires a refund request or expired case.");
      }
      return;
    case "OPEN_DISPUTE":
      if (!fundedStatuses.has(status)) {
        throw new Error("Disputes can only be opened after funding.");
      }
      return;
    case "RESOLVE_DISPUTE": {
      if (status !== "DISPUTED" && status !== "EXPIRED") {
        throw new Error("Only disputed or expired cases can be resolved.");
      }

      const studentAmount = options.studentAmount ?? 0;
      const verifierAmount = options.verifierAmount ?? 0;
      const total = studentAmount + verifierAmount;

      if (total <= 0) {
        throw new Error("Resolution amounts must be greater than zero.");
      }

      if (
        typeof options.bondAmount === "number" &&
        Number.isFinite(options.bondAmount) &&
        total !== options.bondAmount
      ) {
        throw new Error("Resolution amounts must exactly match the locked bond amount.");
      }

      return;
    }
    case "EXPIRE_CASE":
      return;
    default:
      return;
  }
}
