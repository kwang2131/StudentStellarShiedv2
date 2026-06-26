import { describe, expect, it } from "vitest";

import { ensureCaseAllowsAction } from "./action-guards";

describe("ensureCaseAllowsAction", () => {
  it("blocks release before funded", () => {
    expect(() => ensureCaseAllowsAction("APPROVE_RELEASE", "CREATED")).toThrow(
      /funded, undisputed cases/i,
    );
  });

  it("blocks refund before funded", () => {
    expect(() => ensureCaseAllowsAction("REQUEST_REFUND", "CREATED")).toThrow(
      /cannot be requested before the bond is funded/i,
    );
  });

  it("blocks dispute resolution when case is not disputed", () => {
    expect(() =>
      ensureCaseAllowsAction("RESOLVE_DISPUTE", "FUNDED", {
        bondAmount: 100,
        studentAmount: 50,
        verifierAmount: 50,
      }),
    ).toThrow(/only disputed or expired cases/i);
  });

  it("blocks dispute splits that do not match the locked amount", () => {
    expect(() =>
      ensureCaseAllowsAction("RESOLVE_DISPUTE", "DISPUTED", {
        bondAmount: 100,
        studentAmount: 100,
        verifierAmount: 10,
      }),
    ).toThrow(/must exactly match the locked bond amount/i);
  });
});
