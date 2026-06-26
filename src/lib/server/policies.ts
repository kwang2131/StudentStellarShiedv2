import type { UserRole } from "@/types/study-bond";
import type { BondActionName } from "@/lib/server/bonds";

const actionRoles: Record<BondActionName, UserRole[]> = {
  APPROVE_REFUND: ["INSTITUTION_VERIFIER", "MEDIATOR"],
  APPROVE_RELEASE: ["INSTITUTION_VERIFIER"],
  EXPIRE_CASE: ["MEDIATOR"],
  FUND_BOND: ["STUDENT", "PARENT_GUARDIAN"],
  INITIALIZE_CASE: ["STUDENT", "AGENCY", "PARENT_GUARDIAN"],
  OPEN_DISPUTE: ["STUDENT", "INSTITUTION_VERIFIER"],
  REQUEST_REFUND: ["STUDENT"],
  RESOLVE_DISPUTE: ["MEDIATOR"],
  SUBMIT_EVIDENCE: ["STUDENT"],
};

export function canRolePerformAction(action: BondActionName, role: UserRole) {
  return actionRoles[action].includes(role);
}

export function getActionRoles(action: BondActionName) {
  return actionRoles[action];
}
