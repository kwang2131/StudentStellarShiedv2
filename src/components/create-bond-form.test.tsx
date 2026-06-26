import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

const fetchJson = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/components/providers/wallet-provider", () => ({
  useWallet: () => ({
    role: "STUDENT",
    session: {
      provider: "FREIGHTER",
      publicKey: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    },
  }),
}));

vi.mock("@/lib/client/fetch-json", () => ({
  fetchJson,
}));

describe("CreateBondForm", () => {
  it("blocks submission when required fields are missing", async () => {
    const user = userEvent.setup();
    const { CreateBondForm } = await import("./create-bond-form");

    render(<CreateBondForm />);

    await user.click(screen.getByRole("button", { name: /create studybond/i }));

    await waitFor(() => {
      expect(fetchJson).not.toHaveBeenCalled();
    });
  });
});
