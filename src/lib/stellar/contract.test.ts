import { describe, expect, it } from "vitest";

import {
  getStudyBondFrontendContractIntegration,
  getStudyBondSorobanContract,
  studyBondContractMethods,
  studyBondFrontendContractIntegrations,
} from "@/lib/stellar/contract";

describe("study bond soroban integration metadata", () => {
  it("maps every write method to a frontend action and API route", () => {
    expect(studyBondFrontendContractIntegrations.map((item) => item.contractMethod)).toEqual([
      "initialize_case",
      "fund_bond",
      "submit_evidence",
      "approve_release",
      "request_refund",
      "approve_refund",
      "open_dispute",
      "resolve_dispute",
      "expire_case",
    ]);

    expect(studyBondFrontendContractIntegrations.every((item) => item.apiRoute === "/api/bonds/[id]/actions")).toBe(true);
  });

  it("keeps read methods documented beside write coverage", () => {
    expect(studyBondContractMethods).toEqual([
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
    ]);
  });

  it("exposes lookup helpers for reviewer-facing contract checks", () => {
    expect(getStudyBondFrontendContractIntegration("RESOLVE_DISPUTE").contractMethod).toBe("resolve_dispute");
    expect(getStudyBondSorobanContract("CBDRQOFYQBJRWLLNAEFUDTP5IWBJQOTDDQT5INKDRBNVIW2DZF62HR5N")).not.toBeNull();
    expect(getStudyBondSorobanContract("")).toBeNull();
  });
});
