import { describe, expect, it } from "vitest";

import { canRolePerformAction } from "./policies";

describe("canRolePerformAction", () => {
  it("prevents the wrong role from funding a bond", () => {
    expect(canRolePerformAction("FUND_BOND", "INSTITUTION_VERIFIER")).toBe(false);
    expect(canRolePerformAction("FUND_BOND", "STUDENT")).toBe(true);
  });
});
