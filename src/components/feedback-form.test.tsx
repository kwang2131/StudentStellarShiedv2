import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

const fetchJson = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/components/providers/wallet-provider", () => ({
  useWallet: () => ({
    role: "STUDENT",
    session: {
      publicKey: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    },
  }),
}));

vi.mock("@/lib/client/fetch-json", () => ({
  fetchJson,
}));

describe("FeedbackForm", () => {
  it("does not submit when required answers are missing", async () => {
    const user = userEvent.setup();
    const { FeedbackForm } = await import("./feedback-form");

    render(<FeedbackForm />);

    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    await waitFor(() => {
      expect(fetchJson).not.toHaveBeenCalled();
    });
  });
});
