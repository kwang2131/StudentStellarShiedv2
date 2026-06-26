import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@/components/providers/wallet-provider", () => ({
  useWallet: () => ({
    role: "MEDIATOR",
    session: null,
  }),
}));

describe("RoleCommandCenter", () => {
  it("renders mediator-specific actions", async () => {
    const { RoleCommandCenter } = await import("./role-command-center");

    render(<RoleCommandCenter />);

    expect(screen.getByRole("heading", { name: "Mediator" })).toBeInTheDocument();
    expect(screen.getByText(/Prepare audit handoff/i)).toBeInTheDocument();
    expect(screen.queryByText(/Create your deposit case/i)).not.toBeInTheDocument();
  });
});
