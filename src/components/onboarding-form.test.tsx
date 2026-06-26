import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

const setRole = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/components/providers/wallet-provider", () => ({
  useWallet: () => ({
    available: { FREIGHTER: true, RABET: true },
    connect: vi.fn(),
    connecting: false,
    disconnect: vi.fn(),
    error: null,
    networkMismatch: false,
    provider: "FREIGHTER",
    refreshBalance: vi.fn(),
    role: "STUDENT",
    session: {
      balance: "100",
      network: "testnet",
      networkPassphrase: "Test SDF Network ; September 2015",
      provider: "FREIGHTER",
      publicKey: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    },
    setProvider: vi.fn(),
    setRole,
    signTransaction: vi.fn(),
  }),
}));

describe("OnboardingForm", () => {
  it("shows role selection and both wallet providers", async () => {
    const user = userEvent.setup();
    const { OnboardingForm } = await import("./onboarding-form");

    render(<OnboardingForm />);

    expect(screen.getAllByText(/Freighter/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rabet/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /Parent \/ Guardian/i }));
    expect(setRole).toHaveBeenCalledWith("PARENT_GUARDIAN");
  });
});
