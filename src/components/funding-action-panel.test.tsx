import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/components/providers/wallet-provider", () => ({
  useWallet: () => ({
    provider: "FREIGHTER",
    role: "STUDENT",
    session: {
      provider: "FREIGHTER",
      publicKey: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    },
    signTransaction: vi.fn(),
  }),
}));

describe("FundingActionPanel", () => {
  it("shows only student-allowed actions", async () => {
    const { FundingActionPanel } = await import("./funding-action-panel");

    render(
      <FundingActionPanel amount="100" caseId="case-1" hasContract={false} status="CREATED" />,
    );

    expect(screen.getByRole("button", { name: /Fund StudyBond/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Request refund/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Approve release/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Approve refund/i })).not.toBeInTheDocument();
  });
});
