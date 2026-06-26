import { describe, expect, it } from "vitest";

import { getNavigationForRole } from "@/components/navigation";

describe("role-aware navigation", () => {
  it("shows creator-first routes for student mode", () => {
    const items = getNavigationForRole("STUDENT");

    expect(items.some((item) => item.href === "/bonds/new")).toBe(true);
    expect(items.some((item) => item.href === "/analytics")).toBe(false);
    expect(items.some((item) => item.href === "/submission")).toBe(false);
  });

  it("shows oversight routes for institution verifier mode", () => {
    const items = getNavigationForRole("INSTITUTION_VERIFIER");

    expect(items.some((item) => item.href === "/analytics")).toBe(true);
    expect(items.some((item) => item.href === "/submission")).toBe(true);
    expect(items.some((item) => item.href === "/bonds/new")).toBe(false);
  });
});
