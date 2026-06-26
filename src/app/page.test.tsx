import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@/lib/server/dashboard", () => ({
  getDashboardData: vi.fn().mockResolvedValue({
    latestCases: [],
    recentActivity: [],
    totals: {
      disputedCases: 0,
      feedbackCount: 0,
      fundedCases: 3,
      refundedCases: 0,
      releasedCases: 0,
      totalCases: 4,
      totalLockedValue: 320,
      uniqueWalletsCount: 0,
      walletInteractionsCount: 12,
    },
  }),
}));

describe("landing page", () => {
  it("renders the core messaging and supported wallets", async () => {
    const pageModule = await import("./page");
    const Page = pageModule.default;

    render(await Page());

    expect(
      screen.getByRole("heading", {
        name: /cross-border deposits that show what the money is for/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Freighter/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rabet/i).length).toBeGreaterThan(0);
  });
});
