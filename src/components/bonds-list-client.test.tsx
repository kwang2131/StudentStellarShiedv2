import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BondsListClient } from "./bonds-list-client";

const cases = [
  {
    amount: "100",
    assetCode: "XLM",
    caseType: "DORM_DEPOSIT",
    createdAt: new Date().toISOString(),
    fundTxHash: null,
    id: "case-1",
    status: "CREATED" as const,
    studentName: "Alice",
    studentWalletAddress: "GA111111111111111111111111111111111111111111111111111A",
    targetCountry: "Canada",
    verifierName: "Maple Dorms",
  },
  {
    amount: "220",
    assetCode: "XLM",
    caseType: "TUITION_DEPOSIT",
    createdAt: new Date().toISOString(),
    fundTxHash: null,
    id: "case-2",
    status: "FUNDED" as const,
    studentName: "Bao",
    studentWalletAddress: "GB111111111111111111111111111111111111111111111111111A",
    targetCountry: "Australia",
    verifierName: "Uni Group",
  },
];

describe("BondsListClient", () => {
  it("filters bonds by search term", async () => {
    const user = userEvent.setup();
    render(<BondsListClient cases={cases} />);

    await user.type(
      screen.getByPlaceholderText(/search by student, verifier, country, or case id/i),
      "Alice",
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bao")).not.toBeInTheDocument();
  });
});
